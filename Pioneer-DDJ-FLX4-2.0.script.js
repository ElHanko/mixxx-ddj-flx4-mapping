// Pioneer-DDJ-FLX4-script.js
// ****************************************************************************
// * Mixxx mapping script file for the Pioneer DDJ-FLX4.
// * Mostly adapted from the DDJ-400 mapping script
// * Authors: Warker, nschloe, dj3730, jusko, Robert904
// ****************************************************************************
//
//  Implemented (as per manufacturer's manual):
//      * Mixer Section (Faders, EQ, Filter, Gain, Cue)
//      * Browsing and loading + Waveform zoom (shift)
//      * Jogwheels, Scratching, Bending, Loop adjust
//      * Cycle Temporange
//      * Beat Sync
//      * Hot Cue Mode
//      * Beat Loop Mode
//      * Beat Jump Mode
//      * Sampler Mode
//      * Keyshift mode
//
//  Custom (Mixxx specific mappings):
//      * BeatFX: Assigned Effect Unit 1
//                v FX_SELECT Load next effect.
//                SHIFT + v FX_SELECT Load previous effect.
//                < LEFT Cycle effect focus leftward
//                > RIGHT Cycle effect focus rightward
//                ON/OFF toggles focused effect slot
//                SHIFT + ON/OFF disables all three effect slots.
//
//      * 32 beat jump forward & back (Shift + </> CUE/LOOP CALL arrows)
//      * Toggle quantize (Shift + channel cue)
//      * Stems selection using PADs (using controller's Keyboard mode)
//
//  Not implemented (after discussion and trial attempts):
//      * Loop Section:
//        * -4BEAT auto loop (hacky---prefer a clean way to set a 4 beat loop
//                            from a previous position on long press)
//
//        * CUE/LOOP CALL - memory & delete (complex and not useful. Hot cues are sufficient)
//
//      * Secondary pad modes (trial attempts complex and too experimental)
//        * Keyboard mode
//        * Pad FX1
//        * Pad FX2
//
//  Not implemented yet (but might be in the future):
//      * Smart CFX
//      * Smart fader

var PioneerDDJFLX4 = {};

PioneerDDJFLX4.lights = {
    beatFx: {
        status: 0x94,
        data1: 0x47,
    },
    shiftBeatFx: {
        status: 0x94,
        data1: 0x43,
    },
    deck1: {
        vuMeter: {
            status: 0xB0,
            data1: 0x02,
        },
        playPause: {
            status: 0x90,
            data1: 0x0B,
        },
        shiftPlayPause: {
            status: 0x90,
            data1: 0x47,
        },
        cue: {
            status: 0x90,
            data1: 0x0C,
        },
        shiftCue: {
            status: 0x90,
            data1: 0x48,
        },
        hotcueMode: {
            status: 0x90,
            data1: 0x1B,
        },
        keyboardMode: {
            status: 0x90,
            data1: 0x69,
        },
        padFX1Mode: {
            status: 0x90,
            data1: 0x1E,
        },
        padFX2Mode: {
            status: 0x90,
            data1: 0x6B,
        },
        beatJumpMode: {
            status: 0x90,
            data1: 0x20,
        },
        beatLoopMode: {
            status: 0x90,
            data1: 0x6D,
        },
        samplerMode: {
            status: 0x90,
            data1: 0x22,
        },
        keyShiftMode: {
            status: 0x90,
            data1: 0x6F,
        },
    },
    deck2: {
        vuMeter: {
            status: 0xB0,
            data1: 0x02,
        },
        playPause: {
            status: 0x91,
            data1: 0x0B,
        },
        shiftPlayPause: {
            status: 0x91,
            data1: 0x47,
        },
        cue: {
            status: 0x91,
            data1: 0x0C,
        },
        shiftCue: {
            status: 0x91,
            data1: 0x48,
        },
        hotcueMode: {
            status: 0x91,
            data1: 0x1B,
        },
        keyboardMode: {
            status: 0x91,
            data1: 0x69,
        },
        padFX1Mode: {
            status: 0x91,
            data1: 0x1E,
        },
        padFX2Mode: {
            status: 0x91,
            data1: 0x6B,
        },
        beatJumpMode: {
            status: 0x91,
            data1: 0x20,
        },
        beatLoopMode: {
            status: 0x91,
            data1: 0x6D,
        },
        samplerMode: {
            status: 0x91,
            data1: 0x22,
        },
        keyShiftMode: {
            status: 0x91,
            data1: 0x6F,
        },
    },
};
// LED Helper
PioneerDDJFLX4.setLed = function(status, note, on) {
    midi.sendShortMsg(status, note, on ? 0x7F : 0x00);
};

// Store timer IDs
PioneerDDJFLX4.timers = {};

// Keep alive timer
PioneerDDJFLX4.sendKeepAlive = function() {
    midi.sendSysexMsg([0xF0, 0x00, 0x40, 0x05, 0x00, 0x00, 0x04, 0x05, 0x00, 0x50, 0x02, 0xf7], 12); // This was reverse engineered with Wireshark
};

// Jog wheel constants
PioneerDDJFLX4.vinylMode = true;
PioneerDDJFLX4.alpha = 1.0/8;
PioneerDDJFLX4.beta = PioneerDDJFLX4.alpha/32;

// Multiplier for fast seek through track using SHIFT+JOGWHEEL
PioneerDDJFLX4.fastSeekScale = 150;
PioneerDDJFLX4.bendScale = 0.8;

PioneerDDJFLX4.tempoRanges = [0.06, 0.10, 0.16, 0.25];

PioneerDDJFLX4.shiftButtonDown = [false, false];

// Jog wheel loop adjust
PioneerDDJFLX4.loopAdjustIn = [false, false];
PioneerDDJFLX4.loopAdjustOut = [false, false];
PioneerDDJFLX4.loopAdjustMultiply = 50;

// Beatjump pad (beatjump_size values)
PioneerDDJFLX4.beatjumpSizeForPad = {
    0x20: -1, // PAD 1
    0x21: 1,  // PAD 2
    0x22: -2, // PAD 3
    0x23: 2,  // PAD 4
    0x24: -4, // PAD 5
    0x25: 4,  // PAD 6
    0x26: -8, // PAD 7
    0x27: 8   // PAD 8
};

// Stems (KEYBOARD) pads mode status for deck 1 and 2, without or with SHIFT pressed
PioneerDDJFLX4.stemsPadsModesStatus = {
    "[Channel1]": [0x97, 0x98],
    "[Channel2]": [0x99, 0x9a],
};

// Stems (KEYBOARD) pad 1 control (pad control = [this value] + [pad  number] - 1)
PioneerDDJFLX4.stemMutePadsFirstControl = 0x40;

// Stems (KEYBOARD) pad 5 control (pad control = [this value] + [pad  number] - 1)
PioneerDDJFLX4.stemFxPadsFirstControl = 0x44;

// Pitch shift (KEY SHIFT) pads mode status for deck 1 and 2, without or with SHIFT pressed
PioneerDDJFLX4.pitchPadsModesStatus = {
    "[Channel1]": [0x97, 0x98],
    "[Channel2]": [0x99, 0x9a],
};

// Pitch shift (KEY SHIFT) pad 1 control (pad control = [this value] + [pad  number] - 1)
PioneerDDJFLX4.pitchPadsFirstControl = 0x70;

PioneerDDJFLX4.quickJumpSize = 32;

// Used for tempo slider
PioneerDDJFLX4.highResMSB = {
    "[Channel1]": {},
    "[Channel2]": {}
};

PioneerDDJFLX4.trackLoadedLED = function(value, group, _control) {
    midi.sendShortMsg(
        0x9F,
        group.match(script.channelRegEx)[1] - 1,
        value > 0 ? 0x7F : 0x00
    );
};

PioneerDDJFLX4.toggleLight = function(midiIn, active) {
    midi.sendShortMsg(midiIn.status, midiIn.data1, active ? 0x7F : 0);
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
// Library / Browser: BROWSE short/long press
// - long press: expand folder/tree (MoveRight)
// - short press: move focus between tree/tracklist (Forward/Backward depending on which MIDI note)
//

PioneerDDJFLX4._browseLP = {
    timer: { 0x41: -1, 0x42: -1 },
    fired: { 0x41: false, 0x42: false },
};
PioneerDDJFLX4.BROWSE_LONGPRESS_MS = 300;

PioneerDDJFLX4.browsePress = function(_channel, control, value, _status, _group) {
    const THRESH = PioneerDDJFLX4.BROWSE_LONGPRESS_MS;

    if (control !== 0x41 && control !== 0x42) return;

    if (value === 0x7F) { // down
        const t = PioneerDDJFLX4._browseLP.timer[control];
        if (t !== -1) {
            try { engine.stopTimer(t); } catch (e) {}
        }
        PioneerDDJFLX4._browseLP.fired[control] = false;

        PioneerDDJFLX4._browseLP.timer[control] = engine.beginTimer(THRESH, function() {
            PioneerDDJFLX4._browseLP.fired[control] = true;
            PioneerDDJFLX4._browseLP.timer[control] = -1;
            script.triggerControl("[Library]", "MoveRight");
        }, true);

        return;
    }
    if (value !== 0x00) return; // ignore any weird intermediate values

    // up
    const t = PioneerDDJFLX4._browseLP.timer[control];
    if (t !== -1) {
        try { engine.stopTimer(t); } catch (e) {}
        PioneerDDJFLX4._browseLP.timer[control] = -1;
    }

    if (!PioneerDDJFLX4._browseLP.fired[control]) {
        script.triggerControl("[Library]", control === 0x42 ? "MoveFocusBackward" : "MoveFocusForward");
    }
};

//
// Init
//

PioneerDDJFLX4.init = function() {
    engine.setValue("[EffectRack1_EffectUnit1]", "show_focus", 1);

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
        engine.makeConnection("[Sampler" + i + "]", "play", PioneerDDJFLX4.samplerPlayOutputCallbackFunction);
    }

    engine.makeConnection("[Channel1]", "track_loaded", PioneerDDJFLX4.trackLoadedLED);
    engine.makeConnection("[Channel2]", "track_loaded", PioneerDDJFLX4.trackLoadedLED);

    // play the "track loaded" animation on both decks at startup
    midi.sendShortMsg(0x9F, 0x00, 0x7F);
    midi.sendShortMsg(0x9F, 0x01, 0x7F);

    PioneerDDJFLX4.setLoopButtonLights(0x90, 0x7F);
    PioneerDDJFLX4.setLoopButtonLights(0x91, 0x7F);

    engine.makeConnection("[Channel1]", "loop_enabled", PioneerDDJFLX4.loopToggle);
    engine.makeConnection("[Channel2]", "loop_enabled", PioneerDDJFLX4.loopToggle);

    // Beat FX: update LED when the chain enable state changes
    engine.makeConnection("[EffectRack1_EffectUnit1]", "enabled", PioneerDDJFLX4._updateBeatFxOnOffLed);
    engine.makeConnection("[EffectRack1_EffectUnit2]", "enabled", PioneerDDJFLX4._updateBeatFxOnOffLed);

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

    // initialize Beat FX routing + LED state
    PioneerDDJFLX4._applyBeatFxRouting();

    PioneerDDJFLX4.keepAliveTimer = engine.beginTimer(200, PioneerDDJFLX4.sendKeepAlive);

    // query the controller for current control positions on startup
    PioneerDDJFLX4.sendKeepAlive(); // the query seems to double as a keep alive message
};

//
// Waveform zoom
//

PioneerDDJFLX4.waveformZoom = function(midichan, control, value, status, group) {
    if (value === 0x7f) {
        script.triggerControl(group, "waveform_zoom_up", 100);
    } else {
        script.triggerControl(group, "waveform_zoom_down", 100);
    }
};

//
// Channel level lights
//

PioneerDDJFLX4.vuMeterUpdate = function(value, group) {
    const newVal = value * 127;

    switch (group) {
    case "[Channel1]":
        midi.sendShortMsg(0xB0, 0x02, newVal);
        break;

    case "[Channel2]":
        midi.sendShortMsg(0xB1, 0x02, newVal);
        break;
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
    const allOn = targets.length > 0 && targets.every((u) => PioneerDDJFLX4._beatFxAllSlotsOn(u));

    targets.forEach((u) => PioneerDDJFLX4._beatFxSetUnitAndSlots(u, !allOn));
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

PioneerDDJFLX4.padMode = PioneerDDJFLX4.padMode || {
    "[Channel1]": "hotcue",
    "[Channel2]": "hotcue",
};

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
PioneerDDJFLX4.timers = PioneerDDJFLX4.timers || {};
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

PioneerDDJFLX4.stopLoopLightsBlink = function(group, control, status) {
  PioneerDDJFLX4.timers[group] = PioneerDDJFLX4.timers[group] || {};
  if (PioneerDDJFLX4.timers[group][control] !== undefined) {
    engine.stopTimer(PioneerDDJFLX4.timers[group][control]);
  }
  PioneerDDJFLX4.timers[group][control] = undefined;

  // Default nach Blink: beide solid ON (Loop aktiv)
  PioneerDDJFLX4.setLoopButtonLights(status, 0x7F);
};

PioneerDDJFLX4.startLoopLightsBlink = function(channelIdx, control, status, group) {
  let blink = 0x7F;

  PioneerDDJFLX4.stopLoopLightsBlink(group, control, status);

  PioneerDDJFLX4.timers[group] = PioneerDDJFLX4.timers[group] || {};
  PioneerDDJFLX4.timers[group][control] = engine.beginTimer(500, () => {
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

    // Blink aus (falls aktiv)
    PioneerDDJFLX4.stopLoopLightsBlink(group, controlForBlink, statusForLed);

    // LEDs zurück in "normal"
    const loopOn = engine.getValue(group, "loop_enabled") > 0;
    if (loopOn) {
      PioneerDDJFLX4.setLoopButtonLights(statusForLed, 0x7F); // beide solid
    } else {
      PioneerDDJFLX4.setLoopButtonLights(statusForLed, 0x00); // beide aus
    }
  }, true /* one-shot, falls unterstützt */);
};

// ------------------- loop_enabled callback -------------------
PioneerDDJFLX4.loopToggle = function(value, group, control) {
  const status = group === "[Channel1]" ? 0x90 : 0x91;
  const channelIdx = group === "[Channel1]" ? 0 : 1;

  // RELOOP/EXIT LED folgt loop_enabled (wie bisher)
  PioneerDDJFLX4.setReloopLight(status, value ? 0x7F : 0x00);

  if (value) {
    PioneerDDJFLX4.startLoopLightsBlink(channelIdx, control, status, group);
  } else {
    PioneerDDJFLX4.stopLoopLightsBlink(group, control, status);
    PioneerDDJFLX4.loopAdjustIn[channelIdx] = false;
    PioneerDDJFLX4.loopAdjustOut[channelIdx] = false;
    PioneerDDJFLX4._loopPendingOut[group] = false;

    // Timeout auch killen
    const tid = PioneerDDJFLX4._loopAdjustTimeoutTimer[group];
    if (tid !== undefined) {
      engine.stopTimer(tid);
      PioneerDDJFLX4._loopAdjustTimeoutTimer[group] = undefined;
    }
  }
};

// ------------------- RELOOP/EXIT -------------------
// Loop an -> reloop_toggle (Exit); Loop aus -> N-beat loop activate
PioneerDDJFLX4.reloopExitPressed = function(_channel, _control, value, _status, group) {
  if (value !== 0x7F) return;
  if (engine.getValue(group, "track_loaded") !== 1) return;

  const loopOn = engine.getValue(group, "loop_enabled") > 0;

  if (loopOn) {
    script.triggerControl(group, "reloop_toggle");
    return;
  }

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

    if (PioneerDDJFLX4.loopAdjustIn[channelIdx] || PioneerDDJFLX4.loopAdjustOut[channelIdx]) {
      PioneerDDJFLX4.startLoopLightsBlink(channelIdx, control, st, group);
      PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, control, st);
    } else {
      PioneerDDJFLX4.stopLoopLightsBlink(group, control, st);
      PioneerDDJFLX4.setLoopButtonLights(st, 0x7F);
    }
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

    if (PioneerDDJFLX4.loopAdjustIn[channelIdx] || PioneerDDJFLX4.loopAdjustOut[channelIdx]) {
      PioneerDDJFLX4.startLoopLightsBlink(channelIdx, control, st, group);
      PioneerDDJFLX4._scheduleLoopAdjustTimeout(channelIdx, group, control, st);
    } else {
      PioneerDDJFLX4.stopLoopLightsBlink(group, control, st);
      PioneerDDJFLX4.setLoopButtonLights(st, 0x7F);
    }
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

//
// CUE/LOOP CALL
//

PioneerDDJFLX4.cueLoopCallLeft = function(_channel, _control, value, _status, group) {
    if (value) {
        engine.setValue(group, "loop_scale", 0.5);
    }
};

PioneerDDJFLX4.cueLoopCallRight = function(_channel, _control, value, _status, group) {
    if (value) {
        engine.setValue(group, "loop_scale", 2.0);
    }
};

//
// BEAT SYNC
//
// Note that the controller sends different signals for a short press and a long
// press of the same button.
//

PioneerDDJFLX4.syncPressed = function(channel, control, value, status, group) {
    if (engine.getValue(group, "sync_enabled") && value > 0) {
        engine.setValue(group, "sync_enabled", 0);
    } else {
        engine.setValue(group, "beatsync", value);
    }
};

PioneerDDJFLX4.syncLongPressed = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "sync_enabled", 1);
    }
};

PioneerDDJFLX4.cycleTempoRange = function(_channel, _control, value, _status, group) {
    if (value === 0) { return; } // ignore release

    const currRange = engine.getValue(group, "rateRange");
    let idx = 0;

    for (let i = 0; i < this.tempoRanges.length; i++) {
        if (currRange === this.tempoRanges[i]) {
            // idx get the index of the value in tempoRanges following the currently configured one
            // or cycle back to 0 if the current is the last value of the list.
            idx = (i + 1) % this.tempoRanges.length;
            break;
        }
    }
    engine.setValue(group, "rateRange", this.tempoRanges[idx]);
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
PioneerDDJFLX4.scratchScale = PioneerDDJFLX4.scratchScale || 1.0; // can tune
PioneerDDJFLX4.seekScratchMultiplier = PioneerDDJFLX4.seekScratchMultiplier || 4.0;

// ---------- state ----------
PioneerDDJFLX4.vinylMode = PioneerDDJFLX4.vinylMode || [false, false];      // per deck side
PioneerDDJFLX4.wheelTouch = PioneerDDJFLX4.wheelTouch || [false, false];    // per deck side
PioneerDDJFLX4._scratchEnabled = PioneerDDJFLX4._scratchEnabled || [false, false];
PioneerDDJFLX4._scratchAction = PioneerDDJFLX4._scratchAction || ["bend", "bend"]; // "scratch"|"seek"|"bend"

// Helper: enable scratch for deckNum (1/2)
PioneerDDJFLX4._scratchEnable = function(deckNum) {
    engine.scratchEnable(deckNum, PioneerDDJFLX4.jogPPR, PioneerDDJFLX4.jogRPM, this.alpha, this.beta);
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

// Optional: map a VINYL button to this if you have one in XML already.
// If you already have a vinyl toggle elsewhere, keep that and just set vinylMode[idx] there.
PioneerDDJFLX4.vinylToggle = function(channel, _control, value) {
    if (value !== 0x7F) return;
    PioneerDDJFLX4.vinylMode[channel] = !PioneerDDJFLX4.vinylMode[channel];
    // If you have a vinyl LED updater, call it here.
};

// ---------- touch handlers ----------
PioneerDDJFLX4.jogTouch = function(channel, _control, value, _status, group) {
    const deckNum = channel + 1;

    // If we are adjusting loop points, ignore touch changes to prevent scratch toggling while editing.
    if (PioneerDDJFLX4.loopAdjustIn[channel] || PioneerDDJFLX4.loopAdjustOut[channel]) {
        return;
    }

    const touching = (value !== 0);
    PioneerDDJFLX4.wheelTouch[channel] = touching;

    if (touching) {
        // Decide scratch vs bend:
        // scratch if deck not playing OR vinylMode enabled.
        const playing = engine.getValue(group, "play") === 1;
        const wantScratch = (!playing) || !!PioneerDDJFLX4.vinylMode[channel];

        if (wantScratch) {
            PioneerDDJFLX4._scratchAction[channel] = "scratch";
            PioneerDDJFLX4._scratchEnable(deckNum);
        } else {
            PioneerDDJFLX4._scratchAction[channel] = "bend";
            // ensure scratch is off if it was on
            if (PioneerDDJFLX4._scratchEnabled[channel]) {
                PioneerDDJFLX4._scratchDisable(deckNum);
            }
        }
        return;
    }

    // Touch released
    if (PioneerDDJFLX4._scratchEnabled[channel]) {
        PioneerDDJFLX4._scratchDisable(deckNum);
    } else {
        PioneerDDJFLX4._scratchAction[channel] = "bend";
    }
};

// Optional Shift-touch (bind it in XML if you have a separate touch note/cc for shift layer)
PioneerDDJFLX4.jogTouchShift = function(channel, _control, value, _status, group) {
    const deckNum = channel + 1;

    // same loop-adjust guard
    if (PioneerDDJFLX4.loopAdjustIn[channel] || PioneerDDJFLX4.loopAdjustOut[channel]) {
        return;
    }

    const touching = (value !== 0);
    PioneerDDJFLX4.wheelTouch[channel] = touching;

    if (touching) {
        PioneerDDJFLX4._scratchAction[channel] = "seek";
        PioneerDDJFLX4._scratchEnable(deckNum);
        return;
    }

    if (PioneerDDJFLX4._scratchEnabled[channel]) {
        PioneerDDJFLX4._scratchDisable(deckNum);
    } else {
        PioneerDDJFLX4._scratchAction[channel] = "bend";
    }
};

// ---------- turn handlers ----------
PioneerDDJFLX4.jogTurn = function(channel, _control, value, _status, group) {
    const deckNum = channel + 1;

    // centered at 64; <64 rew >64 fwd
    const delta = value - 64;

    const st = (group === "[Channel1]") ? 0x90 : 0x91;

    // Loop adjust has priority (your dual-mode block)
    if (engine.getValue(group, "loop_enabled") > 0) {
        if (typeof PioneerDDJFLX4._handleJogLoopAdjust === "function") {
            if (PioneerDDJFLX4._handleJogLoopAdjust(channel, group, delta, _control, st)) {
                return;
            }
        }

        // Simple-mode legacy adjust (your existing multiply logic)
        if (PioneerDDJFLX4.loopAdjustIn[channel]) {
            if (typeof PioneerDDJFLX4._scheduleLoopAdjustTimeout === "function") {
                PioneerDDJFLX4._scheduleLoopAdjustTimeout(channel, group, _control, st);
            }
            const newPos = delta * PioneerDDJFLX4.loopAdjustMultiply + engine.getValue(group, "loop_start_position");
            engine.setValue(group, "loop_start_position", newPos);
            return;
        }
        if (PioneerDDJFLX4.loopAdjustOut[channel]) {
            if (typeof PioneerDDJFLX4._scheduleLoopAdjustTimeout === "function") {
                PioneerDDJFLX4._scheduleLoopAdjustTimeout(channel, group, _control, st);
            }
            const newPos = delta * PioneerDDJFLX4.loopAdjustMultiply + engine.getValue(group, "loop_end_position");
            engine.setValue(group, "loop_end_position", newPos);
            return;
        }
    }

    // Scratch/bend behavior
    if (engine.isScratching(deckNum)) {
        const action = PioneerDDJFLX4._scratchAction[channel];

        if (action === "seek") {
            engine.scratchTick(deckNum, delta * PioneerDDJFLX4.scratchScale * PioneerDDJFLX4.seekScratchMultiplier);
        } else {
            engine.scratchTick(deckNum, delta * PioneerDDJFLX4.scratchScale);
        }
        return;
    }

    // Fallback: bend/jog
    engine.setValue(group, "jog", delta * this.bendScale);
};

PioneerDDJFLX4.jogSearch = function(_channel, _control, value, _status, group) {
    // keep your existing search behavior
    const newVal = (value - 64) * PioneerDDJFLX4.fastSeekScale;
    engine.setValue(group, "jog", newVal);
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

//
// Beat Jump mode
//
// Note that when we increase/decrease the sizes on the pad buttons, we use the
// value of the first pad (0x21) as an upper/lower limit beyond which we don't
// allow further increasing/decreasing of all the values.
//

PioneerDDJFLX4.beatjumpPadPressed = function(_channel, control, value, _status, group) {
    if (value === 0) {
        return;
    }
    engine.setValue(group, "beatjump_size", Math.abs(PioneerDDJFLX4.beatjumpSizeForPad[control]));
    engine.setValue(group, "beatjump", PioneerDDJFLX4.beatjumpSizeForPad[control]);
};

PioneerDDJFLX4.increaseBeatjumpSizes = function(_channel, control, value, _status, group) {
    if (value === 0 || PioneerDDJFLX4.beatjumpSizeForPad[0x21] * 16 > 16) {
        return;
    }
    Object.keys(PioneerDDJFLX4.beatjumpSizeForPad).forEach(function(pad) {
        PioneerDDJFLX4.beatjumpSizeForPad[pad] = PioneerDDJFLX4.beatjumpSizeForPad[pad] * 16;
    });
    engine.setValue(group, "beatjump_size", PioneerDDJFLX4.beatjumpSizeForPad[0x21]);
};

PioneerDDJFLX4.decreaseBeatjumpSizes = function(_channel, control, value, _status, group) {
    if (value === 0 || PioneerDDJFLX4.beatjumpSizeForPad[0x21] / 16 < 1/16) {
        return;
    }
    Object.keys(PioneerDDJFLX4.beatjumpSizeForPad).forEach(function(pad) {
        PioneerDDJFLX4.beatjumpSizeForPad[pad] = PioneerDDJFLX4.beatjumpSizeForPad[pad] / 16;
    });
    engine.setValue(group, "beatjump_size", PioneerDDJFLX4.beatjumpSizeForPad[0x21]);
};

//
// Sampler mode
//

PioneerDDJFLX4.samplerPlayOutputCallbackFunction = function(value, group, _control) {
    if (value === 1) {
        const curPad = group.match(script.samplerRegEx)[1];
        let deckIndex = 0;
        let padIndex = 0;

        if (curPad >=1 && curPad <= 4) {
            deckIndex = 0;
            padIndex = curPad - 1;
        } else if (curPad >=5 && curPad <= 8) {
            deckIndex = 2;
            padIndex = curPad - 5;
        } else if (curPad >=9 && curPad <= 12) {
            deckIndex = 0;
            padIndex = curPad - 5;
        } else if (curPad >=13 && curPad <= 16) {
            deckIndex = 2;
            padIndex = curPad - 9;
        }

        PioneerDDJFLX4.startSamplerBlink(
            0x97 + deckIndex,
            0x30 + padIndex,
            group);
    }
};

PioneerDDJFLX4.padModeKeyPressed = function(_channel, _control, value, _status, _group) {
    const deck = (_status === 0x90 ? PioneerDDJFLX4.lights.deck1 : PioneerDDJFLX4.lights.deck2);

    if (_control === 0x1B) {
        PioneerDDJFLX4.toggleLight(deck.hotcueMode, true);
    } else if (_control === 0x69) {
        PioneerDDJFLX4.toggleLight(deck.keyboardMode, true);
    } else if (_control === 0x1E) {
        PioneerDDJFLX4.toggleLight(deck.padFX1Mode, true);
    } else if (_control === 0x6B) {
        PioneerDDJFLX4.toggleLight(deck.padFX2Mode, true);
    } else if (_control === 0x20) {
        PioneerDDJFLX4.toggleLight(deck.beatJumpMode, true);
    } else if (_control === 0x6D) {
        PioneerDDJFLX4.toggleLight(deck.beatLoopMode, true);
    } else if (_control === 0x22) {
        PioneerDDJFLX4.toggleLight(deck.samplerMode, true);
    } else if (_control === 0x6F) {
        PioneerDDJFLX4.toggleLight(deck.keyShiftMode, true);
    }
};

PioneerDDJFLX4.samplerPadPressed = function(_channel, _control, value, _status, group) {
    if (engine.getValue(group, "track_loaded")) {
        engine.setValue(group, "cue_gotoandplay", value);
    } else {
        engine.setValue(group, "LoadSelectedTrack", value);
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
    let val = 0x7f;

    PioneerDDJFLX4.stopSamplerBlink(channel, control);
    PioneerDDJFLX4.timers[channel][control] = engine.beginTimer(250, () => {
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
    PioneerDDJFLX4.timers[channel] = PioneerDDJFLX4.timers[channel] || {};

    if (PioneerDDJFLX4.timers[channel][control] !== undefined) {
        engine.stopTimer(PioneerDDJFLX4.timers[channel][control]);
        PioneerDDJFLX4.timers[channel][control] = undefined;
    }
};


PioneerDDJFLX4.toggleQuantize = function(_channel, _control, value, _status, group) {
    if (value) {
        script.toggleControl(group, "quantize");
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

//
// Stems mode
//

PioneerDDJFLX4.stemMutePadPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7f) {
        return;
    }

    const stemCount = Math.min(engine.getValue(group, "stem_count"), 4);

    if (control - PioneerDDJFLX4.stemMutePadsFirstControl + 1 > stemCount) {
        return;
    }

    const stemGroup = `[${group.substring(1, group.length-1)}_Stem${control - PioneerDDJFLX4.stemMutePadsFirstControl + 1}]`;

    if (engine.getValue(stemGroup, "mute")) {
        engine.setValue(stemGroup, "mute", 0);
    } else {
        engine.setValue(stemGroup, "mute", 1);
    }
};

PioneerDDJFLX4.stemMutePadShiftPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7f) {
        return;
    }

    const stemCount = Math.min(engine.getValue(group, "stem_count"), 4);

    if (control - PioneerDDJFLX4.stemMutePadsFirstControl + 1 > stemCount) {
        return;
    }

    for (let stemIdx=1; stemIdx<=stemCount; stemIdx++) {
        const stemGroup = `[${group.substring(1, group.length-1)}_Stem${stemIdx}]`;

        if (stemIdx + PioneerDDJFLX4.stemMutePadsFirstControl - 1 === control) {
            engine.setValue(stemGroup, "mute", 0);
        } else {
            engine.setValue(stemGroup, "mute", 1);
        }
    }
};

PioneerDDJFLX4.stemFxPadPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7f) {
        return;
    }

    if (control - PioneerDDJFLX4.stemFxPadsFirstControl + 1 > 4) {
        return;
    }

    const stemGroup = `[QuickEffectRack1_[${group.substring(1, group.length-1)}_Stem${control - PioneerDDJFLX4.stemFxPadsFirstControl + 1}]]`;

    if (engine.getValue(stemGroup, "enabled")) {
        engine.setValue(stemGroup, "enabled", 0);
    } else {
        engine.setValue(stemGroup, "enabled", 1);
    }
};

PioneerDDJFLX4.stemFxPadShiftPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7f) {
        return;
    }

    if (control - PioneerDDJFLX4.stemFxPadsFirstControl + 1 > 4) {
        return;
    }

    const stemGroup = `[QuickEffectRack1_[${group.substring(1, group.length-1)}_Stem${control - PioneerDDJFLX4.stemFxPadsFirstControl + 1}]]`;

    engine.setValue(stemGroup, "next_chain_preset", 1);
};

PioneerDDJFLX4.stemCountChanged = function(_value, group, _control) {

    for (let stem=1; stem<=4; stem++) {
        // Stem mute pads
        PioneerDDJFLX4.stemMuteChanged(
            engine.getValue(`[${group.substring(1, group.length-1)}_Stem${stem}]`, "mute"),
            `[${group.substring(1, group.length-1)}_Stem${stem}]`,
            _control,
        );

        // Stem FX pads
        PioneerDDJFLX4.stemFxChanged(
            engine.getValue(`[QuickEffectRack1_[${group.substring(1, group.length-1)}_Stem${stem}]]`, "enabled"),
            `[QuickEffectRack1_[${group.substring(1, group.length-1)}_Stem${stem}]]`,
            _control,
        );
    }
};

PioneerDDJFLX4.stemMuteChanged = function(value, group, _control) {
    const channelStem = group.match(/\[Channel(\d+)_Stem(\d+)\]/);
    const deck = Number(channelStem[1]);
    const stem = Number(channelStem[2]);
    const channel = `[Channel${deck}]`;

    if (stem > 4) {
        return;
    }

    const stemCount = engine.getValue(channel, "stem_count");

    let code = 0x00;
    if (stem <= stemCount && value <= 0.5) {
        code = 0x7f;
    }

    for (let i=0; i<PioneerDDJFLX4.stemsPadsModesStatus[channel].length; i++) {
        midi.sendShortMsg(
            PioneerDDJFLX4.stemsPadsModesStatus[channel][i],
            PioneerDDJFLX4.stemMutePadsFirstControl + stem -1,
            code,
        );
    }
};

PioneerDDJFLX4.stemFxChanged = function(value, group, _control) {
    const channelStem = group.match(/\[QuickEffectRack1_\[Channel(\d+)_Stem(\d+)\]\]/);
    const deck = Number(channelStem[1]);
    const stem = Number(channelStem[2]);
    const channel = `[Channel${deck}]`;

    if (stem > 4) {
        return;
    }

    for (let i=0; i<PioneerDDJFLX4.stemsPadsModesStatus[channel].length; i++) {
        midi.sendShortMsg(
            PioneerDDJFLX4.stemsPadsModesStatus[channel][i],
            PioneerDDJFLX4.stemFxPadsFirstControl + stem -1,
            value <= 0.5 ? 0x00 : 0x7f,
        );
    }
};

//
// Pitch Shift mode
//

PioneerDDJFLX4.pitchAdjusted = function(_value, group, _control) {
    const pitchAdjust = Math.round(engine.getValue(group, "pitch_adjust"));
    let lights = 0b00000000;

    if (pitchAdjust === 0) {
        lights = 0b10000001;
    } else if (pitchAdjust === 1) {
        lights = 0b01000000;
    } else if (pitchAdjust === 2) {
        lights = 0b00100000;
    } else if (pitchAdjust === 3) {
        lights = 0b00010000;
    } else if (pitchAdjust === 4) {
        lights = 0b10010000;
    } else if (pitchAdjust === 5) {
        lights = 0b01010000;
    } else if (pitchAdjust === 6) {
        lights = 0b00110000;
    } else if (pitchAdjust === 7) {
        lights = 0b10110000;
    } else if (pitchAdjust === 8) {
        lights = 0b01110000;
    } else if (pitchAdjust > 8) {
        lights = 0b11110000;
    } else if (pitchAdjust === -1) {
        lights = 0b00000010;
    } else if (pitchAdjust === -2) {
        lights = 0b00000100;
    } else if (pitchAdjust === -3) {
        lights = 0b00001000;
    } else if (pitchAdjust === -4) {
        lights = 0b00001001;
    } else if (pitchAdjust === -5) {
        lights = 0b00001010;
    } else if (pitchAdjust === -6) {
        lights = 0b00001100;
    } else if (pitchAdjust === -7) {
        lights = 0b00001101;
    } else if (pitchAdjust === -8) {
        lights = 0b00001110;
    } else if (pitchAdjust < -8) {
        lights = 0b00001111;
    } else {
        lights = 0b11111111;
    }

    for (let i=0; i<8; i++) {
        let code = 0x00;
        const pad = 0b10000000 >>> i;

        if (lights & pad) {
            code = 0x7f;
        } else {
            code = 0x00;
        }

        PioneerDDJFLX4.pitchPadsModesStatus[group].forEach(
            (padMode) => midi.sendShortMsg(
                padMode,
                PioneerDDJFLX4.pitchPadsFirstControl + i,
                code,
            )
        );
    }
};

PioneerDDJFLX4.pitchPadPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7f) {
        return;
    }

    const pad = control - this.pitchPadsFirstControl;
    let pitch = 0;

    if (pad === 0) {
        pitch = 0;
    } else if (pad === 1) {
        pitch = 1;
    } else if (pad === 2) {
        pitch = 2;
    } else if (pad === 3) {
        pitch = 3;
    } else if (pad === 4) {
        pitch = -3;
    } else if (pad === 5) {
        pitch = -2;
    } else if (pad === 6) {
        pitch = -1;
    } else if (pad === 7) {
        pitch = 0;
    }

    engine.setValue(group, "pitch_adjust", pitch);
};

PioneerDDJFLX4.pitchPadShiftPressed = function(_channel, control, value, _status, group) {
    if (value !== 0x7f) {
        return;
    }

    const pad = control - this.pitchPadsFirstControl;

    let currentPitch = engine.getValue(group, "pitch_adjust");

    if (pad === 0) {
        currentPitch += 1;
    } else if (pad === 1) {
        currentPitch += 2;
    } else if (pad === 2) {
        currentPitch += 3;
    } else if (pad === 3) {
        currentPitch += 4;
    } else if (pad === 4) {
        currentPitch += -4;
    } else if (pad === 5) {
        currentPitch += -3;
    } else if (pad === 6) {
        currentPitch += -2;
    } else if (pad === 7) {
        currentPitch += -1;
    }

    engine.setValue(group, "pitch_adjust", currentPitch);
};


//
// Shutdown
//

PioneerDDJFLX4.shutdown = function() {
    // reset vumeter
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.deck1.vuMeter, false);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.deck2.vuMeter, false);

    // housekeeping
    // turn off all Sampler LEDs
    for (var i = 0; i <= 7; ++i) {
        midi.sendShortMsg(0x97, 0x30 + i, 0x00);    // Deck 1 pads
        midi.sendShortMsg(0x98, 0x30 + i, 0x00);    // Deck 1 pads with SHIFT
        midi.sendShortMsg(0x99, 0x30 + i, 0x00);    // Deck 2 pads
        midi.sendShortMsg(0x9A, 0x30 + i, 0x00);    // Deck 2 pads with SHIFT
    }
    // turn off all Hotcue LEDs
    for (i = 0; i <= 7; ++i) {
        midi.sendShortMsg(0x97, 0x00 + i, 0x00);    // Deck 1 pads
        midi.sendShortMsg(0x98, 0x00 + i, 0x00);    // Deck 1 pads with SHIFT
        midi.sendShortMsg(0x99, 0x00 + i, 0x00);    // Deck 2 pads
        midi.sendShortMsg(0x9A, 0x00 + i, 0x00);    // Deck 2 pads with SHIFT
    }

    // turn off loop in and out lights
    PioneerDDJFLX4.setLoopButtonLights(0x90, 0x00);
    PioneerDDJFLX4.setLoopButtonLights(0x91, 0x00);

    // turn off reloop lights
    PioneerDDJFLX4.setReloopLight(0x90, 0x00);
    PioneerDDJFLX4.setReloopLight(0x91, 0x00);

    // stop any flashing lights
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.beatFx, false);
    PioneerDDJFLX4.toggleLight(PioneerDDJFLX4.lights.shiftBeatFx, false);

    // stop the keepalive timer
    engine.stopTimer(PioneerDDJFLX4.keepAliveTimer);
};
