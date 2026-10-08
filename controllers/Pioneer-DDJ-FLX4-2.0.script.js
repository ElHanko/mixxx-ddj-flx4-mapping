// Pioneer-DDJ-FLX4-2.0.script.js — Basic mapping for Mixxx 2.6.
// Derived from the Mixxx DDJ-FLX4 mapping; see the existing XML attribution.
// Optional extensions are loaded after this script on the same namespace.

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
        shiftPlayPause: { status: 0x90, data1: 0x0E },
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
        shiftPlayPause: { status: 0x91, data1: 0x0E },
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
// -----------------------------------------------------------------------------
// USER CONFIGURATION
// These values control optional behaviour of the mapping.
// Allowed values and their effects are documented inline.
// -----------------------------------------------------------------------------
//

// Library focus behaviour for the BROWSE button.
//
// false → default Mixxx behaviour (cycles through all library widgets)
// true  → toggle only between sidebar (tree view) and tracklist
//
PioneerDDJFLX4.BROWSE_FOCUS_TOGGLE_ONLY = true;

// -----------------------------------------------------------------------------
// LOOP BEHAVIOUR
// -----------------------------------------------------------------------------

// Loop adjustment mode.
//
// "simple"
//     Classic Mixxx loop adjust behaviour.
//
// "workflow"
//     Optional loop workflow with pending loop-out and jog-based loop
//     adjustment while a loop is active.
//
PioneerDDJFLX4.LOOP_ADJUST_MODE = "simple";


// Step size (in beats) used when adjusting loop points in "workflow" mode.
//
PioneerDDJFLX4.loopAdjustStepBeats = 0.02;


// Time (milliseconds) before loop-adjust mode automatically exits.
//
PioneerDDJFLX4.loopAdjustTimeoutMs = 5000;



// -----------------------------------------------------------------------------
// NAVIGATION / TRANSPORT
// -----------------------------------------------------------------------------

// Beat jump size used for quick jumps (SHIFT + CUE/LOOP CALL).
//
PioneerDDJFLX4.quickJumpSize = 32;

// -----------------------------------------------------------------------------
// JOG WHEEL BEHAVIOUR
// -----------------------------------------------------------------------------

// Pitch bend sensitivity when nudging the jog wheel
// while not in scratch (vinyl) mode.
//
PioneerDDJFLX4.bendScale = 0.8;


// Multiplier used when adjusting loop points via jog wheel.
//
PioneerDDJFLX4.loopAdjustMultiply = 50;

// Base playposition step per MIDI tick for Shift + Jog search.
// Higher values scan through the track faster.
//
PioneerDDJFLX4.jogSearchScale = 0.00015;

// Multiplier for Shift + Jog search when platter touch is held.
// Higher value = much faster scanning through the track.
PioneerDDJFLX4.shiftSearchTouchMultiplier = 2.0;


// ============================================================
// FX response tuning
// ============================================================
//
// Keep these options explicit and easy to find.
// Default should stay conservative to avoid surprising users.

PioneerDDJFLX4.fxTuning = PioneerDDJFLX4.fxTuning || {
    // Color / Smart CFX filter knob shaping:
    // false = linear/default XML-style response
    // true  = apply symmetric center curve in JS
    shapedFilterKnob: false,

    // Curve strengths (only used when shaping is enabled)
    filterCenterExp: 1.8
};

// -----------------------------------------------------------------------------
// STATE
// -----------------------------------------------------------------------------

PioneerDDJFLX4.shiftDown = false;
PioneerDDJFLX4._shiftDeck1 = false;
PioneerDDJFLX4._shiftDeck2 = false;

PioneerDDJFLX4.highResMSB = {
    "[Channel1]": {},
    "[Channel2]": {}
};

// pro Deck index (0/1) für Adjust-Flags (werden in beiden Modes genutzt)
PioneerDDJFLX4.loopAdjustIn = [false, false];
PioneerDDJFLX4.loopAdjustOut = [false, false];

// Pending-Out (nur relevant in "workflow"): loop_in gesetzt, loop_out fehlt noch
PioneerDDJFLX4._loopPendingOut = {
    "[Channel1]": false,
    "[Channel2]": false,
};

PioneerDDJFLX4._smartCfx = { enabled: false };

PioneerDDJFLX4.wheelTouch = [false, false];
PioneerDDJFLX4._scratchEnabled = [false, false];

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
PioneerDDJFLX4.scratchScale = PioneerDDJFLX4.scratchScale || 1.8;

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

PioneerDDJFLX4.pitchPadsModesStatus = {
    "[Channel1]": [0x97, 0x98],
    "[Channel2]": [0x99, 0x9A],
};

PioneerDDJFLX4.pitchPadsFirstControl = 0x70;

PioneerDDJFLX4.tempoRanges = [0.06, 0.10, 0.16, 0.25];

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

// -----------------------------------------------------------------------------
// CENTRAL LED REFRESH
// -----------------------------------------------------------------------------
//
// Goal:
// - one place to refresh visible controller state
// - deck-local LEDs via updateDeckLeds(group)
// - global LEDs via updateGlobalLeds()
// - init and mode changes should prefer these instead of scattered direct calls
//

PioneerDDJFLX4.updateDeckLeds = function(group) {
    const status = (group === "[Channel1]") ? 0x90 : 0x91;
    const padStatus = (group === "[Channel1]") ? 0x97 : 0x99;
        const deckLights = (group === "[Channel1]")
        ? PioneerDDJFLX4.lights.deck1
        : PioneerDDJFLX4.lights.deck2;
    const mode = PioneerDDJFLX4.padMode[group];

    // Pad mode button LEDs: exclusive per deck
    PioneerDDJFLX4.toggleLight(deckLights.hotcueMode,   mode === PioneerDDJFLX4.PADMODE.HOTCUE);
    PioneerDDJFLX4.toggleLight(deckLights.keyboardMode, mode === PioneerDDJFLX4.PADMODE.KEYBOARD);
    PioneerDDJFLX4.toggleLight(deckLights.padFX1Mode,   mode === PioneerDDJFLX4.PADMODE.PADFX1);
    PioneerDDJFLX4.toggleLight(deckLights.padFX2Mode,   mode === PioneerDDJFLX4.PADMODE.PADFX2);
    PioneerDDJFLX4.toggleLight(deckLights.beatJumpMode, mode === PioneerDDJFLX4.PADMODE.BEATJUMP);
    PioneerDDJFLX4.toggleLight(deckLights.beatLoopMode, mode === PioneerDDJFLX4.PADMODE.BEATLOOP);
    PioneerDDJFLX4.toggleLight(deckLights.samplerMode,  mode === PioneerDDJFLX4.PADMODE.SAMPLER);
    PioneerDDJFLX4.toggleLight(deckLights.keyShiftMode, mode === PioneerDDJFLX4.PADMODE.KEYSHIFT);

    // Loop LEDs
    if (typeof PioneerDDJFLX4._updateLoopLeds === "function") {
        PioneerDDJFLX4._updateLoopLeds(group, 0x10, status);
    }

    // Hotcue LEDs (only renders in Hotcue mode, function already guards itself)
    if (typeof PioneerDDJFLX4.updateHotcueLeds === "function") {
        PioneerDDJFLX4.updateHotcueLeds(group);
    }

    PioneerDDJFLX4.updatePadFxUI(group);

    // Pitch / Key Shift LEDs
    if (typeof PioneerDDJFLX4.pitchAdjusted === "function") {
        PioneerDDJFLX4.pitchAdjusted(0, group, "");
    }

    PioneerDDJFLX4.updateKeyboardLeds(group);

    // Static Beatjump mode pads
    if (typeof PioneerDDJFLX4._setBeatjumpPadsLit === "function") {
        PioneerDDJFLX4._setBeatjumpPadsLit(
            padStatus,
            PioneerDDJFLX4.padMode[group] === PioneerDDJFLX4.PADMODE.BEATJUMP
        );
    }

    // Static Beatloop mode pads
    if (typeof PioneerDDJFLX4._setBeatloopPadsLit === "function") {
        PioneerDDJFLX4._setBeatloopPadsLit(
            padStatus,
            PioneerDDJFLX4.padMode[group] === PioneerDDJFLX4.PADMODE.BEATLOOP
        );
    }
};

PioneerDDJFLX4.updateGlobalLeds = function() {
    if (typeof PioneerDDJFLX4._updateBeatFxOnOffLed === "function") {
        PioneerDDJFLX4._updateBeatFxOnOffLed();
    }

    if (typeof PioneerDDJFLX4.smartCfxLedFromEngine === "function") {
        PioneerDDJFLX4.smartCfxLedFromEngine(0, "", "");
    }
};

PioneerDDJFLX4.updateAllLeds = function() {
    PioneerDDJFLX4.updateDeckLeds("[Channel1]");
    PioneerDDJFLX4.updateDeckLeds("[Channel2]");
    PioneerDDJFLX4.updateGlobalLeds();
};

//
// Init
//

PioneerDDJFLX4.init = function() {
    engine.setValue("[EffectRack1_EffectUnit1]", "show_focus", 1);
    // A fresh Mixxx profile has focus 0; effect slots are numbered 1–3.
    if (engine.getValue("[EffectRack1_EffectUnit1]", "focused_effect") === 0) {
        engine.setValue("[EffectRack1_EffectUnit1]", "focused_effect", 1);
    }

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
    engine.softTakeover("[EffectRack1_EffectUnit1]", "mix", true);

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

    // play the "track loaded" animation on both decks at startup
    midi.sendShortMsg(0x9F, 0x00, 0x7F);
    midi.sendShortMsg(0x9F, 0x01, 0x7F);

    engine.makeConnection("[Channel1]", "loop_enabled", PioneerDDJFLX4.loopToggle);
    engine.makeConnection("[Channel2]", "loop_enabled", PioneerDDJFLX4.loopToggle);

    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.loopTrackLoaded);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.loopTrackLoaded);

    // Standard EffectUnit1 indicators. The overlay reuses the slot callbacks.
    for (let slot = 1; slot <= 3; slot++) {
        engine.makeConnection(`[EffectRack1_EffectUnit1_Effect${slot}]`, "enabled", function() {
            PioneerDDJFLX4._updateBeatFxOnOffLed();
        });
    }
    engine.makeConnection("[EffectRack1_EffectUnit1]", "focused_effect", function() {
        PioneerDDJFLX4._updateBeatFxOnOffLed();
    });

    // Smart CFX LED sync
    engine.makeConnection(PioneerDDJFLX4._qfxGroup(1), "enabled", PioneerDDJFLX4.smartCfxLedFromEngine);
    engine.makeConnection(PioneerDDJFLX4._qfxGroup(2), "enabled", PioneerDDJFLX4.smartCfxLedFromEngine);

    // Register callbacks for each deck, when a file is loaded to reset pitch shift
    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.pitchAdjusted);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.pitchAdjusted);

    // Register callbacks for each deck, when the pitch shift is modified
    engine.makeConnection("[Channel1]", "pitch_adjust", PioneerDDJFLX4.pitchAdjusted);
    engine.makeConnection("[Channel2]", "pitch_adjust", PioneerDDJFLX4.pitchAdjusted);

    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.keyboardTrackLoaded);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.keyboardTrackLoaded);

    // Hotcue bank setup
    PioneerDDJFLX4._bindHotcueBankConnections("[Channel1]");
    PioneerDDJFLX4._bindHotcueBankConnections("[Channel2]");

// ------------------- DEFAULT PAD MODE -------------------
PioneerDDJFLX4.padMode = PioneerDDJFLX4.padMode || {};
PioneerDDJFLX4.padMode["[Channel1]"] = PioneerDDJFLX4.PADMODE.HOTCUE;
PioneerDDJFLX4.padMode["[Channel2]"] = PioneerDDJFLX4.PADMODE.HOTCUE;

    // central initial LED refresh
    PioneerDDJFLX4.updateAllLeds();

    PioneerDDJFLX4.keepAliveTimer = engine.beginTimer(200, PioneerDDJFLX4.sendKeepAlive);

    // query the controller for current control positions on startup
    PioneerDDJFLX4.sendKeepAlive(); // the query seems to double as a keep alive message


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
// Waveform zoom (relative SHIFT+BROWSE encoder)
//

PioneerDDJFLX4.waveformZoom = function (_ch, _ctrl, value, _status, _group) {
    if (value === 0x00 || value === 0x40) {
        return;
    }

    const steps = value < 0x40 ? value : value - 0x80;
    const dir = steps < 0 ? "up" : "down";

    // "global" feel: apply to both decks
    for (let i = 0; i < Math.abs(steps); i++) {
        script.triggerControl("[Channel1]", "waveform_zoom_" + dir, 50);
        script.triggerControl("[Channel2]", "waveform_zoom_" + dir, 50);
    }
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

    if (v < 0.02) newVal = 0x00;

    if (group === "[Channel1]" && PioneerDDJFLX4._peakL) newVal = Math.max(newVal, PioneerDDJFLX4.VU.RED_START);
    else if (group === "[Channel2]" && PioneerDDJFLX4._peakR) newVal = Math.max(newVal, PioneerDDJFLX4.VU.RED_START);

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

    //  HARD GUARD: target darf nicht laufen
    if (engine.getValue(targetGroup, "play") === 1) {
        return false;
    }

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

///////////////////////////////////////////////////////////////
// TRIM / CFX GUARD with soft takeover
//
// The FLX4 appears to send additional TRIM MIDI messages while
// moving the CFX knob in the outer range.
//
// Therefore TRIM is routed through JS.
// Protection strategy:
// - CFX movement locks TRIM for a short time
// - CFX movement also resets TRIM pickup state
// - TRIM only changes pregain after soft-takeover pickup
//
// This prevents false TRIM messages from jumping pregain to the
// current CFX knob position.
///////////////////////////////////////////////////////////////

PioneerDDJFLX4.trimCfxGuardMs =
    Number.isFinite(PioneerDDJFLX4.trimCfxGuardMs)
        ? PioneerDDJFLX4.trimCfxGuardMs
        : 2000;

PioneerDDJFLX4.trimPickupThreshold =
    Number.isFinite(PioneerDDJFLX4.trimPickupThreshold)
        ? PioneerDDJFLX4.trimPickupThreshold
        : 0.02; // ~2 %

PioneerDDJFLX4.trimPickupHoldMs =
    Number.isFinite(PioneerDDJFLX4.trimPickupHoldMs)
        ? PioneerDDJFLX4.trimPickupHoldMs
        : 1000;

PioneerDDJFLX4._trimLockUntil = PioneerDDJFLX4._trimLockUntil || {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

PioneerDDJFLX4._trim14bit = PioneerDDJFLX4._trim14bit || {
    "[Channel1]": { msb: 0 },
    "[Channel2]": { msb: 0 },
};

PioneerDDJFLX4._trimPickup = PioneerDDJFLX4._trimPickup || {
    "[Channel1]": false,
    "[Channel2]": false,
};

PioneerDDJFLX4._trimPickupTimer = PioneerDDJFLX4._trimPickupTimer || {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

PioneerDDJFLX4._resetTrimPickup = function(group) {
    PioneerDDJFLX4._trimPickup[group] = false;

    if (PioneerDDJFLX4._trimPickupTimer[group]) {
        engine.stopTimer(PioneerDDJFLX4._trimPickupTimer[group]);
        PioneerDDJFLX4._trimPickupTimer[group] = 0;
    }
};

PioneerDDJFLX4._refreshTrimPickupHold = function(group) {
    if (PioneerDDJFLX4._trimPickupTimer[group]) {
        engine.stopTimer(PioneerDDJFLX4._trimPickupTimer[group]);
    }

    PioneerDDJFLX4._trimPickupTimer[group] = engine.beginTimer(
        PioneerDDJFLX4.trimPickupHoldMs,
        function() {
            PioneerDDJFLX4._trimPickupTimer[group] = 0;
            PioneerDDJFLX4._trimPickup[group] = false;
        },
        true
    );
};

PioneerDDJFLX4._lockTrimAfterCfx = function(channelGroup) {
    PioneerDDJFLX4._trimLockUntil[channelGroup] =
        Date.now() + PioneerDDJFLX4.trimCfxGuardMs;

    // Important:
    // After CFX movement, TRIM must be picked up again.
    // This prevents stale pickup state from allowing false TRIM events through.
    PioneerDDJFLX4._resetTrimPickup(channelGroup);
};

PioneerDDJFLX4._isTrimLocked = function(channelGroup) {
    return Date.now() < (PioneerDDJFLX4._trimLockUntil[channelGroup] || 0);
};

PioneerDDJFLX4._trimSoftTakeoverPass = function(group, hardwareValue) {
    if (PioneerDDJFLX4._trimPickup[group]) {
        return true;
    }

    const currentValue = engine.getParameter(group, "pregain");
    const diff = Math.abs(hardwareValue - currentValue);

    if (diff <= PioneerDDJFLX4.trimPickupThreshold) {
        PioneerDDJFLX4._trimPickup[group] = true;
        return true;
    }

    return false;
};

PioneerDDJFLX4.trimMsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._trim14bit[group].msb = value;
};

PioneerDDJFLX4.trimLsb = function(_channel, _control, value, _status, group) {
    const msb = PioneerDDJFLX4._trim14bit[group].msb;
    const fullValue = (msb << 7) + value;
    const normalized = fullValue / 16383;

    if (PioneerDDJFLX4._isTrimLocked(group)) {
        PioneerDDJFLX4._resetTrimPickup(group);
        return;
    }

    if (!PioneerDDJFLX4._trimSoftTakeoverPass(group, normalized)) {
        return;
    }

    engine.setParameter(group, "pregain", normalized);
    PioneerDDJFLX4._refreshTrimPickupHold(group);
};

///////////////////////////////////////////////////////////////
// END TRIM / CFX GUARD
///////////////////////////////////////////////////////////////

// Shared 14-bit EQ input and ordinary EQ routing.
PioneerDDJFLX4.eq14bit = PioneerDDJFLX4.eq14bit || {
    "[Channel1]": { highMsb: 0, midMsb: 0, lowMsb: 0 },
    "[Channel2]": { highMsb: 0, midMsb: 0, lowMsb: 0 },
};

PioneerDDJFLX4._clamp01 = function(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
};

PioneerDDJFLX4._eqGroupFromChannelGroup = function(channelGroup) {
    return `[EqualizerRack1_${channelGroup}_Effect1]`;
};

PioneerDDJFLX4._eqKeyFromBand = function(band) {
    if (band === "low") return "parameter1";
    if (band === "mid") return "parameter2";
    return "parameter3"; // high
};

PioneerDDJFLX4._setEqValue = function(channelGroup, band, value) {
    const eqGroup = PioneerDDJFLX4._eqGroupFromChannelGroup(channelGroup);
    const eqKey = PioneerDDJFLX4._eqKeyFromBand(band);
    engine.setParameter(eqGroup, eqKey, PioneerDDJFLX4._clamp01(value));
};

PioneerDDJFLX4._eqSetMsb = function(channelGroup, band, value) {
    if (band === "high") {
        PioneerDDJFLX4.eq14bit[channelGroup].highMsb = value;
    } else if (band === "mid") {
        PioneerDDJFLX4.eq14bit[channelGroup].midMsb = value;
    } else {
        PioneerDDJFLX4.eq14bit[channelGroup].lowMsb = value;
    }
};

PioneerDDJFLX4._eqApplyLsb = function(channelGroup, band, lsbValue) {
    let msbValue;

    if (band === "high") {
        msbValue = PioneerDDJFLX4.eq14bit[channelGroup].highMsb;
    } else if (band === "mid") {
        msbValue = PioneerDDJFLX4.eq14bit[channelGroup].midMsb;
    } else {
        msbValue = PioneerDDJFLX4.eq14bit[channelGroup].lowMsb;
    }

    const fullValue = (msbValue << 7) + lsbValue;
    PioneerDDJFLX4._routeEq(channelGroup, band, fullValue);
};

PioneerDDJFLX4.eqHighMsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._eqSetMsb(group, "high", value);
};

PioneerDDJFLX4.eqHighLsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._eqApplyLsb(group, "high", value);
};

PioneerDDJFLX4.eqMidMsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._eqSetMsb(group, "mid", value);
};

PioneerDDJFLX4.eqMidLsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._eqApplyLsb(group, "mid", value);
};

PioneerDDJFLX4.eqLowMsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._eqSetMsb(group, "low", value);
};

PioneerDDJFLX4.eqLowLsb = function(_channel, _control, value, _status, group) {
    PioneerDDJFLX4._eqApplyLsb(group, "low", value);
};

PioneerDDJFLX4._routeEq = function(channelGroup, band, value14bit) {
    PioneerDDJFLX4._setEqValue(channelGroup, band, value14bit / 16383);
};

PioneerDDJFLX4.playPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F) {
        return;
    }
    // Commit a running Hotcue preview to normal playback.
    if (PioneerDDJFLX4._hotcuePreview[group]) {
        PioneerDDJFLX4._hotcuePreview[group] = 0;
        PioneerDDJFLX4.updateHotcueLeds(group);
        return;
    }
    script.toggleControl(group, "play");
};

///////////////////////////////////////////////////////////////
// HOTCUE BANKS (FLX4)
// - 4 banks à 8 hotcues by default -> hotcue_1..32
// - Re-press HOT CUE mode button to cycle bank
// - LEDs are script-driven for the active bank
// - Saved loops (hotcue_X_type == 4) blink in Hotcue mode
// - Optional preview-on-hold when deck is stopped
///////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// CONFIG
// -----------------------------------------------------------------------------

PioneerDDJFLX4.hotcueBankCount = 4;

// Behavior when pressing an existing hotcue while the deck is stopped.
//
// "preview" -> play while pad is held; stop and return on release
// "goto"    -> jump to hotcue and remain stopped
// "play"    -> jump to hotcue and continue playing
//
PioneerDDJFLX4.HOTCUE_STOPPED_MODE = "preview";


// -----------------------------------------------------------------------------
// STATE
// -----------------------------------------------------------------------------

PioneerDDJFLX4.hotcueBank = PioneerDDJFLX4.hotcueBank || {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

PioneerDDJFLX4._hotcuePreview = PioneerDDJFLX4._hotcuePreview || {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

PioneerDDJFLX4._hotcueBlinkState = PioneerDDJFLX4._hotcueBlinkState || {
    "[Channel1]": false,
    "[Channel2]": false,
};

PioneerDDJFLX4._hotcueBlinkTimer = PioneerDDJFLX4._hotcueBlinkTimer || {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

PioneerDDJFLX4._hotcueBankFlashTimer = PioneerDDJFLX4._hotcueBankFlashTimer || {
    "[Channel1]": 0,
    "[Channel2]": 0,
};


// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

PioneerDDJFLX4.getHotcueBank = function(group) {
    return PioneerDDJFLX4.hotcueBank[group] || 0;
};

PioneerDDJFLX4._hotcueBaseNumber = function(group) {
    return PioneerDDJFLX4.getHotcueBank(group) * 8;
};

PioneerDDJFLX4._hotcueNumberFromPad = function(group, padIndex) {
    return PioneerDDJFLX4._hotcueBaseNumber(group) + padIndex + 1;
};

PioneerDDJFLX4._hotcuePadStatuses = function(group) {
    return (group === "[Channel1]") ? [0x97, 0x98] : [0x99, 0x9A];
};

PioneerDDJFLX4._hotcuePadLed = function(group, padIndex, on) {
    const statuses = PioneerDDJFLX4._hotcuePadStatuses(group);
    const note = padIndex & 0x7F;
    const val = on ? 0x7F : 0x00;

    statuses.forEach((st) => {
        midi.sendShortMsg(st, note, val);
    });
};

PioneerDDJFLX4._stopHotcueBlinkTimer = function(group) {
    const t = PioneerDDJFLX4._hotcueBlinkTimer[group];
    if (t) {
        engine.stopTimer(t);
        PioneerDDJFLX4._hotcueBlinkTimer[group] = 0;
    }
};

PioneerDDJFLX4._ensureHotcueBlinkTimer = function(group) {
    if (PioneerDDJFLX4._hotcueBlinkTimer[group]) {
        return;
    }

    PioneerDDJFLX4._hotcueBlinkTimer[group] = engine.beginTimer(500, function() {
        PioneerDDJFLX4._hotcueBlinkState[group] = !PioneerDDJFLX4._hotcueBlinkState[group];
        PioneerDDJFLX4.updateHotcueLeds(group);
    });
};

PioneerDDJFLX4._hotcueConnectionKey = function(group, num, suffix) {
    return `${group}|${num}|${suffix}`;
};

PioneerDDJFLX4._hotcueConnections = PioneerDDJFLX4._hotcueConnections || {};

PioneerDDJFLX4._bindHotcueBankConnections = function(group) {
    const base = PioneerDDJFLX4._hotcueBaseNumber(group);

    for (let i = 0; i < 8; i++) {
        const num = base + i + 1;
        const statusKey = PioneerDDJFLX4._hotcueConnectionKey(group, num, "status");
        const typeKey = PioneerDDJFLX4._hotcueConnectionKey(group, num, "type");

        if (!PioneerDDJFLX4._hotcueConnections[statusKey]) {
            PioneerDDJFLX4._hotcueConnections[statusKey] = engine.makeConnection(
                group,
                `hotcue_${num}_status`,
                function() {
                    PioneerDDJFLX4.updateHotcueLeds(group);
                    PioneerDDJFLX4.updateKeyboardLeds(group);
                }
            );
        }

        if (!PioneerDDJFLX4._hotcueConnections[typeKey]) {
            PioneerDDJFLX4._hotcueConnections[typeKey] = engine.makeConnection(
                group,
                `hotcue_${num}_type`,
                function() {
                    PioneerDDJFLX4.updateHotcueLeds(group);
                }
            );
        }
    }
};

PioneerDDJFLX4.updateHotcueLeds = function(group) {
    if (PioneerDDJFLX4.padMode[group] !== PioneerDDJFLX4.PADMODE.HOTCUE) {
        return;
    }

    const base = PioneerDDJFLX4._hotcueBaseNumber(group);
    let needsBlinkTimer = false;

    for (let i = 0; i < 8; i++) {
        const num = base + i + 1;
        const enabled = engine.getValue(group, `hotcue_${num}_status`) > 0;
        const type = engine.getValue(group, `hotcue_${num}_type`);

        if (!enabled) {
            PioneerDDJFLX4._hotcuePadLed(group, i, false);
            continue;
        }

        // saved loop -> blink
        if (type === 4) {
            needsBlinkTimer = true;
            PioneerDDJFLX4._hotcuePadLed(group, i, PioneerDDJFLX4._hotcueBlinkState[group]);
            continue;
        }

        PioneerDDJFLX4._hotcuePadLed(group, i, true);
    }

    if (needsBlinkTimer) {
        PioneerDDJFLX4._ensureHotcueBlinkTimer(group);
    } else {
        PioneerDDJFLX4._stopHotcueBlinkTimer(group);
        PioneerDDJFLX4._hotcueBlinkState[group] = false;
    }
};

PioneerDDJFLX4.flashHotcueBank = function(group) {
    const statuses = PioneerDDJFLX4._hotcuePadStatuses(group);
    const bank = PioneerDDJFLX4.getHotcueBank(group); // 0..3
    const litPads = (bank === 0) ? 8 : (bank + 1);

    const old = PioneerDDJFLX4._hotcueBankFlashTimer[group];
    if (old) {
        engine.stopTimer(old);
        PioneerDDJFLX4._hotcueBankFlashTimer[group] = 0;
    }

    // first clear all
    for (let i = 0; i < 8; i++) {
        statuses.forEach((st) => midi.sendShortMsg(st, i, 0x00));
    }

    // then light feedback pattern
    for (let i = 0; i < litPads; i++) {
        statuses.forEach((st) => midi.sendShortMsg(st, i, 0x7F));
    }

    PioneerDDJFLX4._hotcueBankFlashTimer[group] = engine.beginTimer(220, function() {
        PioneerDDJFLX4._hotcueBankFlashTimer[group] = 0;
        PioneerDDJFLX4.updateHotcueLeds(group);
    }, true);
};

PioneerDDJFLX4.cycleHotcueBank = function(group) {
    PioneerDDJFLX4._stopHotcuePreview(group);
    const cur = PioneerDDJFLX4.getHotcueBank(group);
    const max = Math.max(1, PioneerDDJFLX4.hotcueBankCount | 0);
    PioneerDDJFLX4.hotcueBank[group] = (cur + 1) % max;

    PioneerDDJFLX4._bindHotcueBankConnections(group);
    PioneerDDJFLX4.flashHotcueBank(group);
};


// -----------------------------------------------------------------------------
// HOTCUE PAD INPUT
// normal layer: activate / stopped-deck behavior
// shift layer: clear
// -----------------------------------------------------------------------------

PioneerDDJFLX4._stopHotcuePreview = function(group) {
    const num = PioneerDDJFLX4._hotcuePreview[group] | 0;
    if (!num) {
        return;
    }

    PioneerDDJFLX4._hotcuePreview[group] = 0;
    engine.setValue(group, "play", 0);
    engine.setValue(group, `hotcue_${num}_goto`, 1);
    PioneerDDJFLX4.updateHotcueLeds(group);
};

PioneerDDJFLX4.hotcuePad = function(_channel, control, value, status, group) {
    const note = control & 0x7F;
    const isShiftLayer = (status === 0x98 || status === 0x9A);
    const padIndex = note;

    if (padIndex < 0 || padIndex > 7) {
        return;
    }

    // Match the held pad before checking the current bank or mode.
    if (value === 0x00) {
        const preview = PioneerDDJFLX4._hotcuePreview[group] | 0;
        if (!isShiftLayer && preview && (preview - 1) % 8 === padIndex) {
            PioneerDDJFLX4._stopHotcuePreview(group);
        }
        return;
    }

    if (PioneerDDJFLX4.padMode[group] !== PioneerDDJFLX4.PADMODE.HOTCUE) {
        return;
    }

    const hotcueNumber = PioneerDDJFLX4._hotcueNumberFromPad(group, padIndex);
    const baseName = `hotcue_${hotcueNumber}`;

    if (value !== 0x7F) {
        return;
    }

    // Shift layer = clear
    if (isShiftLayer) {
        script.triggerControl(group, `${baseName}_clear`);
        PioneerDDJFLX4.updateHotcueLeds(group);
        return;
    }

    const playing = engine.getValue(group, "play") > 0;
    const enabled = engine.getValue(group, `${baseName}_status`) > 0;

    // empty slot -> set cue
    if (!enabled) {
        script.triggerControl(group, `${baseName}_activate`);
        PioneerDDJFLX4.updateHotcueLeds(group);
        return;
    }

    // Existing hotcue on a stopped deck.
    if (!playing) {
        switch (PioneerDDJFLX4.HOTCUE_STOPPED_MODE) {
        case "preview":
            // Play only while the pad is held.
            engine.setValue(group, `${baseName}_goto`, 1);
            engine.setValue(group, "play", 1);
            PioneerDDJFLX4._hotcuePreview[group] = hotcueNumber;
            PioneerDDJFLX4.updateHotcueLeds(group);
            return;

        case "goto":
            // Jump to the hotcue but remain stopped.
            engine.setValue(group, `${baseName}_goto`, 1);
            PioneerDDJFLX4.updateHotcueLeds(group);
            return;

        case "play":
        default:
            // Jump to the hotcue and continue playing.
            engine.setValue(group, `${baseName}_goto`, 1);
            engine.setValue(group, "play", 1);
            PioneerDDJFLX4.updateHotcueLeds(group);
            return;
        }
    }

    // normal activate while playing
    script.triggerControl(group, `${baseName}_activate`);
    PioneerDDJFLX4.updateHotcueLeds(group);
};

// Beat FX adapted from Mixxx 2.6 Pioneer-DDJ-FLX4-script.js.
// Original mapping authors: Warker, nschloe, dj3730, jusko, Robert904.
PioneerDDJFLX4.focusedFxGroup = function() {
    const focusedFx = engine.getValue("[EffectRack1_EffectUnit1]", "focused_effect") || 1;
    return "[EffectRack1_EffectUnit1_Effect" + focusedFx + "]";
};

PioneerDDJFLX4.beatFxLevelDepthRotate = function(_channel, control, value) {
    // Basic follows the official 7-bit knob mapping; LSB is reserved for Extended.
    if (control !== 0x02) {
        return;
    }
    if (PioneerDDJFLX4.shiftDown) {
        engine.softTakeoverIgnoreNextValue("[EffectRack1_EffectUnit1]", "mix");
        engine.setParameter(PioneerDDJFLX4.focusedFxGroup(), "meta", value / 0x7F);
    } else {
        engine.softTakeoverIgnoreNextValue(PioneerDDJFLX4.focusedFxGroup(), "meta");
        engine.setParameter("[EffectRack1_EffectUnit1]", "mix", value / 0x7F);
    }
};

PioneerDDJFLX4.changeFocusedEffectBy = function(numberOfSteps) {
    let focusedEffect = engine.getValue("[EffectRack1_EffectUnit1]", "focused_effect") || 1;

    // Convert to zero-based index
    focusedEffect -= 1;

    // Standard Euclidean modulo by use of two plain modulos
    const numberOfEffectsPerEffectUnit = 3;
    focusedEffect = (((focusedEffect + numberOfSteps) % numberOfEffectsPerEffectUnit) + numberOfEffectsPerEffectUnit) % numberOfEffectsPerEffectUnit;

    // Convert back to one-based index
    focusedEffect += 1;

    engine.setValue("[EffectRack1_EffectUnit1]", "focused_effect", focusedEffect);
};

PioneerDDJFLX4.beatFxSelectPressed = function(_channel, _control, value) {
    if (value === 0) { return; }

    engine.setValue(PioneerDDJFLX4.focusedFxGroup(), "next_effect", value);
};

PioneerDDJFLX4.beatFxSelectShiftPressed = function(_channel, _control, value) {
    if (value === 0) { return; }

    engine.setValue(PioneerDDJFLX4.focusedFxGroup(), "prev_effect", value);
};

PioneerDDJFLX4.beatFxLeftPressed = function(_channel, _control, value) {
    if (value === 0) { return; }

    PioneerDDJFLX4.changeFocusedEffectBy(-1);
};

PioneerDDJFLX4.beatFxRightPressed = function(_channel, _control, value) {
    if (value === 0) { return; }

    PioneerDDJFLX4.changeFocusedEffectBy(1);
};

PioneerDDJFLX4.beatFxOnOffPressed = function(_channel, _control, value) {
    if (value === 0) { return; }

    const toggleEnabled = !engine.getValue(PioneerDDJFLX4.focusedFxGroup(), "enabled");
    engine.setValue(PioneerDDJFLX4.focusedFxGroup(), "enabled", toggleEnabled);
};

PioneerDDJFLX4.beatFxOnOffShiftPressed = function(_channel, _control, value) {
    if (value === 0) { return; }

    engine.setParameter("[EffectRack1_EffectUnit1]", "mix", 0);
    engine.softTakeoverIgnoreNextValue("[EffectRack1_EffectUnit1]", "mix");

    for (let i = 1; i <= 3; i++) {
        engine.setValue("[EffectRack1_EffectUnit1_Effect" + i + "]", "enabled", 0);
    }
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.beatFx, false);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.shiftBeatFx, false);
};

PioneerDDJFLX4.beatFxChannel1 = function(_channel, _control, value, _status, group) {
    let enableChannel = 0;

    if (value === 0x7f) { enableChannel = 1; }

    engine.setValue(group, "group_[Channel1]_enable", enableChannel);
};

PioneerDDJFLX4.beatFxChannel2 = function(_channel, _control, value, _status, group) {
    let enableChannel = 0;

    if (value === 0x7f) { enableChannel = 1; }

    engine.setValue(group, "group_[Channel2]_enable", enableChannel);
};

PioneerDDJFLX4._updateBeatFxOnOffLed = function() {
    const enabled = engine.getValue(PioneerDDJFLX4.focusedFxGroup(), "enabled");
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.beatFx, enabled);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.shiftBeatFx, enabled);
};

// --- SMART CFX (Version A: universal) ---
PioneerDDJFLX4._smartCfx = PioneerDDJFLX4._smartCfx || { enabled: false };

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
        // Shift: cycle Smart CFX / QuickEffect preset
        engine.setValue(g1, "next_chain_preset", 1);
        engine.setValue(g2, "next_chain_preset", 1);
        return;
    }

    // Normal: toggle Smart CFX on/off
    const enabled =
        engine.getValue(g1, "enabled") > 0 ||
        engine.getValue(g2, "enabled") > 0;

    const nextEnabled = !enabled;

    PioneerDDJFLX4._smartCfx.enabled = nextEnabled;

    engine.setValue(g1, "enabled", nextEnabled ? 1 : 0);
    engine.setValue(g2, "enabled", nextEnabled ? 1 : 0);

    PioneerDDJFLX4.setLed(0x96, 0x00, nextEnabled);
};

/**
 * Shapes a linear value (0..1) into a symmetric curve around the center (0.5).
 *
 * Purpose:
 * - Keep the center (neutral filter position) stable and easy to control
 * - Increase sensitivity toward the edges (stronger LPF/HPF effect)
 * - Maintain symmetry (left = LPF, right = HPF)
 *
 * @param {number} v   - linear input value (0..1)
 * @param {number} exp - curve exponent:
 *                       ~1.6 = softer response
 *                       ~1.8 = good default
 *                       ~2.0 = stronger effect at edges
 *
 * @returns {number}   - shaped output value (0..1)
 */
PioneerDDJFLX4._centerCurve = function(v, exp) {
    let x = v - 0.5;               // shift center (0.5 → 0)
    const sign = x < 0 ? -1 : 1;   // remember direction (left/right)

    x = Math.abs(x) * 2;           // map 0..0.5 → 0..1
    x = Math.pow(x, exp) / 2;      // apply curve, scale back

    return 0.5 + sign * x;         // restore original range (0..1)
};

/**
 * Storage for 14-bit MIDI values (MSB + LSB).
 *
 * Why:
 * - The controller sends high-resolution knob data in two parts
 * - We need to combine them into a single 0..16383 value
 * - Then normalize to 0..1
 *
 * Separate storage per channel (ch1 / ch2).
 */
PioneerDDJFLX4._filterKnob = PioneerDDJFLX4._filterKnob || {
    ch1: { msb: 0, lsb: 0 },
    ch2: { msb: 0, lsb: 0 }
};

/**
 * Last received values to suppress duplicate MIDI events.
 *
 * Some controllers repeatedly send identical values → unnecessary updates.
 */
PioneerDDJFLX4._filterKnobLast = PioneerDDJFLX4._filterKnobLast || {
    ch1: { msb: -1, lsb: -1 },
    ch2: { msb: -1, lsb: -1 }
};

/**
 * Handles the Color FX / Filter knob for Channel 1.
 *
 * Steps:
 * 1. Combine MSB + LSB into a 14-bit value
 * 2. Normalize to 0..1
 * 3. Apply center curve if shapedFilterKnob is enabled (default: false)
 * 4. Send result to Mixxx (QuickEffectRack super1)
 */
PioneerDDJFLX4.filterCh1Rotate = function(_channel, control, value) {
    PioneerDDJFLX4._lockTrimAfterCfx("[Channel1]");
    if (control === 0x17) {
        if (PioneerDDJFLX4._filterKnobLast.ch1.msb === value) return;
        PioneerDDJFLX4._filterKnobLast.ch1.msb = value;
        PioneerDDJFLX4._filterKnob.ch1.msb = value & 0x7F;
    } else if (control === 0x37) {
        if (PioneerDDJFLX4._filterKnobLast.ch1.lsb === value) return;
        PioneerDDJFLX4._filterKnobLast.ch1.lsb = value;
        PioneerDDJFLX4._filterKnob.ch1.lsb = value & 0x7F;
    } else {
        return;
    }

    const full14 = (PioneerDDJFLX4._filterKnob.ch1.msb << 7)
                 | PioneerDDJFLX4._filterKnob.ch1.lsb;

    const v = full14 / 0x3FFF;

    const out = PioneerDDJFLX4.fxTuning.shapedFilterKnob
        ? PioneerDDJFLX4._centerCurve(v, PioneerDDJFLX4.fxTuning.filterCenterExp)
        : v;

    engine.setParameter("[QuickEffectRack1_[Channel1]]", "super1", out);
};

/**
 * Same logic as Channel 1, applied to Channel 2.
 * Only MIDI controls and target group differ.
 */
PioneerDDJFLX4.filterCh2Rotate = function(_channel, control, value) {
    PioneerDDJFLX4._lockTrimAfterCfx("[Channel2]");
    if (control === 0x18) {
        if (PioneerDDJFLX4._filterKnobLast.ch2.msb === value) return;
        PioneerDDJFLX4._filterKnobLast.ch2.msb = value;
        PioneerDDJFLX4._filterKnob.ch2.msb = value & 0x7F;
    } else if (control === 0x38) {
        if (PioneerDDJFLX4._filterKnobLast.ch2.lsb === value) return;
        PioneerDDJFLX4._filterKnobLast.ch2.lsb = value;
        PioneerDDJFLX4._filterKnob.ch2.lsb = value & 0x7F;
    } else {
        return;
    }

    const full14 = (PioneerDDJFLX4._filterKnob.ch2.msb << 7)
                 | PioneerDDJFLX4._filterKnob.ch2.lsb;

    const v = full14 / 0x3FFF;

    const out = PioneerDDJFLX4.fxTuning.shapedFilterKnob
        ? PioneerDDJFLX4._centerCurve(v, PioneerDDJFLX4.fxTuning.filterCenterExp)
        : v;

    engine.setParameter("[QuickEffectRack1_[Channel2]]", "super1", out);
};

// No native Rekordbox Active Loop arm/disarm control in Mixxx 2.6.
PioneerDDJFLX4.shiftReloopExitPressed = function(_channel, _control, _value, _status, _group) {};

PioneerDDJFLX4.jogVinylEnabled = function(_group) {
    return true;
};

PioneerDDJFLX4.shiftChannelCuePressed = function(_channel, _control, value, _status, group) {
    engine.setValue(group, "bpm_tap", value > 0 ? 1 : 0);
};

// Pad FX modes keep their MIDI hooks but have no Basic effect engine.
PioneerDDJFLX4.padFxPadPressed = function(_channel, _control, _value, _status, _group) {};
PioneerDDJFLX4.updatePadFxUI = function(group) {
    const statuses = PioneerDDJFLX4._hotcuePadStatuses(group);
    [0x10, 0x50].forEach(function(base) {
        for (let pad = 0; pad < 8; pad++) {
            statuses.forEach(function(status) {
                midi.sendShortMsg(status, base + pad, 0);
            });
        }
    });
};


///////////////////////////////////////////////////////////////
// Loop Features (FLX4) – dual mode switch + auto-timeout
//
// Goals:
// - 4BEAT/EXIT:    Loop ON  -> reloop_exit
//                 Loop OFF -> start a new 4-beat loop
// - LOOP IN / OUT buttons:
//    Mode "simple":    wie bisher: Adjust-Modus nur wenn Loop aktiv
//    Mode "workflow":  wenn Loop aus:
//                        IN  -> setzt loop_in + Pending-Out (OUT fehlt noch)
//                        OUT -> setzt loop_out (und aktiviert Loop)
//                      wenn Loop an:
//                        IN/OUT toggeln Adjust-Modus + Blink-LEDs
// - LED/Blinking bleibt zentral über loop_enabled callback + Blink-Timer
// - Auto-exit: wenn 5s kein Adjust (Jog) kommt -> Adjust-Modus aus + LEDs zurück
///////////////////////////////////////////////////////////////

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
PioneerDDJFLX4.loopToggle = function(value, group, _control) {
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
// Loop on -> exit; loop off -> start a new 4-beat loop at the current position.
PioneerDDJFLX4.reloopExitPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F || engine.getValue(group, "track_loaded") !== 1) {
        return;
    }
    if (engine.getValue(group, "loop_enabled") > 0) {
        script.triggerControl(group, "reloop_exit");
    } else {
        script.triggerControl(group, "beatloop_4_activate");
    }
};

// -------------------  HELPERS -------------------
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

// Hook für jogTurn(): in workflow-mode sample-based adjust
PioneerDDJFLX4._handleJogLoopAdjust = function(channelIdx, group, jogDelta /*signed*/, controlForBlink, statusForLed) {
  if (PioneerDDJFLX4.LOOP_ADJUST_MODE !== "workflow") return false;

  const loopOn = engine.getValue(group, "loop_enabled") > 0;
  if (!loopOn) return false;

  if (!PioneerDDJFLX4.loopAdjustIn[channelIdx] && !PioneerDDJFLX4.loopAdjustOut[channelIdx]) return false;

    if (jogDelta === 0) {
        return true;
    }

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

  // --- workflow MODE ---
  if (PioneerDDJFLX4.LOOP_ADJUST_MODE === "workflow") {
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

  // --- workflow MODE ---
  if (PioneerDDJFLX4.LOOP_ADJUST_MODE === "workflow") {
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
// Jog wheels (FLX4) – stateful scratch/bend 
//
// Goals:
// - Loop-adjust has priority (your existing _handleJogLoopAdjust hook stays).
// - Basic uses platter touch for scratch; Extended supplies per-deck Vinyl policy.
// - Turn: scratchTick when scratching, else jog bend.
// - Shift + Jog searches directly through playposition.
// - Shift + platter touch applies an optional search-speed multiplier.
//
// Notes:
// - FLX4 wheel turn values are centered at 64 (0..127). We convert to signed by (v - 64).
// - We keep it 2-deck simple (Channel1/2), because FLX4 is 2-deck.
// - The shared decoder handles both platter CCs and always bends on the wheel side.
///////////////////////////////////////////////////////////////

// ---------- state ----------
// Single source of truth:
// Vinyl policy is supplied by jogVinylEnabled; MIDI decoding stays shared.
PioneerDDJFLX4.wheelTouch = PioneerDDJFLX4.wheelTouch || [false, false];    // per deck side
PioneerDDJFLX4._scratchEnabled = PioneerDDJFLX4._scratchEnabled || [false, false];

// Helper: enable scratch for deckNum (1/2)
PioneerDDJFLX4._scratchEnable = function(deckNum) {
    engine.scratchEnable(deckNum, PioneerDDJFLX4.jogPPR, PioneerDDJFLX4.jogRPM, PioneerDDJFLX4.alpha, PioneerDDJFLX4.beta);
    PioneerDDJFLX4._scratchEnabled[deckNum - 1] = true;
};

// Helper: disable scratch for deckNum (1/2)
PioneerDDJFLX4._scratchDisable = function(deckNum, ramp) {
    // "ramp" true makes it feel less abrupt, but if you hate it: set false.
    engine.scratchDisable(deckNum, !!ramp);
    PioneerDDJFLX4._scratchEnabled[deckNum - 1] = false;
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
         // Decide scratch vs bend based on intended vinyl state:
         // scratch if deck not playing OR vinyl mode is enabled for this deck.
         const playing = engine.getValue(group, "play") === 1;
         const wantScratch = (!playing) || PioneerDDJFLX4.jogVinylEnabled(group);

         if (wantScratch) {
             PioneerDDJFLX4._scratchEnable(deckNum);
         } else {
             // ensure scratch is off if it was on
             if (PioneerDDJFLX4._scratchEnabled[deckIdx]) {
                 PioneerDDJFLX4._scratchDisable(deckNum);
             }
         }
         return;
     }

     // Touch released
     if (PioneerDDJFLX4._scratchEnabled[deckIdx]) {
         PioneerDDJFLX4._scratchDisable(deckNum, true);
     }
 };

PioneerDDJFLX4._shiftSearchTouch = PioneerDDJFLX4._shiftSearchTouch || [false, false];

PioneerDDJFLX4.jogTouchShift = function(_channel, _control, value, _status, group) {
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    PioneerDDJFLX4._shiftSearchTouch[deckIdx] = (value !== 0);
};
// ---------- turn handlers ----------
PioneerDDJFLX4.jogTurn = function(channel, _control, value, _status, group) {
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    const deckNum = deckIdx + 1;

    // centered at 64; <64 rew >64 fwd
    const delta = value - 64;

    const st = (group === "[Channel1]") ? 0x90 : 0x91;

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

        // Simple-mode legacy adjust
        if (PioneerDDJFLX4.loopAdjustIn[deckIdx]) {
            if (typeof PioneerDDJFLX4._scheduleLoopAdjustTimeout === "function") {
                PioneerDDJFLX4._scheduleLoopAdjustTimeout(deckIdx, group, _control, st);
            }
            const newPos = delta * PioneerDDJFLX4.loopAdjustMultiply
                + engine.getValue(group, "loop_start_position");
            engine.setValue(group, "loop_start_position", newPos);
            return;
        }

        if (PioneerDDJFLX4.loopAdjustOut[deckIdx]) {
            if (typeof PioneerDDJFLX4._scheduleLoopAdjustTimeout === "function") {
                PioneerDDJFLX4._scheduleLoopAdjustTimeout(deckIdx, group, _control, st);
            }
            const newPos = delta * PioneerDDJFLX4.loopAdjustMultiply
                + engine.getValue(group, "loop_end_position");
            engine.setValue(group, "loop_end_position", newPos);
            return;
        }
    }

    // Scratch/bend behavior
    // If Mixxx is currently scratching, always send scratchTick for PLATTER turns (0x22 AND 0x23).
    // Side jog (0x21) must always remain bend.
    if (_control !== 0x21 && engine.isScratching(deckNum)) {
        engine.scratchTick(deckNum, delta * PioneerDDJFLX4.scratchScale);
        return;
    }

    // Fallback: bend/jog
    engine.setValue(group, "jog", delta * PioneerDDJFLX4.bendScale);
};

PioneerDDJFLX4.jogSearch = function(_channel, _control, value, _status, group) {
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    const delta = value - 64;

    if (delta === 0) return;

    let step = delta * PioneerDDJFLX4.jogSearchScale;

    if (PioneerDDJFLX4._shiftSearchTouch[deckIdx]) {
        step *= PioneerDDJFLX4.shiftSearchTouchMultiplier;
    }

    const pos = engine.getValue(group, "playposition");
    let newPos = pos + step;

    if (newPos < 0) newPos = 0;
    if (newPos > 1) newPos = 1;

    engine.setValue(group, "playposition", newPos);
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

    if (PioneerDDJFLX4.padMode[ch] === PioneerDDJFLX4.PADMODE.KEYBOARD &&
        [0x1B, 0x1E, 0x6B, 0x20, 0x6D, 0x22, 0x6F].indexOf(_control) !== -1) {
        PioneerDDJFLX4._releaseKeyboardHotcue(ch);
    }

    if (PioneerDDJFLX4.padMode[ch] === PioneerDDJFLX4.PADMODE.HOTCUE &&
        [0x69, 0x1E, 0x6B, 0x20, 0x6D, 0x22, 0x6F].indexOf(_control) !== -1) {
        PioneerDDJFLX4._stopHotcuePreview(ch);
    }

    // KEYBOARD MODE = Pitch Play
    if (_control === 0x69) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.KEYBOARD;
        PioneerDDJFLX4.keyboardModeEntered(ch);
        PioneerDDJFLX4.updateDeckLeds(ch);
        return;
    }

    // HOT CUE MODE:
    // first press -> enter hotcue mode
    // re-press while already in hotcue mode -> cycle bank
    if (_control === 0x1B) {
        if (PioneerDDJFLX4.padMode[ch] === PioneerDDJFLX4.PADMODE.HOTCUE) {
            PioneerDDJFLX4.cycleHotcueBank(ch);
        } else {
            PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.HOTCUE;
            PioneerDDJFLX4._bindHotcueBankConnections(ch);
            PioneerDDJFLX4.updateDeckLeds(ch);
        }
        return;
    }

    if (_control === 0x1E) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.PADFX1;
    } else if (_control === 0x6B) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.PADFX2;
    } else if (_control === 0x20) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.BEATJUMP;
    } else if (_control === 0x6D) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.BEATLOOP;
    } else if (_control === 0x22) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.SAMPLER;
    } else if (_control === 0x6F) {
        PioneerDDJFLX4.padMode[ch] = PioneerDDJFLX4.PADMODE.KEYSHIFT;
    } else {
        return;
    }

    PioneerDDJFLX4.updateDeckLeds(ch);
};

// Sampler actions happen on press, without hold timers.
PioneerDDJFLX4.samplerPadPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F || !engine.getValue(group, "track_loaded")) {
        return;
    }
    engine.setValue(group, "start_play", 1);
    engine.setValue(group, "start_play", 0);
};

PioneerDDJFLX4.samplerPadShiftPressed = function(_channel, _control, value, _status, group) {
    if (value !== 0x7F) {
        return;
    }
    if (engine.getValue(group, "play")) {
        engine.setValue(group, "play", 0);
    } else {
        engine.setValue(group, "LoadSelectedTrack", 1);
        engine.setValue(group, "LoadSelectedTrack", 0);
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

// Keyboard Pitch Play: one selected hotcue per deck, no timers.
PioneerDDJFLX4.keyboardHotcue = { "[Channel1]": 0, "[Channel2]": 0 };

PioneerDDJFLX4._releaseKeyboardHotcue = function(group) {
    const hotcue = PioneerDDJFLX4.keyboardHotcue[group];
    if (hotcue) {
        engine.setValue(group, `hotcue_${hotcue}_activate`, 0);
    }
};

PioneerDDJFLX4.keyboardModeEntered = function(group) {
    PioneerDDJFLX4._releaseKeyboardHotcue(group);
    PioneerDDJFLX4.keyboardHotcue[group] = 0;
};

PioneerDDJFLX4.updateKeyboardLeds = function(group) {
    if (PioneerDDJFLX4.padMode[group] !== PioneerDDJFLX4.PADMODE.KEYBOARD) {
        return;
    }
    let hotcue = PioneerDDJFLX4.keyboardHotcue[group];
    if (hotcue && !engine.getValue(group, `hotcue_${hotcue}_status`)) {
        PioneerDDJFLX4.keyboardHotcue[group] = 0;
        hotcue = 0;
    }
    const statuses = PioneerDDJFLX4._hotcuePadStatuses(group);
    for (let pad = 0; pad < 8; pad++) {
        const candidate = PioneerDDJFLX4._hotcueNumberFromPad(group, pad);
        const available = engine.getValue(group, `hotcue_${candidate}_status`) > 0;
        // Before selection, show available hotcues. Afterwards, all pitch pads work.
        midi.sendShortMsg(statuses[0], 0x40 + pad, hotcue || available ? 0x7F : 0);
        midi.sendShortMsg(statuses[1], 0x40 + pad, available ? 0x7F : 0);
    }
};

PioneerDDJFLX4.keyboardPadShiftPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7F || PioneerDDJFLX4.padMode[group] !== PioneerDDJFLX4.PADMODE.KEYBOARD) {
        return;
    }
    const pad = control - 0x40;
    if (pad < 0 || pad > 7) {
        return;
    }
    const hotcue = PioneerDDJFLX4._hotcueNumberFromPad(group, pad);
    if (engine.getValue(group, `hotcue_${hotcue}_status`) > 0) {
        PioneerDDJFLX4._releaseKeyboardHotcue(group);
        PioneerDDJFLX4.keyboardHotcue[group] = hotcue;
    }
    PioneerDDJFLX4.updateKeyboardLeds(group);
};

PioneerDDJFLX4.keyboardPadPressed = function(channel, control, value, status, group) {
    const hotcue = PioneerDDJFLX4.keyboardHotcue[group];
    if (value === 0 && hotcue) {
        engine.setValue(group, `hotcue_${hotcue}_activate`, 0);
        return;
    }
    if (value !== 0x7F || PioneerDDJFLX4.padMode[group] !== PioneerDDJFLX4.PADMODE.KEYBOARD) {
        return;
    }
    const pad = control - 0x40;
    if (pad < 0 || pad > 7) {
        return;
    }
    if (!hotcue || !engine.getValue(group, `hotcue_${hotcue}_status`)) {
        PioneerDDJFLX4.keyboardHotcue[group] = 0;
        PioneerDDJFLX4.keyboardPadShiftPressed(channel, control, value, status, group);
        return;
    }
    engine.setValue(group, "pitch_adjust", PioneerDDJFLX4._keyShiftPadToSemitone(pad));
    engine.setValue(group, `hotcue_${hotcue}_activate`, 1);
};

PioneerDDJFLX4.keyboardTrackLoaded = function(_value, group, _control) {
    PioneerDDJFLX4._releaseKeyboardHotcue(group);
    PioneerDDJFLX4.keyboardHotcue[group] = 0;
    PioneerDDJFLX4.updateKeyboardLeds(group);
};

//
// Key Shift (Pitch Shift) – FLX4 Standard-Belegung laut Handbuch
// Pads: 1:+4, 2:+5, 3:+6, 4:+7, 5:0, 6:+1, 7:+2, 8:+3
//

PioneerDDJFLX4._keyShiftPadToSemitone = function(padIndex0to7) {
    // padIndex: 0..7 entspricht Pads 1..8
    const map = [4, 5, 6, 7, 0, 1, 2, 3];
    return map[padIndex0to7] === undefined ? 0 : map[padIndex0to7];
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

// Shift layer is reserved and performs no action.
PioneerDDJFLX4.pitchPadShiftPressed = function(_channel, _control, _value, _status, _group) {
    // absichtlich leer
};

//
// Shutdown
//

PioneerDDJFLX4.shutdown = function() {
    const stopTimer = function(timerId) {
        if (timerId === undefined || timerId === null || timerId === 0 || timerId === -1) {
            return;
        }

        try {
            engine.stopTimer(timerId);
        } catch (e) { void e; }
    };

    const deckGroups = ["[Channel1]", "[Channel2]"];

    // Stop the recurring keepalive first so no new controller traffic is
    // generated while the remaining runtime state is being torn down.
    stopTimer(PioneerDDJFLX4.keepAliveTimer);
    PioneerDDJFLX4.keepAliveTimer = 0;

    deckGroups.forEach(function(group) {
        PioneerDDJFLX4._releaseKeyboardHotcue(group);
        PioneerDDJFLX4._stopHotcuePreview(group);
    });

    // --- Peak latch timers ---
    stopTimer(PioneerDDJFLX4._peakTimerL);
    stopTimer(PioneerDDJFLX4._peakTimerR);
    PioneerDDJFLX4._peakTimerL = 0;
    PioneerDDJFLX4._peakTimerR = 0;
    PioneerDDJFLX4._peakL = 0;
    PioneerDDJFLX4._peakR = 0;

    // --- Delayed LOAD / instant-double timers ---
    deckGroups.forEach(function(group) {
        stopTimer(PioneerDDJFLX4._loadPress.timer[group]);
        PioneerDDJFLX4._loadPress.timer[group] = 0;
        PioneerDDJFLX4._loadPress.waiting[group] = false;
    });

    // --- TRIM soft-takeover hold timers ---
    deckGroups.forEach(function(group) {
        stopTimer(PioneerDDJFLX4._trimPickupTimer[group]);
        PioneerDDJFLX4._trimPickupTimer[group] = 0;
        PioneerDDJFLX4._trimPickup[group] = false;
        PioneerDDJFLX4._trimLockUntil[group] = 0;
    });

    // --- Scratch and jog-touch state ---
    for (let deckIdx = 0; deckIdx < 2; deckIdx++) {
        PioneerDDJFLX4._scratchDisable(deckIdx + 1, false);
        PioneerDDJFLX4.wheelTouch[deckIdx] = false;
        PioneerDDJFLX4._shiftSearchTouch[deckIdx] = false;
    }

    // --- Loop-adjust timeout timers and state ---
    deckGroups.forEach(function(group, deckIdx) {
        stopTimer(PioneerDDJFLX4._loopAdjustTimeoutTimer[group]);
        PioneerDDJFLX4._loopAdjustTimeoutTimer[group] = undefined;
        PioneerDDJFLX4.loopAdjustIn[deckIdx] = false;
        PioneerDDJFLX4.loopAdjustOut[deckIdx] = false;
        PioneerDDJFLX4._loopPendingOut[group] = false;
    });

    // --- Sampler blink timers ---
    if (PioneerDDJFLX4.timersSampler) {
        for (const chanStr in PioneerDDJFLX4.timersSampler) {
            const controls = PioneerDDJFLX4.timersSampler[chanStr];
            if (!controls) continue;

            for (const ctrlStr in controls) {
                stopTimer(controls[ctrlStr]);
                controls[ctrlStr] = undefined;
            }
        }
    }

    // --- Loop blink timers ---
    if (PioneerDDJFLX4.timersLoop) {
        for (const g in PioneerDDJFLX4.timersLoop) {
            const timers = PioneerDDJFLX4.timersLoop[g];
            if (timers) {
                stopTimer(timers.loopBlink);
                timers.loopBlink = undefined;
            }
        }
    }

    // --- Hotcue blink and bank-feedback timers ---
    deckGroups.forEach(function(group) {
        stopTimer(PioneerDDJFLX4._hotcueBlinkTimer[group]);
        stopTimer(PioneerDDJFLX4._hotcueBankFlashTimer[group]);
        PioneerDDJFLX4._hotcueBlinkTimer[group] = 0;
        PioneerDDJFLX4._hotcueBankFlashTimer[group] = 0;
        PioneerDDJFLX4._hotcueBlinkState[group] = false;
    });

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

};
