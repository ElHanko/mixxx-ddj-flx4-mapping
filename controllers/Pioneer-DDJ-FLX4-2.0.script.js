// Pioneer-DDJ-FLX4-2.0.script.js
// =============================================================================
// Mixxx MIDI Mapping for Pioneer DDJ-FLX4
// =============================================================================
//
// Design goals:
// - Native FLX4 feel with deterministic behavior
// - Engine-driven LED state (no controller-side guessing)
// - Consistent short/long press semantics
// - Hercules-style logic where Pioneer defaults are weak
//
// This mapping is NOT a simple DDJ-400 port.
// Large parts were redesigned from scratch.
//
// -----------------------------------------------------------------------------
// Implemented Features
// -----------------------------------------------------------------------------
//
// Decks / Transport
// - Play / Cue with proper LED sync
// - Beat Sync (short = momentary, long = hold)
// - Vinyl mode with real hardware state control
// - Jog wheels with:
//     * Scratch / bend decision on touch
//     * Controller-reported vinyl mode awareness
//     * Loop-adjust priority
//
// Pads & Pad Modes
// - Hotcue
// - Beat Jump (static pad LEDs)
// - Beat Loop (static pad LEDs, separate from Beatjump)
// - Sampler mode:
//     * LED state machine (off / solid / blink)
//     * Short press: play / load
//     * Long press: stop
//     * Shift: stop / eject
// - Pad FX (Hercules-style):
//     * PAD FX1 → EffectUnit 1/2
//     * PAD FX2 → EffectUnit 3/4
//     * Slot, Unit, Routing and All-On logic
//     * Full engine → controller LED sync
// - Keyboard mode used as STEMS:
//     * Pads 1–4: stem mute
//     * Pads 5–8: momentary solo / hold-mute (configurable)
//
// Effects
// - Beat FX completely reworked:
//     * Proper slot-aware ON/OFF logic
//     * Any-slot-on → LED on
//     * Press while partially enabled → all off
//     * Deterministic routing per deck
//     * Engine-driven LED sync (no first-press desync)
//
// Looping
// - Dual loop behavior:
//     * SIMPLE mode (default Mixxx-style)
//     * HERCULES mode:
//         - loop_in / loop_out workflow
//         - sample-based jog adjust
//         - auto-timeout for adjust mode
// - RELOOP/EXIT with sensible fallback when no loop exists
//
// Quantize / Keylock
// - Short press: Quantize toggle
// - Long press: Keylock toggle
//
// Visual Feedback
// - Accurate VU meters with peak latch
// - Static pad LEDs for mode indication
// - Blink timers isolated per subsystem (Sampler / Loop / FX)
//
// -----------------------------------------------------------------------------
// Explicitly NOT implemented
// -----------------------------------------------------------------------------
// - Smart Fader
// - Smart CFX presets beyond basic toggle
// - Secondary experimental pad layers
//
// These are intentionally omitted to avoid half-working features.
//
// -----------------------------------------------------------------------------
// Notes
// -----------------------------------------------------------------------------
// - This mapping assumes Script-Binding for pads.
// - Complexity is intentional. Read the code before modifying.
// - Mixing timer buckets WILL break things.
//
// =============================================================================

var PioneerDDJFLX4 = {};

//
// LED definitions
//

PioneerDDJFLX4.lights = {
    beatFx: {
        status: 0x94,
        data1: 0x47,
    },
    shiftBeatFx: {
        status: 0x94,
        data1: 0x43,
    },
    SmartFader: {
        status: 0x96,
        data1: 0x01,
    },
    shiftSmartFader: {
        status: 0x96,
        data1: 0x09,
    },
    deck1: {
        vuMeter: { status: 0xB0, data1: 0x02 },
        playPause: { status: 0x90, data1: 0x0B },
        shiftPlayPause: { status: 0x90, data1: 0x47 },
        cue: { status: 0x90, data1: 0x0C },
        shiftCue: { status: 0x90, data1: 0x48 },
        hotcueMode: { status: 0x90, data1: 0x1B },
        keyboardMode: { status: 0x90, data1: 0x69 },
        padFX1Mode: { status: 0x90, data1: 0x1E },
        padFX2Mode: { status: 0x90, data1: 0x6B },
        beatJumpMode: { status: 0x90, data1: 0x20 },
        beatLoopMode: { status: 0x90, data1: 0x6D },
        samplerMode: { status: 0x90, data1: 0x22 },
        keyShiftMode: { status: 0x90, data1: 0x6F },
    },
    deck2: {
        vuMeter: { status: 0xB1, data1: 0x02 },
        playPause: { status: 0x91, data1: 0x0B },
        shiftPlayPause: { status: 0x91, data1: 0x47 },
        cue: { status: 0x91, data1: 0x0C },
        shiftCue: { status: 0x91, data1: 0x48 },
        hotcueMode: { status: 0x91, data1: 0x1B },
        keyboardMode: { status: 0x91, data1: 0x69 },
        padFX1Mode: { status: 0x91, data1: 0x1E },
        padFX2Mode: { status: 0x91, data1: 0x6B },
        beatJumpMode: { status: 0x91, data1: 0x20 },
        beatLoopMode: { status: 0x91, data1: 0x6D },
        samplerMode: { status: 0x91, data1: 0x22 },
        keyShiftMode: { status: 0x91, data1: 0x6F },
    },
};

//
// User-configurable behaviour
//

PioneerDDJFLX4.BROWSE_FOCUS_TOGGLE_ONLY = true;
PioneerDDJFLX4.BROWSE_LONGPRESS_MS = 300;
PioneerDDJFLX4.SAMPLER_LONGPRESS_MS = 350;
PioneerDDJFLX4.QUANTIZE_LONGPRESS_MS = 350;

PioneerDDJFLX4.LOOP_ADJUST_MODE = "simple";
PioneerDDJFLX4.loopAdjustStepBeats = 0.02;
PioneerDDJFLX4.reloopExitBeats = 4;
PioneerDDJFLX4.loopAdjustTimeoutMs = 5000;

PioneerDDJFLX4.quickJumpSize = 32;
PioneerDDJFLX4.fastSeekScale = 150;
PioneerDDJFLX4.bendScale = 0.8;
PioneerDDJFLX4.loopAdjustMultiply = 50;

PioneerDDJFLX4.STEMS_PAD5_8_MODE = "solo";

//
// Runtime state
//

PioneerDDJFLX4.shiftDown = false;
PioneerDDJFLX4._shiftDeck1 = false;
PioneerDDJFLX4._shiftDeck2 = false;

PioneerDDJFLX4.highResMSB = {
    "[Channel1]": {},
    "[Channel2]": {}
};

PioneerDDJFLX4.loopAdjustIn = [false, false];
PioneerDDJFLX4.loopAdjustOut = [false, false];

PioneerDDJFLX4._loopPendingOut = {
    "[Channel1]": false,
    "[Channel2]": false,
};

PioneerDDJFLX4._browseLP = {
    timer: { 0x41: -1 },
    fired: { 0x41: false },
};

PioneerDDJFLX4._samplerHold = {
    timer: {},
    fired: {},
};

PioneerDDJFLX4._quantizeLP = {
    timer: {},
    fired: {},
};

PioneerDDJFLX4._beatFxKnob = { msb: 0, lsb: 0 };
PioneerDDJFLX4._beatFxKnobLast = { msb: -1, lsb: -1 };

PioneerDDJFLX4._smartCfx = { enabled: false };

PioneerDDJFLX4._jogVinylFromController = [false, false];
PioneerDDJFLX4.wheelTouch = [false, false];
PioneerDDJFLX4._scratchEnabled = [false, false];
PioneerDDJFLX4._scratchAction = ["bend", "bend"];

if (!Array.isArray(PioneerDDJFLX4._vinylWanted)) {
    PioneerDDJFLX4._vinylWanted = [false, false];
}

//
// Timer buckets
//

PioneerDDJFLX4.timersSampler = PioneerDDJFLX4.timersSampler || {};
PioneerDDJFLX4.timersLoop = PioneerDDJFLX4.timersLoop || {};

PioneerDDJFLX4._loopAdjustTimeoutTimer = PioneerDDJFLX4._loopAdjustTimeoutTimer || {
    "[Channel1]": undefined,
    "[Channel2]": undefined,
};

//
// Mode / constants
//

PioneerDDJFLX4.alpha = 1.0 / 8;
PioneerDDJFLX4.beta = PioneerDDJFLX4.alpha / 32;
PioneerDDJFLX4.jogPPR = PioneerDDJFLX4.jogPPR || 720;
PioneerDDJFLX4.jogRPM = PioneerDDJFLX4.jogRPM || (33 + 1 / 3);
PioneerDDJFLX4.scratchScale = PioneerDDJFLX4.scratchScale || 1.0;
PioneerDDJFLX4.seekScratchMultiplier = PioneerDDJFLX4.seekScratchMultiplier || 4.0;

PioneerDDJFLX4.PADMODE = {
    HOTCUE:   "hotcue",
    KEYBOARD: "keyboard",
    PADFX1:   "padfx1",
    PADFX2:   "padfx2",
    BEATJUMP: "beatjump",
    BEATLOOP: "beatloop",
    SAMPLER:  "sampler",
    KEYSHIFT: "keyshift",
};

PioneerDDJFLX4.padMode = {
    "[Channel1]": PioneerDDJFLX4.PADMODE.HOTCUE,
    "[Channel2]": PioneerDDJFLX4.PADMODE.HOTCUE,
};

PioneerDDJFLX4.stemsPadsModesStatus = {
    "[Channel1]": [0x97, 0x98],
    "[Channel2]": [0x99, 0x9A],
};

PioneerDDJFLX4.stemMutePadsFirstControl = 0x40;
PioneerDDJFLX4.stemFxPadsFirstControl = 0x44;

PioneerDDJFLX4.pitchPadsModesStatus = {
    "[Channel1]": [0x97, 0x98],
    "[Channel2]": [0x99, 0x9A],
};

PioneerDDJFLX4.pitchPadsFirstControl = 0x70;

PioneerDDJFLX4.tempoRanges = [0.08, 0.16, 0.32, 0.64, 1.0];

//
// Generic helpers
//

PioneerDDJFLX4.setLed = function(status, note, on) {
    midi.sendShortMsg(status, note, on ? 0x7F : 0x00);
};

PioneerDDJFLX4.toggleLight = function(midiIn, active) {
    midi.sendShortMsg(midiIn.status, midiIn.data1, active ? 0x7F : 0);
};

PioneerDDJFLX4.sendKeepAlive = function() {
    midi.sendSysexMsg([0xF0, 0x00, 0x40, 0x05, 0x00, 0x00, 0x04, 0x05, 0x00, 0x50, 0x02, 0xF7], 12);
};

///////////////////////////////////////////////////////////////
// Deck index helper (robust)
// Always derive deck index from group, not from "channel" arg.
///////////////////////////////////////////////////////////////
PioneerDDJFLX4._deckIndexFromGroup = PioneerDDJFLX4._deckIndexFromGroup || function(group) {
    // group is usually "[Channel1]" / "[Channel2]"
    if (group === "[Channel1]") return 0;
    if (group === "[Channel2]") return 1;
    // fallback: try to parse ChannelN
    const m = /\[Channel(\d+)\]/.exec(group);
    if (m) {
        const d = (parseInt(m[1], 10) | 0) - 1;
        if (d === 0 || d === 1) return d;
    }
    return 0; // safe default
};


//
// Shift button
//


PioneerDDJFLX4.shiftDown = false;

PioneerDDJFLX4.shiftPressed = function(_channel, _control, value, status, _group) {
    const down = (value === 0x7F);

    // egal ob Deck1 oder Deck2: Shift zählt als "down"
    // (bei FLX4 kommen separate Events pro Deck; wir wollen OR-Verhalten)
    if (status === 0x90) {
        PioneerDDJFLX4._shiftDeck1 = down;
    } else if (status === 0x91) {
        PioneerDDJFLX4._shiftDeck2 = down;
    }

    PioneerDDJFLX4.shiftDown = !!PioneerDDJFLX4._shiftDeck1 || !!PioneerDDJFLX4._shiftDeck2;
};

//
// Init
//

PioneerDDJFLX4.init = function() {
    engine.setValue("[EffectRack1_EffectUnit1]", "show_focus", 1);

// --- Connections (WICHTIG: ChannelN, nicht Main) ---
engine.makeConnection("[Channel1]", "peak_indicator_left",  function(v){ PioneerDDJFLX4._latchPeak(1, v); });
engine.makeConnection("[Channel1]", "peak_indicator_right", function(v){ PioneerDDJFLX4._latchPeak(1, v); });

engine.makeConnection("[Channel2]", "peak_indicator_left",  function(v){ PioneerDDJFLX4._latchPeak(2, v); });
engine.makeConnection("[Channel2]", "peak_indicator_right", function(v){ PioneerDDJFLX4._latchPeak(2, v); });

// VU bleibt wie gehabt:
engine.makeConnection("[Channel1]", "vu_meter", PioneerDDJFLX4.vuMeterUpdate);
engine.makeConnection("[Channel2]", "vu_meter", PioneerDDJFLX4.vuMeterUpdate);

    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.deck1.vuMeter, false);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.deck2.vuMeter, false);

    engine.softTakeover("[Channel1]", "rate", true);
    engine.softTakeover("[Channel2]", "rate", true);
    engine.softTakeover("[EffectRack1_EffectUnit1_Effect1]", "meta", true);
    engine.softTakeover("[EffectRack1_EffectUnit1_Effect2]", "meta", true);
    engine.softTakeover("[EffectRack1_EffectUnit1_Effect3]", "meta", true);
//  engine.softTakeover("[EffectRack1_EffectUnit1]", "mix", true);
//  engine.softTakeover("[EffectRack1_EffectUnit1]", "super1", true);
//    engine.softTakeover("[EffectRack1_EffectUnit2]", "mix", true);
//    engine.softTakeover("[EffectRack1_EffectUnit2]", "super1", true);

const samplerCount = 16;
if (engine.getValue("[App]", "num_samplers") < samplerCount) {
    engine.setValue("[App]", "num_samplers", samplerCount);
}

for (let i = 1; i <= samplerCount; ++i) {
    const sg = `[Sampler${i}]`;

    // LED State Machine: off / solid / blink
    engine.makeConnection(sg, "track_loaded", PioneerDDJFLX4.samplerLedUpdate);
    engine.makeConnection(sg, "play",        PioneerDDJFLX4.samplerLedUpdate);

    // initialer LED-Refresh beim Start (sonst sind LEDs u.U. “alt” bis zum ersten Event)
    PioneerDDJFLX4.samplerLedUpdate(0, sg, 0);
}

    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.trackLoadedLED);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.trackLoadedLED);

    // play the "track loaded" animation on both decks at startup
    midi.sendShortMsg(0x9F, 0x00, 0x7F);
    midi.sendShortMsg(0x9F, 0x01, 0x7F);

    engine.makeConnection("[Channel1]", "loop_enabled", PioneerDDJFLX4.loopToggle);
    engine.makeConnection("[Channel2]", "loop_enabled", PioneerDDJFLX4.loopToggle);

    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.loopTrackLoaded);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.loopTrackLoaded);

// Beat FX: update LED when chain/unit OR any slot enable state changes
engine.makeConnection("[EffectRack1_EffectUnit1]", "enabled", PioneerDDJFLX4._updateBeatFxOnOffLed);
engine.makeConnection("[EffectRack1_EffectUnit2]", "enabled", PioneerDDJFLX4._updateBeatFxOnOffLed);

for (let unit = 1; unit <= 2; unit++) {
    for (let slot = 1; slot <= 3; slot++) {
        engine.makeConnection(
            `[EffectRack1_EffectUnit${unit}_Effect${slot}]`,
            "enabled",
            PioneerDDJFLX4._updateBeatFxOnOffLed
        );
    }
}

    // Smart CFX LED sync
    engine.makeConnection(PioneerDDJFLX4._qfxGroup(1), "enabled", PioneerDDJFLX4.smartCfxLedFromEngine);
    engine.makeConnection(PioneerDDJFLX4._qfxGroup(2), "enabled", PioneerDDJFLX4.smartCfxLedFromEngine);
    PioneerDDJFLX4.smartCfxLedFromEngine(0, "", "");

    // Register callbacks for each deck, when a file is loaded and the number of stems is available
    engine.makeConnection("[Channel1]", "stem_count", PioneerDDJFLX4.stemCountChanged);
    engine.makeConnection("[Channel2]", "stem_count", PioneerDDJFLX4.stemCountChanged);

    // Register callbacks for each stems of each decks, to change pad lights when muted/unmuted/FX
    for (let stem=1; stem<=4; stem++) {
        for (let deck=1; deck<=2; deck++) {
            engine.makeConnection(`[Channel${deck}_Stem${stem}]`, "mute", PioneerDDJFLX4.stemMuteChanged);
            engine.makeConnection(`[QuickEffectRack1_[Channel${deck}_Stem${stem}]]`, "enabled", PioneerDDJFLX4.stemFxChanged);
        }
    }

    // Register callbacks for each deck, when a file is loaded to reset pitch shift
    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.pitchAdjusted);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.pitchAdjusted);

    // Register callbacks for each deck, when the pitch shift is modified
    engine.makeConnection("[Channel1]", "pitch_adjust", PioneerDDJFLX4.pitchAdjusted);
    engine.makeConnection("[Channel2]", "pitch_adjust", PioneerDDJFLX4.pitchAdjusted);

    // --- PAD FX LED SYNC (Engine -> Controller) ---
    [1,2,3,4].forEach((unitIdx) => {
        const U = `[EffectRack1_EffectUnit${unitIdx}]`;

        // Unit enable
        engine.makeConnection(U, "enabled", () => {
            PioneerDDJFLX4.updatePadFxUI("[Channel1]");
            PioneerDDJFLX4.updatePadFxUI("[Channel2]");
        });

        // Slots 1–3
        [1,2,3].forEach((slotIdx) => {
            engine.makeConnection(
                `[EffectRack1_EffectUnit${unitIdx}_Effect${slotIdx}]`,
                "enabled",
                () => {
                    PioneerDDJFLX4.updatePadFxUI("[Channel1]");
                    PioneerDDJFLX4.updatePadFxUI("[Channel2]");
                }
            );
        });

        // Routing Deck 1 / Deck 2
        engine.makeConnection(U, "group_[Channel1]_enable", () => {
            PioneerDDJFLX4.updatePadFxUI("[Channel1]");
        });
        engine.makeConnection(U, "group_[Channel2]_enable", () => {
            PioneerDDJFLX4.updatePadFxUI("[Channel2]");
        });
    });

// ------------------- DEFAULT PAD MODE -------------------
PioneerDDJFLX4.padMode = PioneerDDJFLX4.padMode || {};
PioneerDDJFLX4.padMode["[Channel1]"] = PioneerDDJFLX4.PADMODE.HOTCUE;
PioneerDDJFLX4.padMode["[Channel2]"] = PioneerDDJFLX4.PADMODE.HOTCUE;

    // initialize Beat FX routing + LED state
    PioneerDDJFLX4._applyBeatFxRouting();

// … nachdem Routing gesetzt ist / am Ende von init():
PioneerDDJFLX4._updateBeatFxOnOffLed();

    PioneerDDJFLX4.keepAliveTimer = engine.beginTimer(200, PioneerDDJFLX4.sendKeepAlive);

    // query the controller for current control positions on startup
    PioneerDDJFLX4.sendKeepAlive(); // the query seems to double as a keep alive message


    // Ensure controller vinyl state is known on startup (fixes "need to press twice")
    // _applyVinylState expects (deckIdx, on) — your old call passed only one arg and
    // accidentally targeted only deck 1 due to JS coercion.
    if (typeof PioneerDDJFLX4._applyVinylState === "function") {
        PioneerDDJFLX4._applyVinylState(0, false);
        PioneerDDJFLX4._applyVinylState(1, false);
    }
};

//
// Library / Browser: BROWSE press handling
// 0x41 = BROWSE
// 0x42 = SHIFT + BROWSE (currently unused)
//
// behaviour:
// - simple mode: MoveFocusForward
// - toggle mode: only switch between Tree view and Tracks table
//

PioneerDDJFLX4.browsePress = function(_channel, control, value, _status, _group) {
    if (value !== 0x7F) return;

    // SHIFT+BROWSE currently unused
    if (control === 0x42) return;
    if (control !== 0x41) return;

    if (PioneerDDJFLX4.BROWSE_FOCUS_TOGGLE_ONLY) {
        const focus = engine.getValue("[Library]", "focused_widget");

        // 3 = Tracks table -> go to Tree view
        if (focus === 3) {
            engine.setValue("[Library]", "focused_widget", 2);
            return;
        }

        // 2 = Tree view -> go to Tracks table
        if (focus === 2) {
            engine.setValue("[Library]", "focused_widget", 3);
            return;
        }

        // Search bar / none / anything else -> force Tracks table
        engine.setValue("[Library]", "focused_widget", 3);
        return;
    }

    // Default behaviour
    script.triggerControl("[Library]", "MoveFocusForward");
};

//
// Waveform zoom (fix: ignore release/unknown values)
//

PioneerDDJFLX4.waveformZoom = function (_ch, _ctrl, value /* 0x01 / 0x7F */, _status, _group) {
    // FLX4 sends typically 0x7F (one dir) and 0x01 (other dir). Ignore 0x00 release etc.
    let dir = null;
    if (value === 0x7F) dir = "up";
    else if (value === 0x01) dir = "down";
    else return;

    // "global" feel: apply to both decks (wie Hercules)
    script.triggerControl("[Channel1]", "waveform_zoom_" + dir, 50);
    script.triggerControl("[Channel2]", "waveform_zoom_" + dir, 50);
};

// -------------------
// VU Meter mapping (Mixxx -> FLX4)
// FLX4 expects bottom-lit bargraph from 0x26..0x7F with color zones:
//   Green1:  0x26..0x40
//   Green2:  0x41..0x56
//   Orange1: 0x57..0x64
//   Orange2: 0x65..0x76
//   Red:     0x77..0x7F
//
// Mixxx vu_meter is 0..1 (not necessarily matching GUI colors 1:1),
// so we apply a curve to avoid "too early red" on hardware.
PioneerDDJFLX4.VU = PioneerDDJFLX4.VU || {
    MIN: 0x26,
    MAX: 0x7F,

    // vu_meter hat in Mixxx "default" Range und kann > 1.0 sein.
    // INPUT_MAX bestimmt, ab welchem Wert du "voll" anzeigen willst.
    INPUT_MAX: 1.2,      // Try 1.2..1.8 je nach Setup

    CURVE_EXP: 1,
    GAIN: 1.0,

    // Rotzone-Start (deine Zonen: Red 0x77..0x7F)
    RED_START: 0x77
};

// --- Peak latch (damit rot sichtbar wird) ---
PioneerDDJFLX4._peakHoldMs = 250;
PioneerDDJFLX4._peakTimerL = 0;
PioneerDDJFLX4._peakTimerR = 0;

PioneerDDJFLX4._latchPeak = function(deck, value) {
    if (!value) return; // nur bei "1" latchen

    if (deck === 1) {
        PioneerDDJFLX4._peakL = 1;
        if (PioneerDDJFLX4._peakTimerL) engine.stopTimer(PioneerDDJFLX4._peakTimerL);
        PioneerDDJFLX4._peakTimerL = engine.beginTimer(PioneerDDJFLX4._peakHoldMs, function() {
            PioneerDDJFLX4._peakL = 0;
            PioneerDDJFLX4._peakTimerL = 0;
        }, true);
    } else if (deck === 2) {
        PioneerDDJFLX4._peakR = 1;
        if (PioneerDDJFLX4._peakTimerR) engine.stopTimer(PioneerDDJFLX4._peakTimerR);
        PioneerDDJFLX4._peakTimerR = engine.beginTimer(PioneerDDJFLX4._peakHoldMs, function() {
            PioneerDDJFLX4._peakR = 0;
            PioneerDDJFLX4._peakTimerR = 0;
        }, true);
    }
};

// Bargraph update (per-channel LED send)
PioneerDDJFLX4.vuMeterUpdate = function(value, group) {
    let v = Number(value);
    if (!Number.isFinite(v)) v = 0;
    v = Math.max(0, v);

    // apply gain
    v *= PioneerDDJFLX4.VU.GAIN;

    // normalize to 0..1 using INPUT_MAX (statt hart bei 1.0 abzuschneiden)
    const inMax = PioneerDDJFLX4.VU.INPUT_MAX;
    v = Math.max(0, Math.min(inMax, v)) / inMax;

    // curve
    v = Math.pow(v, PioneerDDJFLX4.VU.CURVE_EXP);

    const min = PioneerDDJFLX4.VU.MIN;
    const max = PioneerDDJFLX4.VU.MAX;
    let newVal = min + Math.round(v * (max - min));

    if (group === "[Channel1]" && PioneerDDJFLX4._peakL) newVal = Math.max(newVal, PioneerDDJFLX4.VU.RED_START);
    else if (group === "[Channel2]" && PioneerDDJFLX4._peakR) newVal = Math.max(newVal, PioneerDDJFLX4.VU.RED_START);

    if (v < 0.02) newVal = 0x00;

    switch (group) {
    case "[Channel1]":
        midi.sendShortMsg(0xB0, 0x02, newVal & 0x7F);
        break;
    case "[Channel2]":
        midi.sendShortMsg(0xB1, 0x02, newVal & 0x7F);
        break;
    }
};

// ------------------- LOAD / Instant Doubles -------------------

PioneerDDJFLX4.LOAD_DOUBLEPRESS_MS = 400;

PioneerDDJFLX4._loadPress = PioneerDDJFLX4._loadPress || {
    timer: {
        "[Channel1]": 0,
        "[Channel2]": 0,
    },
    waiting: {
        "[Channel1]": false,
        "[Channel2]": false,
    },
};

PioneerDDJFLX4._otherDeck = function(group) {
    return group === "[Channel1]" ? "[Channel2]" : "[Channel1]";
};

PioneerDDJFLX4._doNormalLoad = function(group) {
    engine.setValue(group, "LoadSelectedTrack", 1);
};

PioneerDDJFLX4._doInstantDouble = function(targetGroup) {
    const sourceGroup = PioneerDDJFLX4._otherDeck(targetGroup);

    // Quelle muss geladen sein
    if (engine.getValue(sourceGroup, "track_loaded") !== 1) {
        return false;
    }

    // Track von Source nach Target klonen
    engine.setValue(targetGroup, "CloneFromDeck", sourceGroup === "[Channel1]" ? 1 : 2);

    // Wiedergabeposition übernehmen
    const playpos = engine.getValue(sourceGroup, "playposition");
    if (Number.isFinite(playpos)) {
        engine.setValue(targetGroup, "playposition", playpos);
    }

    // Wenn Source läuft, Target auch starten
    if (engine.getValue(sourceGroup, "play") === 1) {
        engine.setValue(targetGroup, "play", 1);
    }

    return true;
};

PioneerDDJFLX4.loadPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F) return;

    const state = PioneerDDJFLX4._loadPress;

    // Zweiter Druck innerhalb des Fensters => Instant Double
    if (state.waiting[group]) {
        if (state.timer[group]) {
            engine.stopTimer(state.timer[group]);
            state.timer[group] = 0;
        }
        state.waiting[group] = false;

        // Wenn Instant Double nicht geht, lieber gar keinen Unsinn machen
        PioneerDDJFLX4._doInstantDouble(group);
        return;
    }

    // Erster Druck => kurz warten, ob zweiter Druck kommt
    state.waiting[group] = true;
    state.timer[group] = engine.beginTimer(PioneerDDJFLX4.LOAD_DOUBLEPRESS_MS, function() {
        state.timer[group] = 0;
        state.waiting[group] = false;
        PioneerDDJFLX4._doNormalLoad(group);
    }, true);
};

// ------------------- SHIFT + LOAD -------------------
//
// FLX4 SHIFT + LOAD functions
//
// Deck 1 (0x68):
//   Toggle Mixxx library maximize/minimize.
//   Useful to quickly switch between full library view and normal layout.
//
// Deck 2 (0x7A):
//   Open folder / expand tree in library (MoveRight).
//

PioneerDDJFLX4.loadShiftPressed = function(_channel, control, value, _status, _group) {
    if (value !== 0x7F) return;

    // SHIFT + LOAD left → toggle library maximize
    if (control === 0x68) {
        script.toggleControl("[Master]", "maximize_library");
        return;
    }

    // SHIFT + LOAD right → open folder in library tree
    if (control === 0x7A) {
        script.triggerControl("[Library]", "MoveRight");
    }
};

//
// Effects (Beat FX rework)
//

// FX1 = EffectUnit1 (Deck 1), FX2 = EffectUnit2 (Deck 2)
PioneerDDJFLX4._beatFx = {
    unit1: "[EffectRack1_EffectUnit1]",
    unit2: "[EffectRack1_EffectUnit2]",
    assign: { ch1: true, ch2: true }, // default: 1&2
};

// ---- target selection (CH1 / CH2 / 1&2) ----
PioneerDDJFLX4._beatFxTargets = function() {
    const t = [];
    if (PioneerDDJFLX4._beatFx.assign.ch1) t.push(PioneerDDJFLX4._beatFx.unit1);
    if (PioneerDDJFLX4._beatFx.assign.ch2) t.push(PioneerDDJFLX4._beatFx.unit2);
    return t;
};

// ---- helpers: unit index, routing key, slot state ----
PioneerDDJFLX4._beatFxUnitIdx = function(u) {
    const m = /^\[EffectRack1_EffectUnit(\d+)\]$/.exec(u);
    return m ? Number(m[1]) : null;
};

PioneerDDJFLX4._beatFxRouteKey = function(u) {
    // fixed mapping: Unit1 -> Channel1, Unit2 -> Channel2
    if (u === PioneerDDJFLX4._beatFx.unit1) return "group_[Channel1]_enable";
    if (u === PioneerDDJFLX4._beatFx.unit2) return "group_[Channel2]_enable";
    return null;
};

PioneerDDJFLX4._beatFxSlotGroup = function(unitIdx, slotIdx) {
    return `[EffectRack1_EffectUnit${unitIdx}_Effect${slotIdx}]`;
};

PioneerDDJFLX4._beatFxAnySlotOn = function(u) {
    const unitIdx = PioneerDDJFLX4._beatFxUnitIdx(u);
    if (!unitIdx) return false;

    for (let i = 1; i <= 3; i++) {
        if (engine.getValue(PioneerDDJFLX4._beatFxSlotGroup(unitIdx, i), "enabled") > 0.5) return true;
    }
    return false;
};

PioneerDDJFLX4._beatFxAllSlotsOn = function(u) {
    const unitIdx = PioneerDDJFLX4._beatFxUnitIdx(u);
    if (!unitIdx) return false;

    const Uon = engine.getValue(u, "enabled") > 0.5;
    if (!Uon) return false;

    for (let i = 1; i <= 3; i++) {
        if (!(engine.getValue(PioneerDDJFLX4._beatFxSlotGroup(unitIdx, i), "enabled") > 0.5)) return false;
    }
    return true;
};

// ---- routing (called by CH select + also used defensively on toggle) ----
PioneerDDJFLX4._applyBeatFxRouting = function() {
    const u1 = PioneerDDJFLX4._beatFx.unit1;
    const u2 = PioneerDDJFLX4._beatFx.unit2;

    // Unit1 processes Channel1 (if selected)
    engine.setValue(u1, "group_[Channel1]_enable", PioneerDDJFLX4._beatFx.assign.ch1 ? 1 : 0);
    engine.setValue(u1, "group_[Channel2]_enable", 0);

    // Unit2 processes Channel2 (if selected)
    engine.setValue(u2, "group_[Channel2]_enable", PioneerDDJFLX4._beatFx.assign.ch2 ? 1 : 0);
    engine.setValue(u2, "group_[Channel1]_enable", 0);

    PioneerDDJFLX4._updateBeatFxOnOffLed();
};

PioneerDDJFLX4._armBeatFxUnit = function(u) {
    const routeKey = PioneerDDJFLX4._beatFxRouteKey(u);
    if (!routeKey) return;

    const enable = (u === PioneerDDJFLX4._beatFx.unit1)
        ? (PioneerDDJFLX4._beatFx.assign.ch1 ? 1 : 0)
        : (PioneerDDJFLX4._beatFx.assign.ch2 ? 1 : 0);

    // route ON for its intended deck, OFF otherwise
    try { engine.setValue(u, routeKey, enable); } catch (e) {}
};

// ---- LED ----
PioneerDDJFLX4._setBeatFxOnOffLed = function(on) {
    midi.sendShortMsg(0x94, 0x47, on ? 0x7F : 0x00);
    midi.sendShortMsg(0x95, 0x47, on ? 0x7F : 0x00);
};

PioneerDDJFLX4._updateBeatFxOnOffLed = function() {
    const targets = PioneerDDJFLX4._beatFxTargets();
    const anySlotOn = targets.some((u) => PioneerDDJFLX4._beatFxAnySlotOn(u));
    PioneerDDJFLX4._setBeatFxOnOffLed(anySlotOn);
};

// ---- BEAT FX SELECT: intentionally unused (per your plan) ----
PioneerDDJFLX4.beatFxSelectPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;
};
PioneerDDJFLX4.beatFxSelectShiftPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;
};

// ---- BEAT LEFT/RIGHT: cycle chain presets (targets only) ----
PioneerDDJFLX4.beatFxLeftPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;
    PioneerDDJFLX4._beatFxTargets().forEach((u) => engine.setValue(u, "prev_chain_preset", 1));
};

PioneerDDJFLX4.beatFxRightPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;
    PioneerDDJFLX4._beatFxTargets().forEach((u) => engine.setValue(u, "next_chain_preset", 1));
};

// ---- Channel selector: CH1 / CH2 / 1&2 ----
PioneerDDJFLX4.beatFxChannel1 = function(_channel, _control, value) {
    PioneerDDJFLX4._beatFx.assign.ch1 = (value === 0x7F);
    PioneerDDJFLX4._applyBeatFxRouting();
};

PioneerDDJFLX4.beatFxChannel2 = function(_channel, _control, value) {
    PioneerDDJFLX4._beatFx.assign.ch2 = (value === 0x7F);
    PioneerDDJFLX4._applyBeatFxRouting();
};

// ---- LEVEL/DEPTH knob: 14-bit (MSB 0x02, LSB 0x22 on status 0xB4) ----
// normal: super1, SHIFT: mix
// Defaults anlegen, falls noch nicht vorhanden
PioneerDDJFLX4._beatFxKnob = PioneerDDJFLX4._beatFxKnob || { msb: 0, lsb: 0 };
PioneerDDJFLX4._beatFxKnobLast = PioneerDDJFLX4._beatFxKnobLast || { msb: -1, lsb: -1 };

PioneerDDJFLX4.beatFxLevelDepthRotate = function(_channel, control, value) {
    if (control === 0x02) {
        if (PioneerDDJFLX4._beatFxKnobLast.msb === value) return;
        PioneerDDJFLX4._beatFxKnobLast.msb = value;
        PioneerDDJFLX4._beatFxKnob.msb = value & 0x7F;
    } else if (control === 0x22) {
        if (PioneerDDJFLX4._beatFxKnobLast.lsb === value) return;
        PioneerDDJFLX4._beatFxKnobLast.lsb = value;
        PioneerDDJFLX4._beatFxKnob.lsb = value & 0x7F;
    } else {
        return;
    }

    const full14 = (PioneerDDJFLX4._beatFxKnob.msb << 7) | PioneerDDJFLX4._beatFxKnob.lsb;
    const v = full14 / 0x3FFF;

    const isShift = !!PioneerDDJFLX4.shiftDown;
    const key = isShift ? "mix" : "super1";

    (PioneerDDJFLX4._beatFxTargets ? PioneerDDJFLX4._beatFxTargets() : []).forEach((u) => {
        engine.setParameter(u, key, v);
    });
};
// ---- ON/OFF: toggle Unit + Slots 1..3 together (Hercules-style) ----
PioneerDDJFLX4._beatFxSetUnitAndSlots = function(u, on) {
    const unitIdx = PioneerDDJFLX4._beatFxUnitIdx(u);
    if (!unitIdx) return;

    const S = (n) => PioneerDDJFLX4._beatFxSlotGroup(unitIdx, n);

    // routing for the intended deck
    PioneerDDJFLX4._armBeatFxUnit(u);

    if (!on) {
        // OFF: slots first, then unit, then optionally unrouted
        engine.setValue(S(3), "enabled", 0);
        engine.setValue(S(2), "enabled", 0);
        engine.setValue(S(1), "enabled", 0);
        engine.setValue(u, "enabled", 0);

        const routeKey = PioneerDDJFLX4._beatFxRouteKey(u);
        if (routeKey) {
            try { engine.setValue(u, routeKey, 0); } catch (e) {}
        }
        return;
    }

    // ON: route + unit first, then slots
    engine.setValue(u, "enabled", 1);
    engine.setValue(S(1), "enabled", 1);
    engine.setValue(S(2), "enabled", 1);
    engine.setValue(S(3), "enabled", 1);
};

PioneerDDJFLX4.beatFxOnOffPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;

    const targets = PioneerDDJFLX4._beatFxTargets();
    if (!targets.length) return;

    const anyOn = targets.some((u) => PioneerDDJFLX4._beatFxAnySlotOn(u));

    // Hercules-/Pioneer-Logik:
    // irgendwas an -> alles aus
    // alles aus     -> alles an
    targets.forEach((u) => {
        PioneerDDJFLX4._beatFxSetUnitAndSlots(u, !anyOn);
    });

    PioneerDDJFLX4._updateBeatFxOnOffLed();
};

PioneerDDJFLX4.beatFxOnOffShiftPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;

    PioneerDDJFLX4._beatFxTargets().forEach((u) => PioneerDDJFLX4._beatFxSetUnitAndSlots(u, false));
    PioneerDDJFLX4._updateBeatFxOnOffLed();
};
// --- SMART CFX (Version A: universal) ---
PioneerDDJFLX4._smartCfx = { enabled: false };

PioneerDDJFLX4._qfxGroup = function(ch) {
    return `[QuickEffectRack1_[Channel${ch}]]`;
};

// Keep SMART CFX LED in sync with Mixxx state (and on startup)
PioneerDDJFLX4.smartCfxLedFromEngine = function(_value, _group, _control) {
    const e1 = engine.getValue(PioneerDDJFLX4._qfxGroup(1), "enabled");
    const e2 = engine.getValue(PioneerDDJFLX4._qfxGroup(2), "enabled");
    const on = (e1 > 0.5) || (e2 > 0.5);
    PioneerDDJFLX4._smartCfx.enabled = on;
    PioneerDDJFLX4.setLed(0x96, 0x00, on);
};

PioneerDDJFLX4.smartCfxPress = function(_ch, control, value, _status, _group) {
    if (value !== 0x7F) return; // only on press

    const isShiftVariant = (control === 0x08); // SHIFT+SMART CFX note
    const g1 = PioneerDDJFLX4._qfxGroup(1);
    const g2 = PioneerDDJFLX4._qfxGroup(2);

    if (isShiftVariant) {
        // Cycle chain preset
        engine.setValue(g1, "next_chain_preset", 1);
        engine.setValue(g2, "next_chain_preset", 1);
        return;
    }

    // Toggle Smart CFX mode => toggle QuickEffectRack enabled
    PioneerDDJFLX4._smartCfx.enabled = !PioneerDDJFLX4._smartCfx.enabled;

    engine.setValue(g1, "enabled", PioneerDDJFLX4._smartCfx.enabled ? 1 : 0);
    engine.setValue(g2, "enabled", PioneerDDJFLX4._smartCfx.enabled ? 1 : 0);

    // LED feedback (SMART CFX button)
    PioneerDDJFLX4.setLed(0x96, 0x00, PioneerDDJFLX4._smartCfx.enabled);
};
///////////////////////////////////////////////////////////////
// PAD FX (Hercules-style) for FLX4
// - PAD FX1 Mode: Deck1->Unit1, Deck2->Unit2
// - PAD FX2 Mode: Deck1->Unit3, Deck2->Unit4
//
// Pads (within PAD FX modes):
//  1-3 : toggle slot 1-3
//  4   : toggle unit enabled
//  5   : toggle routing to own deck (group_[ChannelX]_enable)
//  6   : toggle routing to other deck
//  8   : toggle ALL slots (all-on <-> all-off)
//  7   : unused
///////////////////////////////////////////////////////////////

PioneerDDJFLX4._padLedStatusesForGroup = function(group) {
    // deck1: 0x97 normal, 0x98 shift
    // deck2: 0x99 normal, 0x9A shift
    return (group === "[Channel1]") ? [0x97, 0x98] : [0x99, 0x9A];
};

PioneerDDJFLX4._padLed = function(group, midino, on) {
    const sts = PioneerDDJFLX4._padLedStatusesForGroup(group);
    const v = on ? 0x7F : 0x00;
    sts.forEach((s) => midi.sendShortMsg(s, midino, v));
};

PioneerDDJFLX4._fxUnitsForDeckAndMode = function(group) {
    const deck = (group === "[Channel1]") ? 1 : 2;
    const mode = PioneerDDJFLX4.padMode[group];

    if (mode === "padfx1") {
        return deck === 1 ? 1 : 2;
    }
    if (mode === "padfx2") {
        return deck === 1 ? 3 : 4;
    }
    return null;
};

PioneerDDJFLX4._fxRouteKey = function(group) {
    return `group_${group}_enable`; // e.g. group_[Channel1]_enable
};

PioneerDDJFLX4._otherDeckGroup = function(group) {
    return (group === "[Channel1]") ? "[Channel2]" : "[Channel1]";
};

PioneerDDJFLX4._U = function(unitIdx) {
    return `[EffectRack1_EffectUnit${unitIdx}]`;
};

PioneerDDJFLX4._S = function(unitIdx, slotIdx) {
    return `[EffectRack1_EffectUnit${unitIdx}_Effect${slotIdx}]`;
};

PioneerDDJFLX4._slotEnabled = function(unitIdx, slotIdx) {
    return engine.getValue(PioneerDDJFLX4._S(unitIdx, slotIdx), "enabled") > 0.5;
};

PioneerDDJFLX4._anySlotOn = function(unitIdx) {
    return PioneerDDJFLX4._slotEnabled(unitIdx, 1) ||
           PioneerDDJFLX4._slotEnabled(unitIdx, 2) ||
           PioneerDDJFLX4._slotEnabled(unitIdx, 3);
};

PioneerDDJFLX4._allSlotsOn = function(unitIdx) {
    const Uon = engine.getValue(PioneerDDJFLX4._U(unitIdx), "enabled") > 0.5;
    return Uon &&
           PioneerDDJFLX4._slotEnabled(unitIdx, 1) &&
           PioneerDDJFLX4._slotEnabled(unitIdx, 2) &&
           PioneerDDJFLX4._slotEnabled(unitIdx, 3);
};

PioneerDDJFLX4._autoArmIfNeeded = function(unitIdx, group) {
    // Hercules-like: if any slot is on -> ensure Unit enabled + routing to current deck ON
    if (!PioneerDDJFLX4._anySlotOn(unitIdx)) return;

    const U = PioneerDDJFLX4._U(unitIdx);
    const rk = PioneerDDJFLX4._fxRouteKey(group);

    if (engine.getValue(U, "enabled") <= 0.5) engine.setValue(U, "enabled", 1);
    if (engine.getValue(U, rk) <= 0.5) engine.setValue(U, rk, 1);
};

PioneerDDJFLX4._setUnitAndSlots = function(unitIdx, group, on) {
    const U = PioneerDDJFLX4._U(unitIdx);
    const S1 = PioneerDDJFLX4._S(unitIdx, 1);
    const S2 = PioneerDDJFLX4._S(unitIdx, 2);
    const S3 = PioneerDDJFLX4._S(unitIdx, 3);

    const rk = PioneerDDJFLX4._fxRouteKey(group);

    if (!on) {
        // OFF: slots first, then unit, then optionally unrouted
        engine.setValue(S3, "enabled", 0);
        engine.setValue(S2, "enabled", 0);
        engine.setValue(S1, "enabled", 0);
        engine.setValue(U,  "enabled", 0);
        try { engine.setValue(U, rk, 0); } catch (e) {}
        return;
    }

    // ON: route + unit first, then slots
    try { engine.setValue(U, rk, 1); } catch (e) {}
    engine.setValue(U, "enabled", 1);
    engine.setValue(S1, "enabled", 1);
    engine.setValue(S2, "enabled", 1);
    engine.setValue(S3, "enabled", 1);
};

PioneerDDJFLX4.updatePadFxUI = function(group) {
    const unitIdx = PioneerDDJFLX4._fxUnitsForDeckAndMode(group);
    if (!unitIdx) return;

    // auto-arm if needed (prevents “it’s on but does nothing”)
    PioneerDDJFLX4._autoArmIfNeeded(unitIdx, group);

    const mode = PioneerDDJFLX4.padMode[group];
    const base = (mode === "padfx1") ? 0x10 : 0x50; // pad notes: FX1=16..23, FX2=80..87

    const U = PioneerDDJFLX4._U(unitIdx);
    const rkOwn   = PioneerDDJFLX4._fxRouteKey(group);
    const rkOther = PioneerDDJFLX4._fxRouteKey(PioneerDDJFLX4._otherDeckGroup(group));

    const unitOn  = engine.getValue(U, "enabled") > 0.5;
    const rOwnOn  = engine.getValue(U, rkOwn) > 0.5;
    const rOthOn  = engine.getValue(U, rkOther) > 0.5;

    // pads 1-3: slots
    PioneerDDJFLX4._padLed(group, base + 0, PioneerDDJFLX4._slotEnabled(unitIdx, 1));
    PioneerDDJFLX4._padLed(group, base + 1, PioneerDDJFLX4._slotEnabled(unitIdx, 2));
    PioneerDDJFLX4._padLed(group, base + 2, PioneerDDJFLX4._slotEnabled(unitIdx, 3));

    // pad 4: unit enabled
    PioneerDDJFLX4._padLed(group, base + 3, unitOn);

    // pad 5: routing own deck
    PioneerDDJFLX4._padLed(group, base + 4, rOwnOn);

    // pad 6: routing other deck
    PioneerDDJFLX4._padLed(group, base + 5, rOthOn);

    // pad 7: unused off
    PioneerDDJFLX4._padLed(group, base + 6, false);

    // pad 8: any slot on (quick status)
    PioneerDDJFLX4._padLed(group, base + 7, PioneerDDJFLX4._anySlotOn(unitIdx));
};

PioneerDDJFLX4._toggleRoute = function(unitIdx, routeGroup) {
    const U = PioneerDDJFLX4._U(unitIdx);
    const rk = PioneerDDJFLX4._fxRouteKey(routeGroup);
    const cur = engine.getValue(U, rk) > 0.5;
    engine.setValue(U, rk, cur ? 0 : 1);
};

PioneerDDJFLX4.padFxPadPressed = function(_ch, control, value, _st, group) {
    if (value !== 0x7F) return;

    const unitIdx = PioneerDDJFLX4._fxUnitsForDeckAndMode(group);
    if (!unitIdx) return;

    const mode = PioneerDDJFLX4.padMode[group];
    const base = (mode === "padfx1") ? 0x10 : 0x50;

    const idx = (control - base) + 1; // 1..8
    const U = PioneerDDJFLX4._U(unitIdx);

    if (idx >= 1 && idx <= 3) {
        const S = PioneerDDJFLX4._S(unitIdx, idx);
        const cur = engine.getValue(S, "enabled") > 0.5;
        engine.setValue(S, "enabled", cur ? 0 : 1);
        // auto-arm prevents “slot on but routed off”
        PioneerDDJFLX4._autoArmIfNeeded(unitIdx, group);
        PioneerDDJFLX4.updatePadFxUI(group);
        return;
    }

    if (idx === 4) {
        const cur = engine.getValue(U, "enabled") > 0.5;
        engine.setValue(U, "enabled", cur ? 0 : 1);
        PioneerDDJFLX4.updatePadFxUI(group);
        return;
    }

    if (idx === 5) {
        PioneerDDJFLX4._toggleRoute(unitIdx, group);
        PioneerDDJFLX4.updatePadFxUI(group);
        return;
    }

    if (idx === 6) {
        PioneerDDJFLX4._toggleRoute(unitIdx, PioneerDDJFLX4._otherDeckGroup(group));
        PioneerDDJFLX4.updatePadFxUI(group);
        return;
    }

    if (idx === 8) {
        const allOn = PioneerDDJFLX4._allSlotsOn(unitIdx);
        PioneerDDJFLX4._setUnitAndSlots(unitIdx, group, !allOn);
        PioneerDDJFLX4.updatePadFxUI(group);
        return;
    }
};

// mode switches (call these from your PAD MODE buttons)
PioneerDDJFLX4.setPadModePadFx1 = function(_ch, _ctrl, value, _st, group) {
    if (value !== 0x7F) return;
    PioneerDDJFLX4.padMode[group] = "padfx1";
    PioneerDDJFLX4.updatePadFxUI(group);
};

PioneerDDJFLX4.setPadModePadFx2 = function(_ch, _ctrl, value, _st, group) {
    if (value !== 0x7F) return;
    PioneerDDJFLX4.padMode[group] = "padfx2";
    PioneerDDJFLX4.updatePadFxUI(group);
};
///////////////////////////////////////////////////////////////
// Loop Features (FLX4) – dual mode switch + auto-timeout
//
// Goals:
// - RELOOP/EXIT:   Loop ON  -> exit/reloop_toggle
//                 Loop OFF -> activate fixed N-beat loop (default 4)
// - LOOP IN / OUT buttons:
//    Mode "simple":    wie bisher: Adjust-Modus nur wenn Loop aktiv
//    Mode "hercules":  wenn Loop aus:
//                        IN  -> setzt loop_in + Pending-Out (OUT fehlt noch)
//                        OUT -> setzt loop_out (und aktiviert Loop)
//                      wenn Loop an:
//                        IN/OUT toggeln Adjust-Modus + Blink-LEDs
// - LED/Blinking bleibt zentral über loop_enabled callback + Blink-Timer
// - Auto-exit: wenn 5s kein Adjust (Jog) kommt -> Adjust-Modus aus + LEDs zurück
///////////////////////////////////////////////////////////////

// ------------------- CONFIG SWITCH -------------------
// "simple"  = dein bisheriges Verhalten (DEFAULT)
// "hercules"= Hercules-Style loop_in/loop_out + Pending-Out + sample-based Adjust
PioneerDDJFLX4.LOOP_ADJUST_MODE = "simple"; // <- "simple" oder "hercules"

// Schrittweite fürs Hercules-style sample based adjust (Anteil eines Beats pro Jog-Tick)
PioneerDDJFLX4.loopAdjustStepBeats = 0.02; // 2% Beat pro Tick

// Fixe Loop-Länge für RELOOP/EXIT wenn kein Loop aktiv ist
PioneerDDJFLX4.reloopExitBeats = 4;

// Auto-timeout für Adjust-Mode (ms)
PioneerDDJFLX4.loopAdjustTimeoutMs = 5000;

// ------------------- STATE -------------------
// pro Deck index (0/1) für Adjust-Flags (werden in beiden Modes genutzt)
PioneerDDJFLX4.loopAdjustIn  = PioneerDDJFLX4.loopAdjustIn  || [false, false];
PioneerDDJFLX4.loopAdjustOut = PioneerDDJFLX4.loopAdjustOut || [false, false];

// Pending-Out (nur relevant in "hercules"): loop_in gesetzt, loop_out fehlt noch
PioneerDDJFLX4._loopPendingOut = PioneerDDJFLX4._loopPendingOut || {
  "[Channel1]": false,
  "[Channel2]": false,
};

// Timer storage (Blink + Timeout)
PioneerDDJFLX4._loopAdjustTimeoutTimer = PioneerDDJFLX4._loopAdjustTimeoutTimer || {
  "[Channel1]": undefined,
  "[Channel2]": undefined,
};

// ------------------- LED HELPERS -------------------
// Zwei Signale, damit die LED auch im Shift-Layer konsistent ist (wie bisher)
PioneerDDJFLX4.setReloopLight = function(status, value) {
  midi.sendShortMsg(status, 0x4D, value);
  midi.sendShortMsg(status, 0x50, value);
};

PioneerDDJFLX4.setLoopButtonLights = function(status, value) {
  // IN, OUT, IN(SHIFT), OUT(SHIFT) – wie bisher
  [0x10, 0x11, 0x4E, 0x4C].forEach(function(control) {
    midi.sendShortMsg(status, control, value);
  });
};

PioneerDDJFLX4.stopLoopLightsBlink = function(group) {
  PioneerDDJFLX4.timersLoop[group] = PioneerDDJFLX4.timersLoop[group] || {};
  const id = PioneerDDJFLX4.timersLoop[group].loopBlink;
  if (id !== undefined) {
    engine.stopTimer(id);
  }
  PioneerDDJFLX4.timersLoop[group].loopBlink = undefined;
};

// ------------------- CENTRAL LED STATE -------------------
// Desired states:
// - no track: IN/OUT off
// - track loaded, loop off: IN/OUT solid on
// - loop on, no adjust: IN/OUT blink
// - loop on + adjust in: IN blinks, OUT off
// - loop on + adjust out: OUT blinks, IN off
PioneerDDJFLX4._updateLoopLeds = function(group, _controlForBlink, statusForLed) {
  const channelIdx = (group === "[Channel1]") ? 0 : 1;
  const trackLoaded = engine.getValue(group, "track_loaded") === 1;
  const loopOn = engine.getValue(group, "loop_enabled") > 0;

  // kill blink timer first (we may restart it)
  PioneerDDJFLX4.stopLoopLightsBlink(group);

  if (!trackLoaded) {
    PioneerDDJFLX4.setLoopButtonLights(statusForLed, 0x00);
    PioneerDDJFLX4.setReloopLight(statusForLed, 0x00);
    return;
  }

  // track loaded
  if (!loopOn) {
    PioneerDDJFLX4.setReloopLight(statusForLed, 0x00);
    PioneerDDJFLX4.setLoopButtonLights(statusForLed, 0x7F); // solid
    return;
  }

  // loop on -> reloop light on, and blinking behaviour
  PioneerDDJFLX4.setReloopLight(statusForLed, 0x7F);
  PioneerDDJFLX4.startLoopLightsBlink(channelIdx, statusForLed, group);
};


PioneerDDJFLX4.startLoopLightsBlink = function(channelIdx, status, group) {
  let blink = 0x7F;

  PioneerDDJFLX4.stopLoopLightsBlink(group);

  PioneerDDJFLX4.timersLoop[group] = PioneerDDJFLX4.timersLoop[group] || {};
  PioneerDDJFLX4.timersLoop[group].loopBlink = engine.beginTimer(500, () => {
    blink = 0x7F - blink;

    // OUT adjust aktiv -> IN LEDs OFF, OUT LEDs blink
    if (PioneerDDJFLX4.loopAdjustOut[channelIdx]) {
      midi.sendShortMsg(status, 0x10, 0x00);
      midi.sendShortMsg(status, 0x4C, 0x00);
    } else {
      midi.sendShortMsg(status, 0x10, blink);
      midi.sendShortMsg(status, 0x4C, blink);
    }

    // IN adjust aktiv -> OUT LEDs OFF, IN LEDs blink
    if (PioneerDDJFLX4.loopAdjustIn[channelIdx]) {
      midi.sendShortMsg(status, 0x11, 0x00);
      midi.sendShortMsg(status, 0x4E, 0x00);
    } else {
      midi.sendShortMsg(status, 0x11, blink);
      midi.sendShortMsg(status, 0x4E, blink);
    }
  });
};

// ------------------- AUTO TIMEOUT -------------------
// Wird bei jedem Adjust-Jog neu gestartet.
// Wenn ausgelöst: Adjust Flags aus + Blink aus + LEDs in "normalen" Loop-Status.
PioneerDDJFLX4._scheduleLoopAdjustTimeout = function(channelIdx, group, controlForBlink, statusForLed) {
  const ms = Number(PioneerDDJFLX4.loopAdjustTimeoutMs);
  if (!Number.isFinite(ms) || ms <= 0) return;

  // Timer pro Deck/Group
  const oldId = PioneerDDJFLX4._loopAdjustTimeoutTimer[group];
  if (oldId !== undefined) {
    engine.stopTimer(oldId);
    PioneerDDJFLX4._loopAdjustTimeoutTimer[group] = undefined;
  }

  PioneerDDJFLX4._loopAdjustTimeoutTimer[group] = engine.beginTimer(ms, () => {
    PioneerDDJFLX4._loopAdjustTimeoutTimer[group] = undefined;

    // Adjust-Flags aus
    PioneerDDJFLX4.loopAdjustIn[channelIdx] = false;
    PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;

    // LEDs zentral neu setzen
    PioneerDDJFLX4._updateLoopLeds(group, controlForBlink, statusForLed);
  }, true /* one-shot, falls unterstützt */);
};

// ------------------- loop_enabled callback -------------------
PioneerDDJFLX4.loopToggle = function(value, group, control) {
  const status = group === "[Channel1]" ? 0x90 : 0x91;
  const channelIdx = group === "[Channel1]" ? 0 : 1;

  if (!value) {
    // Loop off: reset adjust + pending
    PioneerDDJFLX4.loopAdjustIn[channelIdx] = false;
    PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;
    PioneerDDJFLX4._loopPendingOut[group] = false;

    // Timeout kill
    const tid = PioneerDDJFLX4._loopAdjustTimeoutTimer[group];
    if (tid !== undefined) {
      engine.stopTimer(tid);
      PioneerDDJFLX4._loopAdjustTimeoutTimer[group] = undefined;
    }
  }

  // Always update LEDs based on track_loaded + loop_enabled + adjust flags
  PioneerDDJFLX4._updateLoopLeds(group, 0x10, status);
};

// track_loaded callback: keep Loop LEDs correct even when no loop state changes
PioneerDDJFLX4.loopTrackLoaded = function(_value, group, _control) {
  const status = (group === "[Channel1]") ? 0x90 : 0x91;
  // any of the loop buttons is fine as "control key" for our blink timer bucket
  // use IN (0x10) as stable id
  PioneerDDJFLX4._updateLoopLeds(group, 0x10, status);
};


// ------------------- 4BEAT/EXIT -------------------
// Loop on  -> reloop_toggle (Exit)
// Loop off -> if a previous loop exists: reloop_toggle (Reloop), else create N-beat loop
PioneerDDJFLX4.reloopExitPressed = function(_channel, _control, value, _status, group) {
  if (value !== 0x7F) return;
  if (engine.getValue(group, "track_loaded") !== 1) return;

  const loopOn = engine.getValue(group, "loop_enabled") > 0;
  if (loopOn) {
    script.triggerControl(group, "reloop_toggle");
    return;
  }

  const loopStart = engine.getValue(group, "loop_start_position");
  const loopEnd   = engine.getValue(group, "loop_end_position");

  // Mixxx uses -1 for unset positions in many cases; also guard against garbage.
  const haveStoredLoop =
      Number.isFinite(loopStart) && Number.isFinite(loopEnd) &&
      loopStart >= 0 && loopEnd >= 0 &&
      loopEnd > loopStart;

  if (haveStoredLoop) {
    // Reloop previously set IN/OUT
    script.triggerControl(group, "reloop_toggle");
    return;
  }

  // No stored loop -> create default loop (e.g. 4 beats)
  const size = Number(PioneerDDJFLX4.reloopExitBeats);
  engine.setValue(group, "beatloop_size", (Number.isFinite(size) && size > 0) ? size : 4);
  script.triggerControl(group, "beatloop_activate");
};

// ------------------- HERCULES-STYLE HELPERS -------------------
PioneerDDJFLX4._samplesPerBeat = function(group) {
  const sr = engine.getValue(group, "track_samplerate");
  let bpm = engine.getValue(group, "bpm");
  if (!Number.isFinite(bpm) || bpm <= 0) bpm = engine.getValue(group, "local_bpm");
  if (!Number.isFinite(sr) || sr <= 0) return NaN;
  if (!Number.isFinite(bpm) || bpm <= 0) return NaN;
  return (60 / bpm) * sr; // samples per beat
};

PioneerDDJFLX4._adjustLoopEdge = function(group, edge /*"in"|"out"*/, interval /*signed int*/) {
  const spb   = PioneerDDJFLX4._samplesPerBeat(group);
  const total = engine.getValue(group, "track_samples");
  if (!Number.isFinite(spb) || !Number.isFinite(total) || total <= 0) return;

  const delta  = Math.round(spb * PioneerDDJFLX4.loopAdjustStepBeats * interval);
  const minLen = Math.max(1, Math.round(spb * 0.05)); // ~5% beat min length

  let a = engine.getValue(group, "loop_start_position");
  let b = engine.getValue(group, "loop_end_position");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return;

  if (edge === "in") a += delta;
  else              b += delta;

  a = Math.max(0, Math.min(total - minLen, a));
  b = Math.max(a + minLen, Math.min(total, b));

  engine.setValue(group, "loop_start_position", a);
  engine.setValue(group, "loop_end_position",   b);
};

// Hook für jogTurn(): in hercules-mode sample-based adjust
PioneerDDJFLX4._handleJogLoopAdjust = function(channelIdx, group, jogDelta /*signed*/, controlForBlink, statusForLed) {
  if (PioneerDDJFLX4.LOOP_ADJUST_MODE !== "hercules") return false;

  const loopOn = engine.getValue(group, "loop_enabled") > 0;
  if (!loopOn) return false;

  if (!PioneerDDJFLX4.loopAdjustIn[channelIdx] && !PioneerDDJFLX4.loopAdjustOut[channelIdx]) return false;

  const dir = jogDelta > 0 ? 1 : -1;
  if (PioneerDDJFLX4.loopAdjustIn[channelIdx])  PioneerDDJFLX4._adjustLoopEdge(group, "in",  dir);
  if (PioneerDDJFLX4.loopAdjustOut[channelIdx]) PioneerDDJFLX4._adjustLoopEdge(group, "out", dir);

  // Jede Adjust-Bewegung verlängert den Adjust-Mode
  PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, controlForBlink, statusForLed);
  return true;
};

// ------------------- LOOP IN / OUT BUTTONS -------------------
// toggleLoopAdjustIn / toggleLoopAdjustOut bleiben die XML targets.
// Mode entscheidet, was passiert.
PioneerDDJFLX4.toggleLoopAdjustIn = function(channelIdx, control, value, _status, group) {
  if (value !== 0x7F) return;

  const loopOn = engine.getValue(group, "loop_enabled") > 0;
  const st = (group === "[Channel1]") ? 0x90 : 0x91;

  // --- HERCULES MODE ---
  if (PioneerDDJFLX4.LOOP_ADJUST_MODE === "hercules") {
    if (!loopOn) {
      // pending already? -> cancel
      if (PioneerDDJFLX4._loopPendingOut[group]) {
        PioneerDDJFLX4._loopPendingOut[group] = false;
        PioneerDDJFLX4.setLoopButtonLights(st, 0x00);
        return;
      }

      // set loop in + pending out
      script.triggerControl(group, "loop_in");
      PioneerDDJFLX4._loopPendingOut[group] = true;
      return;
    }

    // loop active -> toggle IN adjust mode
    PioneerDDJFLX4._loopPendingOut[group] = false;

    PioneerDDJFLX4.loopAdjustIn[channelIdx] = !PioneerDDJFLX4.loopAdjustIn[channelIdx];
    if (PioneerDDJFLX4.loopAdjustIn[channelIdx]) PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;

    // Your startLoopLightsBlink signature is (channelIdx, status, group).
    // Also: don’t manually force LEDs here; use the central renderer.
    if (PioneerDDJFLX4.loopAdjustIn[channelIdx] || PioneerDDJFLX4.loopAdjustOut[channelIdx]) {
      PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, control, st);
    }
    PioneerDDJFLX4._updateLoopLeds(group, control, st);
    return;
  }

  // --- SIMPLE MODE (DEFAULT) ---
  if (!loopOn) return;

  PioneerDDJFLX4.loopAdjustIn[channelIdx] = !PioneerDDJFLX4.loopAdjustIn[channelIdx];
  PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;

  // Timer nur wenn Adjust aktiv
  if (PioneerDDJFLX4.loopAdjustIn[channelIdx]) {
    PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, control, st);
  }
};

PioneerDDJFLX4.toggleLoopAdjustOut = function(channelIdx, control, value, _status, group) {
  if (value !== 0x7F) return;

  const loopOn = engine.getValue(group, "loop_enabled") > 0;
  const st = (group === "[Channel1]") ? 0x90 : 0x91;

  // --- HERCULES MODE ---
  if (PioneerDDJFLX4.LOOP_ADJUST_MODE === "hercules") {
    if (!loopOn) {
      // set loop out (also activates loop)
      script.triggerControl(group, "loop_out");
      PioneerDDJFLX4._loopPendingOut[group] = false;
      return;
    }

    // loop active -> toggle OUT adjust mode
    PioneerDDJFLX4._loopPendingOut[group] = false;

    PioneerDDJFLX4.loopAdjustOut[channelIdx] = !PioneerDDJFLX4.loopAdjustOut[channelIdx];
    if (PioneerDDJFLX4.loopAdjustOut[channelIdx]) PioneerDDJFLX4.loopAdjustIn[channelIdx] = false;

    // Fix wrong function calls + keep LED logic centralized
    if (PioneerDDJFLX4.loopAdjustIn[channelIdx] || PioneerDDJFLX4.loopAdjustOut[channelIdx]) {
      PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, control, st);
    }
    PioneerDDJFLX4._updateLoopLeds(group, control, st);
    return;
  }

  // --- SIMPLE MODE (DEFAULT) ---
  if (!loopOn) return;

  PioneerDDJFLX4.loopAdjustOut[channelIdx] = !PioneerDDJFLX4.loopAdjustOut[channelIdx];
  PioneerDDJFLX4.loopAdjustIn[channelIdx] = false;

  if (PioneerDDJFLX4.loopAdjustOut[channelIdx]) {
    PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, control, st);
  }
};


///////////////////////////////////////////////////////////////
// Classic XML loop_in / loop_out wrappers (LED feedback)
//
// Goal:
// - When pressing LOOP IN (classic), immediately blink IN LED to show "pending out".
// - When pressing LOOP OUT, stop pending blink and let loop_enabled callback handle LEDs.
///////////////////////////////////////////////////////////////

PioneerDDJFLX4.loopInPressed = function(_channel, control, value, _status, group) {
  if (value !== 0x7F) return;
  if (engine.getValue(group, "track_loaded") !== 1) return;

  const channelIdx = (group === "[Channel1]") ? 0 : 1;
  const st = (group === "[Channel1]") ? 0x90 : 0x91;

  // Trigger Mixxx loop-in
  script.triggerControl(group, "loop_in");

  // Pending-Out visual: IN blinks, OUT off
  PioneerDDJFLX4._loopPendingOut[group] = true;
  PioneerDDJFLX4.loopAdjustIn[channelIdx] = true;     // makes OUT off in your blink routine
  PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;   // keeps IN blinking
  PioneerDDJFLX4.startLoopLightsBlink(channelIdx, st, group);
};

PioneerDDJFLX4.loopOutPressed = function(_channel, control, value, _status, group) {
  if (value !== 0x7F) return;
  if (engine.getValue(group, "track_loaded") !== 1) return;

  const channelIdx = (group === "[Channel1]") ? 0 : 1;
  const st = (group === "[Channel1]") ? 0x90 : 0x91;

  // Trigger Mixxx loop-out
  script.triggerControl(group, "loop_out");

  // Clear pending + stop special blink; loopToggle(loop_enabled) will render final state
  PioneerDDJFLX4._loopPendingOut[group] = false;
  PioneerDDJFLX4.loopAdjustIn[channelIdx] = false;
  PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;
  PioneerDDJFLX4.stopLoopLightsBlink(group);
};

//
// CUE/LOOP CALL
//

PioneerDDJFLX4.cueLoopCallLeft = function(_ch, _ctrl, value, _status, group) {
    if (value !== 0x7F) return; // nur Press
    if (engine.getValue(group, "track_loaded") !== 1) return;

    if (engine.getValue(group, "loop_enabled") > 0) {
        script.triggerControl(group, "loop_halve", 50);
    } else {
        // kein Loop aktiv -> gespeicherten Loop reaktivieren (wenn vorhanden)
        script.triggerControl(group, "reloop_toggle", 50);
    }
};

PioneerDDJFLX4.cueLoopCallRight = function(_ch, _ctrl, value, _status, group) {
    if (value !== 0x7F) return; // nur Press
    if (engine.getValue(group, "track_loaded") !== 1) return;

    if (engine.getValue(group, "loop_enabled") > 0) {
        script.triggerControl(group, "loop_double", 50);
    } else {
        script.triggerControl(group, "reloop_toggle", 50);
    }
};

//
// BEAT SYNC
//
// Note that the controller sends different signals for a short press and a long
// press of the same button.
//

PioneerDDJFLX4.syncPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F) return;

    const hold = engine.getValue(group, "sync_enabled") === 1;

    if (hold) {
        // Short press while HOLD → disable sync
        engine.setValue(group, "sync_enabled", 0);
    } else {
        // One-shot beat sync
        engine.setValue(group, "beatsync", 1);
    }
};

PioneerDDJFLX4.syncLongPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F) return;

    const hold = engine.getValue(group, "sync_enabled") === 1;
    engine.setValue(group, "sync_enabled", hold ? 0 : 1);
};

PioneerDDJFLX4.tempoRanges = [0.08, 0.16, 0.32, 0.64, 1.0];

PioneerDDJFLX4.cycleTempoRange = function(_ch, _ctrl, value, _status, group) {
    if (!value) return;

    const cur = engine.getValue(group, "rateRange");

    // Float-sicher: nicht auf exakte Gleichheit verlassen
    const eps = 1e-6;
    let idx = -1;
    for (let i = 0; i < PioneerDDJFLX4.tempoRanges.length; i++) {
        if (Math.abs(cur - PioneerDDJFLX4.tempoRanges[i]) < eps) { idx = i; break; }
    }

    const nextIdx = (idx === -1) ? 0 : (idx + 1) % PioneerDDJFLX4.tempoRanges.length;
    engine.setValue(group, "rateRange", PioneerDDJFLX4.tempoRanges[nextIdx]);
};

///////////////////////////////////////////////////////////////
// Jog wheels (FLX4) – stateful scratch/bend (Hercules-style light)
//
// Goals:
// - Loop-adjust has priority (your existing _handleJogLoopAdjust hook stays).
// - Touch decides: scratch if (vinylMode ON) OR (deck not playing), else bend.
// - Turn: scratchTick when scratching, else jog bend.
// - Optional Shift-Touch: seek-scratch (good for quick searches).
//
// Notes:
// - FLX4 wheel turn values are centered at 64 (0..127). We convert to signed by (v - 64).
// - We keep it 2-deck simple (Channel1/2), because FLX4 is 2-deck.
// - Per-deck vinylMode avoids “one side affects the other” bugs.
///////////////////////////////////////////////////////////////

// ---------- config ----------
PioneerDDJFLX4.jogPPR = PioneerDDJFLX4.jogPPR || 720;            // typical Pioneer jog resolution
PioneerDDJFLX4.jogRPM = PioneerDDJFLX4.jogRPM || (33 + 1/3);     // platter RPM
// Make scratch params explicit (avoid relying on "this" shape)
// If you already define alpha/beta elsewhere, these keep your values.
PioneerDDJFLX4.alpha = (Number.isFinite(PioneerDDJFLX4.alpha) ? PioneerDDJFLX4.alpha : 1.0);
PioneerDDJFLX4.beta  = (Number.isFinite(PioneerDDJFLX4.beta)  ? PioneerDDJFLX4.beta  : 1.0);

PioneerDDJFLX4.scratchScale = PioneerDDJFLX4.scratchScale || 1.0; // can tune
PioneerDDJFLX4.seekScratchMultiplier = PioneerDDJFLX4.seekScratchMultiplier || 4.0;

// ---------- state ----------
// DO NOT "invent" vinyl mode in the script.
// FLX4 sends different CCs depending on its internal Vinyl mode:
//   platter vinyl ON  -> CC 0x22
//   platter vinyl OFF -> CC 0x23
// We track the last seen controller state per deck here.
PioneerDDJFLX4._jogVinylFromController = PioneerDDJFLX4._jogVinylFromController || [false, false];
PioneerDDJFLX4.wheelTouch = PioneerDDJFLX4.wheelTouch || [false, false];    // per deck side
PioneerDDJFLX4._scratchEnabled = PioneerDDJFLX4._scratchEnabled || [false, false];
PioneerDDJFLX4._scratchAction = PioneerDDJFLX4._scratchAction || ["bend", "bend"]; // "scratch"|"seek"|"bend"

// Helper: enable scratch for deckNum (1/2)
PioneerDDJFLX4._scratchEnable = function(deckNum) {
    engine.scratchEnable(deckNum, PioneerDDJFLX4.jogPPR, PioneerDDJFLX4.jogRPM, PioneerDDJFLX4.alpha, PioneerDDJFLX4.beta);
    PioneerDDJFLX4._scratchEnabled[deckNum - 1] = true;
};

// Helper: disable scratch for deckNum (1/2)
PioneerDDJFLX4._scratchDisable = function(deckNum) {
    // "ramp" true makes it feel less abrupt, but if you hate it: set false.
    engine.scratchDisable(deckNum, true);
    PioneerDDJFLX4._scratchEnabled[deckNum - 1] = false;
    // After release we fall back to bend mode.
    PioneerDDJFLX4._scratchAction[deckNum - 1] = "bend";
};

// ---------- touch handlers ----------
PioneerDDJFLX4.jogTouch = function(channel, _control, value, _status, group) {
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    const deckNum = deckIdx + 1;

    // If we are adjusting loop points, ignore touch changes to prevent scratch toggling while editing.
    if (PioneerDDJFLX4.loopAdjustIn[deckIdx] || PioneerDDJFLX4.loopAdjustOut[deckIdx]) {
        return;
    }

    const touching = (value !== 0);
    PioneerDDJFLX4.wheelTouch[deckIdx] = touching;

    if (touching) {
        // Decide scratch vs bend based on CONTROLLER vinyl state:
        // scratch if deck not playing OR controller is in vinyl mode.
        const playing = engine.getValue(group, "play") === 1;
        const wantScratch = (!playing) || !!PioneerDDJFLX4._jogVinylFromController[deckIdx];

        if (wantScratch) {
            PioneerDDJFLX4._scratchAction[deckIdx] = "scratch";
            PioneerDDJFLX4._scratchEnable(deckNum);
        } else {
            PioneerDDJFLX4._scratchAction[deckIdx] = "bend";
            // ensure scratch is off if it was on
            if (PioneerDDJFLX4._scratchEnabled[deckIdx]) {
                PioneerDDJFLX4._scratchDisable(deckNum);
            }
        }
        return;
    }

    // Touch released
    if (PioneerDDJFLX4._scratchEnabled[deckIdx]) {
        PioneerDDJFLX4._scratchDisable(deckNum);
    } else {
        PioneerDDJFLX4._scratchAction[deckIdx] = "bend";
    }
};

    // same loop-adjust guard
    if (PioneerDDJFLX4.loopAdjustIn[deckIdx] || PioneerDDJFLX4.loopAdjustOut[deckIdx]) {
        return;
    }

    const touching = (value !== 0);
    PioneerDDJFLX4.wheelTouch[deckIdx] = touching;

    if (touching) {
        PioneerDDJFLX4._scratchAction[deckIdx] = "seek";
        PioneerDDJFLX4._scratchEnable(deckNum);
        return;
    }

    if (PioneerDDJFLX4._scratchEnabled[deckIdx]) {
        PioneerDDJFLX4._scratchDisable(deckNum);
    } else {
        PioneerDDJFLX4._scratchAction[deckIdx] = "bend";
    }
};

// ---------- turn handlers ----------
PioneerDDJFLX4.jogTurn = function(channel, _control, value, _status, group) {
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    const deckNum = deckIdx + 1;

    // centered at 64; <64 rew >64 fwd
    const delta = value - 64;

    const st = (group === "[Channel1]") ? 0x90 : 0x91;

    // --- learn controller vinyl mode from incoming CC ---
    // platter vinyl ON  -> 0x22 (scratch)
    // platter vinyl OFF -> 0x23 (pitch bend)
    // side              -> 0x21 (pitch bend)
    if (_control === 0x22) PioneerDDJFLX4._jogVinylFromController[deckIdx] = true;
    else if (_control === 0x23) PioneerDDJFLX4._jogVinylFromController[deckIdx] = false;

    // If platter-vinyl CC arrives after touch release (common jitter),
    // ignore it to prevent a tiny jog "nudge".
    if (_control === 0x22 && !PioneerDDJFLX4.wheelTouch[deckIdx]) {
        return;
    }

    // Loop adjust has priority (your dual-mode block)
    if (engine.getValue(group, "loop_enabled") > 0) {
        if (typeof PioneerDDJFLX4._handleJogLoopAdjust === "function") {
            // _handleJogLoopAdjust expects deckIdx (0/1), not MIDI channel number
            if (PioneerDDJFLX4._handleJogLoopAdjust(deckIdx, group, delta, _control, st)) {
                return;
            }
        }

        // Simple-mode legacy adjust (your existing multiply logic)
        if (PioneerDDJFLX4.loopAdjustIn[deckIdx]) {
            if (typeof PioneerDDJFLX4._scheduleLoopAdjustTimeout === "function") {
                PioneerDDJFLX4._scheduleLoopAdjustTimeout(deckIdx, group, _control, st);
            }
            const newPos = delta * PioneerDDJFLX4.loopAdjustMultiply + engine.getValue(group, "loop_start_position");
            engine.setValue(group, "loop_start_position", newPos);
            return;
        }
        if (PioneerDDJFLX4.loopAdjustOut[deckIdx]) {
            if (typeof PioneerDDJFLX4._scheduleLoopAdjustTimeout === "function") {
                PioneerDDJFLX4._scheduleLoopAdjustTimeout(deckIdx, group, _control, st);
            }
            const newPos = delta * PioneerDDJFLX4.loopAdjustMultiply + engine.getValue(group, "loop_end_position");
            engine.setValue(group, "loop_end_position", newPos);
            return;
        }
    }

    // Scratch/bend behavior
    // If Mixxx is currently scratching, always send scratchTick for PLATTER turns (0x22 AND 0x23).
    // Side jog (0x21) must always remain bend.
    if (_control !== 0x21 && engine.isScratching(deckNum)) {
        const action = PioneerDDJFLX4._scratchAction[deckIdx];

        if (action === "seek") {
            engine.scratchTick(deckNum, delta * PioneerDDJFLX4.scratchScale * PioneerDDJFLX4.seekScratchMultiplier);
        } else {
            engine.scratchTick(deckNum, delta * PioneerDDJFLX4.scratchScale);
        }
        return;
    }

    // Fallback: bend/jog
    engine.setValue(group, "jog", delta * PioneerDDJFLX4.bendScale);
};

PioneerDDJFLX4.jogSearch = function(_channel, _control, value, _status, group) {
    // keep your existing search behavior
    const newVal = (value - 64) * PioneerDDJFLX4.fastSeekScale;
    engine.setValue(group, "jog", newVal);
};

///////////////////////////////////////////////////////////////
// VINYL MODE (PER-DECK) via a mapped butto
//
// FLX4 has an internal Vinyl Mode that changes which CC the jog sends.
// To switch it, Mixxx must SEND the command to the controller:
//   Deck1: 0x90 0x17 <val>
//   Deck2: 0x91 0x17 <val>
///////////////////////////////////////////////////////////////

// NOTE: Currently no free LED for Vinyl. Keep code but DISABLED.
// PioneerDDJFLX4.updateVinylLed = function(deckIdx, on) {
//     // Example (was SmartFader LEDs) - intentionally disabled:
//     // const light = (deckIdx === 0)
//     //     ? PioneerDDJFLX4.lights.SmartFader
//     //     : PioneerDDJFLX4.lights.shiftSmartFader;
//     // PioneerDDJFLX4.toggleLight(light, !!on);
// };

// Single source of truth: this is the documented command that switches the controller's jog mode.
PioneerDDJFLX4._setHardwareVinyl = function(deckIdx, on) {
    const st = (deckIdx === 0) ? 0x90 : 0x91;
    midi.sendShortMsg(st, 0x17, on ? 0x7F : 0x00);
};

// Per-deck desired state
// You previously initialized _vinylWanted as a boolean earlier, and later treated it as an array.
// If it ever becomes true, `|| [false,false]` would *not* replace it -> runtime bugs.
if (!Array.isArray(PioneerDDJFLX4._vinylWanted)) {
    PioneerDDJFLX4._vinylWanted = [false, false];
}

PioneerDDJFLX4._applyVinylState = function(deckIdx, on) {
    const state = !!on;
    PioneerDDJFLX4._vinylWanted[deckIdx] = state;

    // optimistic local state so FIRST press already changes behavior
    PioneerDDJFLX4._jogVinylFromController[deckIdx] = state;

    // switch controller jog MIDI mode
    PioneerDDJFLX4._setHardwareVinyl(deckIdx, state);

    // if turning OFF, ensure we don't stay in scratching
    if (!state) {
        if (PioneerDDJFLX4._scratchEnabled[deckIdx]) PioneerDDJFLX4._scratchDisable(deckIdx + 1);
        PioneerDDJFLX4._scratchAction[deckIdx] = "bend";
    }

    // LED currently disabled / unassigned:
    // PioneerDDJFLX4.updateVinylLed?.(deckIdx, state);
};

PioneerDDJFLX4.vinylTogglePressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F) return;

    // per-deck via group ([Channel1]/[Channel2])
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    PioneerDDJFLX4._applyVinylState(deckIdx, !PioneerDDJFLX4._vinylWanted[deckIdx]);
};

//
// Tempo sliders
//
// The tempo option in Mixxx's deck preferences determine whether down/up
// increases/decreases the rate. Therefore it must be inverted here so that the
// UI and the control sliders always move in the same direction.
//

PioneerDDJFLX4.tempoSliderMSB = function(channel, control, value, status, group) {
    PioneerDDJFLX4.highResMSB[group].tempoSlider = value;
};

PioneerDDJFLX4.tempoSliderLSB = function(channel, control, value, status, group) {
    const fullValue = (PioneerDDJFLX4.highResMSB[group].tempoSlider << 7) + value;

    engine.setValue(
        group,
        "rate",
        1 - (fullValue / 0x2000)
    );
};

// ============================================================
// Beatjump Mode LEDs (static) – light pads 1..8 when mode active
// Notes: 0x20..0x27
// Deck1 status: 0x97, Deck2 status: 0x99 (same as MIDI-IN in doc)
// ============================================================
PioneerDDJFLX4._setBeatjumpPadsLit = function(status, on) {
    const v = on ? 0x7F : 0x00;
    for (let n = 0x20; n <= 0x27; n++) {
        midi.sendShortMsg(status, n, v);
    }
};
// ============================================================
// Beatloop Mode LEDs (static) – light pads 1..8 when mode active
// Notes: 0x60..0x67
// Deck1 status: 0x97, Deck2 status: 0x99
// ============================================================
PioneerDDJFLX4._setBeatloopPadsLit = function(status, on) {
    const v = on ? 0x7F : 0x00;
    for (let n = 0x60; n <= 0x67; n++) {
        midi.sendShortMsg(status, n, v);
    }
};
//
// Sampler mode
//

// --- Sampler LED state machine ---

// --- Sampler long-press ---
PioneerDDJFLX4.SAMPLER_LONGPRESS_MS = 350;
PioneerDDJFLX4._samplerHold = PioneerDDJFLX4._samplerHold || {
    timer: {},   // group -> timerId
    fired: {},   // group -> bool
};
// LED off if not loaded, solid if loaded+stopped, blink if playing
PioneerDDJFLX4.samplerLedUpdate = function(_value, group, _control) {
    const m = group.match(script.samplerRegEx);
    if (!m) return;

    const curPad = parseInt(m[1], 10);
    let deckIndex = 0;
    let padIndex = 0;

    // gleiche Mapping-Logik wie bei dir
    if (curPad >= 1 && curPad <= 4) {
        deckIndex = 0; padIndex = curPad - 1;
    } else if (curPad >= 5 && curPad <= 8) {
        deckIndex = 2; padIndex = curPad - 5;
    } else if (curPad >= 9 && curPad <= 12) {
        deckIndex = 0; padIndex = curPad - 5;
    } else if (curPad >= 13 && curPad <= 16) {
        deckIndex = 2; padIndex = curPad - 9;
    }

    const midichan = 0x97 + deckIndex;
    const midictrl = 0x30 + padIndex;

    const loaded = engine.getValue(group, "track_loaded") === 1;
    const playing = engine.getValue(group, "play") === 1;

    if (!loaded) {
        // AUS + Blink stoppen
        PioneerDDJFLX4.stopSamplerBlink(midichan, midictrl);
        midi.sendShortMsg(midichan, midictrl, 0x00);
        midi.sendShortMsg(midichan + 1, midictrl, 0x00); // SHIFT layer
        return;
    }

    if (playing) {
        // BLINK
        PioneerDDJFLX4.startSamplerBlink(midichan, midictrl, group);
        return;
    }

    // loaded aber nicht playing -> SOLID ON
    PioneerDDJFLX4.stopSamplerBlink(midichan, midictrl);
    midi.sendShortMsg(midichan, midictrl, 0x7F);
    midi.sendShortMsg(midichan + 1, midictrl, 0x7F); // SHIFT layer
};

//PioneerDDJFLX4.padMode = PioneerDDJFLX4.padMode || { "[Channel1]": PioneerDDJFLX4.PADMODE.HOTCUE, "[Channel2]": PioneerDDJFLX4.PADMODE.HOTCUE };

PioneerDDJFLX4.padModeKeyPressed = function(_channel, _control, value, _status, _group) {
    if (value !== 0x7F) return;

    const ch = (_status === 0x90) ? "[Channel1]" : "[Channel2]";
    const deck = (_status === 0x90 ? PioneerDDJFLX4.lights.deck1 : PioneerDDJFLX4.lights.deck2);

    const padStatus = (_status === 0x90) ? 0x97 : 0x99;
    // Beatjump pads
    if (typeof PioneerDDJFLX4._setBeatjumpPadsLit === "function") {
        PioneerDDJFLX4._setBeatjumpPadsLit(
            padStatus,
            _control === 0x20 // BEATJUMP
        );
    }

    // Beatloop pads
    if (typeof PioneerDDJFLX4._setBeatloopPadsLit === "function") {
        PioneerDDJFLX4._setBeatloopPadsLit(
            padStatus,
            _control === 0x6D // BEATLOOP
        );
    }

    // --- KEYBOARD MODE (used as STEMS) ---
if (_control === 0x69) { // KEYBOARD MODE button (STEMS)
    PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.KEYBOARD;

    PioneerDDJFLX4.toggleLight(deck.keyboardMode, true);

    if (typeof PioneerDDJFLX4._refreshKeyboardStemLeds === "function") {
        PioneerDDJFLX4._refreshKeyboardStemLeds(ch);
    }
    return;
}

    // set per-deck padMode for everything else (optional but consistent)
    if (_control === 0x1B) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.HOTCUE;
    else if (_control === 0x1E) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.PADFX1;
    else if (_control === 0x6B) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.PADFX2;
    else if (_control === 0x20) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.BEATJUMP;
    else if (_control === 0x6D) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.BEATLOOP;
    else if (_control === 0x22) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.SAMPLER;
    else if (_control === 0x6F) PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.KEYSHIFT;

    // keep your original LED toggle calls
    if (_control === 0x1B) PioneerDDJFLX4.toggleLight(deck.hotcueMode, true);
    else if (_control === 0x1E) PioneerDDJFLX4.toggleLight(deck.padFX1Mode, true);
    else if (_control === 0x6B) PioneerDDJFLX4.toggleLight(deck.padFX2Mode, true);
    else if (_control === 0x20) PioneerDDJFLX4.toggleLight(deck.beatJumpMode, true);
    else if (_control === 0x6D) PioneerDDJFLX4.toggleLight(deck.beatLoopMode, true);
    else if (_control === 0x22) PioneerDDJFLX4.toggleLight(deck.samplerMode, true);
    else if (_control === 0x6F) PioneerDDJFLX4.toggleLight(deck.keyShiftMode, true);
};

PioneerDDJFLX4.samplerPadPressed = function(_channel, _control, value, _status, group) {
    // Press
    if (value === 0x7F) {
        // long-press nur sinnvoll, wenn überhaupt was geladen ist
        if (engine.getValue(group, "track_loaded")) {
            // alten Timer weg
            const old = PioneerDDJFLX4._samplerHold.timer[group];
            if (old) {
                engine.stopTimer(old);
                PioneerDDJFLX4._samplerHold.timer[group] = 0;
            }
            PioneerDDJFLX4._samplerHold.fired[group] = false;

            // Long-press timer: wenn playing -> stop
            PioneerDDJFLX4._samplerHold.timer[group] = engine.beginTimer(
                PioneerDDJFLX4.SAMPLER_LONGPRESS_MS,
                function() {
                    PioneerDDJFLX4._samplerHold.timer[group] = 0;

                    if (engine.getValue(group, "play") === 1) {
                        PioneerDDJFLX4._samplerHold.fired[group] = true;
                        engine.setValue(group, "cue_gotoandstop", 1);
                    }
                },
                true
            );
        }
        return;
    }

    // Release
    if (value === 0x00) {
        const t = PioneerDDJFLX4._samplerHold.timer[group];
        if (t) {
            engine.stopTimer(t);
            PioneerDDJFLX4._samplerHold.timer[group] = 0;
        }

        // wenn long-press bereits ausgelöst hat: nichts mehr tun
        if (PioneerDDJFLX4._samplerHold.fired[group]) {
            PioneerDDJFLX4._samplerHold.fired[group] = false;
            return;
        }

        // short press Verhalten wie gehabt
        if (engine.getValue(group, "track_loaded")) {
            engine.setValue(group, "cue_gotoandplay", 1);
        } else {
            engine.setValue(group, "LoadSelectedTrack", 1);
        }
    }
};

PioneerDDJFLX4.samplerPadShiftPressed = function(_channel, _control, value, _status, group) {
    if (engine.getValue(group, "play")) {
        engine.setValue(group, "cue_gotoandstop", value);
    } else if (engine.getValue(group, "track_loaded")) {
        engine.setValue(group, "eject", value);
    }
};

PioneerDDJFLX4.startSamplerBlink = function(channel, control, group) {
    PioneerDDJFLX4.timersSampler = PioneerDDJFLX4.timersSampler || {};
    PioneerDDJFLX4.timersSampler[channel] = PioneerDDJFLX4.timersSampler[channel] || {};
    let val = 0x7f;

    PioneerDDJFLX4.stopSamplerBlink(channel, control);
    PioneerDDJFLX4.timersSampler[channel][control] = engine.beginTimer(250, () => {
        val = 0x7f - val;

        // blink the appropriate pad
        midi.sendShortMsg(channel, control, val);
        // also blink the pad while SHIFT is pressed
        midi.sendShortMsg((channel+1), control, val);

        const isPlaying = engine.getValue(group, "play") === 1;

        if (!isPlaying) {
            // kill timer
            PioneerDDJFLX4.stopSamplerBlink(channel, control);
            // set the pad LED to ON
            midi.sendShortMsg(channel, control, 0x7f);
            // set the pad LED to ON while SHIFT is pressed
            midi.sendShortMsg((channel+1), control, 0x7f);
        }
    });
};

PioneerDDJFLX4.stopSamplerBlink = function(channel, control) {
    PioneerDDJFLX4.timersSampler = PioneerDDJFLX4.timersSampler || {};
    PioneerDDJFLX4.timersSampler[channel] = PioneerDDJFLX4.timersSampler[channel] || {};

    if (PioneerDDJFLX4.timersSampler[channel][control] !== undefined) {
        engine.stopTimer(PioneerDDJFLX4.timersSampler[channel][control]);
        PioneerDDJFLX4.timersSampler[channel][control] = undefined;
    }
};

PioneerDDJFLX4.quickJumpForward = function(_channel, _control, value, _status, group) {
    if (value) {
        engine.setValue(group, "beatjump", PioneerDDJFLX4.quickJumpSize);
    }
};

PioneerDDJFLX4.quickJumpBack = function(_channel, _control, value, _status, group) {
    if (value) {
        engine.setValue(group, "beatjump", -PioneerDDJFLX4.quickJumpSize);
    }
};

// --- Quantize / Keylock (Short / Long Press) ---

PioneerDDJFLX4._quantizeLP = PioneerDDJFLX4._quantizeLP || {
    timer: {},
    fired: {}
};

PioneerDDJFLX4.QUANTIZE_LONGPRESS_MS = 350;

PioneerDDJFLX4.toggleQuantize = function (_channel, _control, value, _status, group) {
    const key = group; // pro Deck getrennt

    if (value === 0x7F) { // Button DOWN
        // Reset State
        PioneerDDJFLX4._quantizeLP.fired[key] = false;

        // alten Timer sicher stoppen
        if (PioneerDDJFLX4._quantizeLP.timer[key]) {
            engine.stopTimer(PioneerDDJFLX4._quantizeLP.timer[key]);
        }

        // Long-Press Timer
        PioneerDDJFLX4._quantizeLP.timer[key] = engine.beginTimer(
            PioneerDDJFLX4.QUANTIZE_LONGPRESS_MS,
            function () {
                PioneerDDJFLX4._quantizeLP.fired[key] = true;
                script.toggleControl(group, "keylock");
                PioneerDDJFLX4._quantizeLP.timer[key] = null;
            },
            true
        );
        return;
    }

    if (value !== 0x00) return; // alles andere ignorieren

    // Button UP
    const t = PioneerDDJFLX4._quantizeLP.timer[key];
    if (t) {
        engine.stopTimer(t);
        PioneerDDJFLX4._quantizeLP.timer[key] = null;
    }

    // nur Short-Press ausführen
    if (!PioneerDDJFLX4._quantizeLP.fired[key]) {
        script.toggleControl(group, "quantize");
    }
};

///////////////////////////////////////////////////////////////
// STEMS on FLX4 (uses hardware "KEYBOARD" mode button)
//
// Pads 1–4: Stem mute toggle
// Shift+Pads 1–4: "Only stem X active" (mute others)
//
// Pads 5–8: configurable via STEMS_PAD5_8_MODE
//   - "fx"   (default): toggle Stem QuickEffect enabled, Shift = next preset
//   - "solo" (Hercules-style momentary):
//        Pad held        -> SOLO (only that stem unmuted, others muted)
//        Shift + held    -> HOLD-MUTE (only that stem muted, others unmuted)
//        Release         -> restore previous mute state
//
// LED sync:
// - We keep your existing Mixxx connections in init():
//     [ChannelX] stem_count -> stemCountChanged
//     [ChannelX_StemY] mute -> stemMuteChanged
//     [QuickEffectRack1_[ChannelX_StemY]] enabled -> stemFxChanged
// - Additionally, when entering KEYBOARD mode, call _refreshKeyboardStemLeds(channel)
//   from padModeKeyPressed (das hast du schon).
///////////////////////////////////////////////////////////////

// ------------------- CONFIG -------------------
PioneerDDJFLX4.STEMS_PAD5_8_MODE = "solo"; // "fx" or "solo"

// ------------------- CONSTANTS -------------------
// (Ja: behalten. Wird fürs LED-Senden benutzt.)
PioneerDDJFLX4.stemsPadsModesStatus = PioneerDDJFLX4.stemsPadsModesStatus || {
    "[Channel1]": [0x97, 0x98], // base + shift pad status
    "[Channel2]": [0x99, 0x9A],
};
PioneerDDJFLX4.stemMutePadsFirstControl = 0x40; // pads 1–4 -> 0x40..0x43
PioneerDDJFLX4.stemFxPadsFirstControl   = 0x44; // pads 5–8 -> 0x44..0x47

// ------------------- HELPERS -------------------
PioneerDDJFLX4._stemCount = function(channelGroup) {
    return Math.max(0, Math.min(4, engine.getValue(channelGroup, "stem_count") | 0));
};

PioneerDDJFLX4._stemGroup = function(channelGroup, stemIdx1) {
    return `[${channelGroup.substring(1, channelGroup.length - 1)}_Stem${stemIdx1}]`;
};

PioneerDDJFLX4._stemQfxGroup = function(channelGroup, stemIdx1) {
    return `[QuickEffectRack1_[${channelGroup.substring(1, channelGroup.length - 1)}_Stem${stemIdx1}]]`;
};

// ------------------- MOMENTARY SOLO STATE -------------------
PioneerDDJFLX4._stemMomentary = PioneerDDJFLX4._stemMomentary || {
    "[Channel1]": { active: false, prev: [0,0,0,0] },
    "[Channel2]": { active: false, prev: [0,0,0,0] },
};

PioneerDDJFLX4._stemMomentaryApply = function(group, stemIdx1, mode /*"solo"|"holdmute"*/) {
    const stemCount = PioneerDDJFLX4._stemCount(group);
    if (stemIdx1 < 1 || stemIdx1 > stemCount) return;

    const st = PioneerDDJFLX4._stemMomentary[group] ||
        (PioneerDDJFLX4._stemMomentary[group] = { active:false, prev:[0,0,0,0] });

    // Snapshot current mutes (1..4, egal ob vorhanden – safe)
    for (let s = 1; s <= 4; s++) {
        const sg = PioneerDDJFLX4._stemGroup(group, s);
        st.prev[s - 1] = engine.getValue(sg, "mute") > 0 ? 1 : 0;
    }
    st.active = true;

    // Apply momentary behavior
    for (let s = 1; s <= stemCount; s++) {
        const sg = PioneerDDJFLX4._stemGroup(group, s);
        if (mode === "solo") {
            engine.setValue(sg, "mute", (s === stemIdx1) ? 0 : 1);
        } else { // "holdmute"
            engine.setValue(sg, "mute", (s === stemIdx1) ? 1 : 0);
        }
    }
};

PioneerDDJFLX4._stemMomentaryRelease = function(group) {
    const st = PioneerDDJFLX4._stemMomentary[group];
    if (!st || !st.active) return;

    const stemCount = PioneerDDJFLX4._stemCount(group);
    for (let s = 1; s <= stemCount; s++) {
        const sg = PioneerDDJFLX4._stemGroup(group, s);
        engine.setValue(sg, "mute", st.prev[s - 1] ? 1 : 0);
    }
    st.active = false;
};

// ------------------- LED REFRESH (pull current values once) -------------------
PioneerDDJFLX4._refreshKeyboardStemLeds = function(channelGroup) {
    const stemCount = PioneerDDJFLX4._stemCount(channelGroup);

    // Pull current values and reuse the same LED update path as the engine callbacks
    for (let stem = 1; stem <= 4; stem++) {
        const sg = PioneerDDJFLX4._stemGroup(channelGroup, stem);
        PioneerDDJFLX4.stemMuteChanged(engine.getValue(sg, "mute"), sg, null);

        const qg = PioneerDDJFLX4._stemQfxGroup(channelGroup, stem);
        PioneerDDJFLX4.stemFxChanged(engine.getValue(qg, "enabled"), qg, null);

        // Optional: FX LEDs für nicht vorhandene Stems hart aus
        if (stem > stemCount) {
            const statuses = PioneerDDJFLX4.stemsPadsModesStatus[channelGroup] || [];
            for (const st of statuses) {
                midi.sendShortMsg(st, PioneerDDJFLX4.stemFxPadsFirstControl + stem - 1, 0x00);
            }
        }
    }
};

// ------------------- PAD HANDLERS -------------------

// Pads 1–4: Mute toggle
PioneerDDJFLX4.stemMutePadPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7F) return;

    const stemCount = PioneerDDJFLX4._stemCount(group);
    const stemIdx1 = (control - PioneerDDJFLX4.stemMutePadsFirstControl) + 1;
    if (stemIdx1 < 1 || stemIdx1 > stemCount) return;

    const sg = PioneerDDJFLX4._stemGroup(group, stemIdx1);
    engine.setValue(sg, "mute", engine.getValue(sg, "mute") ? 0 : 1);
};

// Shift + Pads 1–4: Only stem X active
PioneerDDJFLX4.stemMutePadShiftPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7F) return;

    const stemCount = PioneerDDJFLX4._stemCount(group);
    const stemIdx1 = (control - PioneerDDJFLX4.stemMutePadsFirstControl) + 1;
    if (stemIdx1 < 1 || stemIdx1 > stemCount) return;

    for (let s = 1; s <= stemCount; s++) {
        const sg = PioneerDDJFLX4._stemGroup(group, s);
        engine.setValue(sg, "mute", (s === stemIdx1) ? 0 : 1);
    }
};

// Pads 5–8: FX or momentary SOLO depending on STEMS_PAD5_8_MODE
PioneerDDJFLX4.stemFxPadPressed = function(_channel, control, value, _status, group) {
    const stemIdx1 = (control - PioneerDDJFLX4.stemFxPadsFirstControl) + 1;
    if (stemIdx1 < 1 || stemIdx1 > 4) return;

    if (PioneerDDJFLX4.STEMS_PAD5_8_MODE === "solo") {
        // momentary SOLO (needs Script-Binding to receive value 0x00 on release — du hast Script-Binding)
        if (value === 0x7F) PioneerDDJFLX4._stemMomentaryApply(group, stemIdx1, "solo");
        else if (value === 0x00) PioneerDDJFLX4._stemMomentaryRelease(group);
        return;
    }

    // FX toggle on press
    if (value !== 0x7F) return;
    const stemCount = PioneerDDJFLX4._stemCount(group);
    if (stemIdx1 > stemCount) return;

    const qg = PioneerDDJFLX4._stemQfxGroup(group, stemIdx1);
    engine.setValue(qg, "enabled", engine.getValue(qg, "enabled") ? 0 : 1);
};

PioneerDDJFLX4.stemFxPadShiftPressed = function(_channel, control, value, _status, group) {
    const stemIdx1 = (control - PioneerDDJFLX4.stemFxPadsFirstControl) + 1;
    if (stemIdx1 < 1 || stemIdx1 > 4) return;

    if (PioneerDDJFLX4.STEMS_PAD5_8_MODE === "solo") {
        // momentary HOLD-MUTE
        if (value === 0x7F) PioneerDDJFLX4._stemMomentaryApply(group, stemIdx1, "holdmute");
        else if (value === 0x00) PioneerDDJFLX4._stemMomentaryRelease(group);
        return;
    }

    // next preset on press
    if (value !== 0x7F) return;
    const stemCount = PioneerDDJFLX4._stemCount(group);
    if (stemIdx1 > stemCount) return;

    const qg = PioneerDDJFLX4._stemQfxGroup(group, stemIdx1);
    engine.setValue(qg, "next_chain_preset", 1);
};

// ------------------- ENGINE CALLBACKS (LED sync) -------------------
// Diese beiden müssen FUNKTIONEN sein, weil init() sie an makeConnection übergibt.

PioneerDDJFLX4.stemMuteChanged = function(value, group /* [ChannelX_StemY] */, _control) {
    const m = /\[Channel(\d+)_Stem(\d+)\]/.exec(group);
    if (!m) return;
    const deck = Number(m[1]);
    const stem = Number(m[2]);
    if (stem < 1 || stem > 4) return;

    const ch = `[Channel${deck}]`;
    const stemCount = engine.getValue(ch, "stem_count") | 0;

    // LED an = Stem NICHT gemutet und Stem existiert
    const on = (stem <= stemCount) && (value <= 0.5);
    const code = on ? 0x7F : 0x00;

    const statuses = PioneerDDJFLX4.stemsPadsModesStatus[ch] || [];
    for (const st of statuses) {
        midi.sendShortMsg(st, PioneerDDJFLX4.stemMutePadsFirstControl + stem - 1, code);
    }
};

PioneerDDJFLX4.stemFxChanged = function(value, group /* [QuickEffectRack1_[ChannelX_StemY]] */, _control) {
    const m = /\[QuickEffectRack1_\[Channel(\d+)_Stem(\d+)\]\]/.exec(group);
    if (!m) return;
    const deck = Number(m[1]);
    const stem = Number(m[2]);
    if (stem < 1 || stem > 4) return;

    const ch = `[Channel${deck}]`;
    const code = (value <= 0.5) ? 0x00 : 0x7F;

    const statuses = PioneerDDJFLX4.stemsPadsModesStatus[ch] || [];
    for (const st of statuses) {
        midi.sendShortMsg(st, PioneerDDJFLX4.stemFxPadsFirstControl + stem - 1, code);
    }
};

// stem_count changed -> refresh LEDs (this is what fixes “only updates after pressing pads”)
PioneerDDJFLX4.stemCountChanged = function(_value, group /* [Channel1]/[Channel2] */, _control) {
    if (typeof PioneerDDJFLX4._refreshKeyboardStemLeds === "function") {
        PioneerDDJFLX4._refreshKeyboardStemLeds(group);
    }
};
//
// Key Shift (Pitch Shift) – FLX4 Standard-Belegung laut Handbuch
// Pads: 1:+4, 2:+5, 3:+6, 4:+7, 5:0, 6:+1, 7:+2, 8:+3
//

PioneerDDJFLX4._keyShiftPadToSemitone = function(padIndex0to7) {
    // padIndex: 0..7 entspricht Pads 1..8
    const map = [4, 5, 6, 7, 0, 1, 2, 3];
    return map[padIndex0to7] ?? 0;
};

PioneerDDJFLX4.pitchAdjusted = function(_value, group, _control) {
    const cur = Math.round(engine.getValue(group, "pitch_adjust"));

    // Finde, welches Pad dazu passt
    const map = [4, 5, 6, 7, 0, 1, 2, 3];
    const idx = map.indexOf(cur); // 0..7 oder -1

    for (let i = 0; i < 8; i++) {
        const on = (i === idx);
        const code = on ? 0x7F : 0x00;

        PioneerDDJFLX4.pitchPadsModesStatus[group].forEach((padMode) => {
            midi.sendShortMsg(
                padMode,
                PioneerDDJFLX4.pitchPadsFirstControl + i,
                code
            );
        });
    }
};

PioneerDDJFLX4.pitchPadPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7F) return;

    const padIndex = control - PioneerDDJFLX4.pitchPadsFirstControl; // 0..7
    const semitone = PioneerDDJFLX4._keyShiftPadToSemitone(padIndex);

    engine.setValue(group, "pitch_adjust", semitone);
};

// SHIFT-Funktion: wenn du (wie im Handbuch) später „Anzeige/Pitch-Range ändern“ willst,
// MUSS man das als eigenen Offset/Bank implementieren.
// Solange du das nicht sauber nachbaust: lieber gar nichts tun, statt „irgendwie“.
PioneerDDJFLX4.pitchPadShiftPressed = function(_channel, _control, _value, _status, _group) {
    // absichtlich leer
};

//
// Shutdown
//

PioneerDDJFLX4.shutdown = function() {
    // --- Peak latch timers ---
    if (PioneerDDJFLX4._peakTimerL) engine.stopTimer(PioneerDDJFLX4._peakTimerL);
    if (PioneerDDJFLX4._peakTimerR) engine.stopTimer(PioneerDDJFLX4._peakTimerR);
    PioneerDDJFLX4._peakTimerL = 0;
    PioneerDDJFLX4._peakTimerR = 0;
    PioneerDDJFLX4._peakL = 0;
    PioneerDDJFLX4._peakR = 0;

    // --- Stop ALL sampler blink timers (wichtig) ---
    if (PioneerDDJFLX4.timersSampler) {
        for (const chanStr in PioneerDDJFLX4.timersSampler) {
            const chan = Number(chanStr);
            const controls = PioneerDDJFLX4.timersSampler[chan];
            if (!controls) continue;

            for (const ctrlStr in controls) {
                const t = controls[ctrlStr];
                if (t !== undefined && t !== 0) {
                    engine.stopTimer(t);
                }
                controls[ctrlStr] = undefined;
            }
        }
    }

    // loop blink timer (pro Deckgruppe) defensiv stoppen
    if (PioneerDDJFLX4.timersLoop) {
        for (const g in PioneerDDJFLX4.timersLoop) {
            const t = PioneerDDJFLX4.timersLoop[g]?.loopBlink;
            if (t) engine.stopTimer(t);
            if (PioneerDDJFLX4.timersLoop[g]) PioneerDDJFLX4.timersLoop[g].loopBlink = undefined;
        }
    }
    // --- Reset VU meter bargraph (CC 0x02) ---
    // Deck 1: 0xB0, Deck 2: 0xB1
    midi.sendShortMsg(0xB0, 0x02, 0x00);
    midi.sendShortMsg(0xB1, 0x02, 0x00);

    // Optional: zusätzlich dein "VU Meter Light" aus (falls das eine separate LED ist)
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.deck1.vuMeter, false);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.deck2.vuMeter, false);

    // --- housekeeping: Pads aus ---
    for (let i = 0; i <= 7; ++i) {
        // Sampler LEDs
        midi.sendShortMsg(0x97, 0x30 + i, 0x00);
        midi.sendShortMsg(0x98, 0x30 + i, 0x00);
        midi.sendShortMsg(0x99, 0x30 + i, 0x00);
        midi.sendShortMsg(0x9A, 0x30 + i, 0x00);

        // Hotcue LEDs
        midi.sendShortMsg(0x97, 0x00 + i, 0x00);
        midi.sendShortMsg(0x98, 0x00 + i, 0x00);
        midi.sendShortMsg(0x99, 0x00 + i, 0x00);
        midi.sendShortMsg(0x9A, 0x00 + i, 0x00);
    }

    // loop/reloop aus
    PioneerDDJFLX4.setLoopButtonLights(0x90, 0x00);
    PioneerDDJFLX4.setLoopButtonLights(0x91, 0x00);
    PioneerDDJFLX4.setReloopLight(0x90, 0x00);
    PioneerDDJFLX4.setReloopLight(0x91, 0x00);

    // flashing lights aus
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.beatFx, false);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.shiftBeatFx, false);

    // keepalive timer stoppen (defensiv)
    if (PioneerDDJFLX4.keepAliveTimer) {
        engine.stopTimer(PioneerDDJFLX4.keepAliveTimer);
        PioneerDDJFLX4.keepAliveTimer = 0;
    }
};
