// Pioneer-DDJ-FLX4-extended-scripts.js — optional overlay for Mixxx 2.6.
// Load after Pioneer-DDJ-FLX4-2.0.script.js, without a second functionprefix.
// Shared transport, MIDI decoding, loops, hotcues and LEDs remain in Basic.
/* global PioneerDDJFLX4 */

PioneerDDJFLX4.tempoRanges = [0.08, 0.16, 0.32, 0.64, 1.0];
PioneerDDJFLX4.fxTuning.shapedBeatFxKnob = false;
PioneerDDJFLX4.fxTuning.beatFxSuperExp = 1.5;
PioneerDDJFLX4.fxTuning.beatFxMixExp = 1.2;
PioneerDDJFLX4._beatFxPresetState = {
    groupIndex: 0,
    variantIndex: 0,
    absoluteIndex: 0
};
PioneerDDJFLX4._basicPlayPressed = PioneerDDJFLX4.playPressed;

// Time threshold (milliseconds) for Quantize button long press.
//
// Short press → toggle quantize
// Long press  → toggle keylock
//
PioneerDDJFLX4.QUANTIZE_LONGPRESS_MS = 350;

//beatFx
// Preset order expected:
//   0  = 01_ECHO_1_4
//   1  = 02_ECHO_1_2
//   2  = 03_ECHO_1
//   3  = 04_ECHO_2
//   4  = 05_ECHO_4
//   5  = 06_REVERB_DJ
//   6  = 07_REVERB_WASH
//   7  = 08_TRANS_1_4
//   8  = 09_TRANS_1_2
//   9  = 10_TRANS_1
//   10 = 11_TRANS_2
//   11 = 12_TRANS_4
//   12 = 13_FLANGER_DJ
//   13 = 14_PHASER_DJ

PioneerDDJFLX4._beatFxPresetGroups = [
    { name: "Echo",    presets: [0, 1, 2, 3, 4] },
    { name: "Reverb",  presets: [5, 6] },
    { name: "Trans",   presets: [7, 8, 9, 10, 11] },
    { name: "Flanger", presets: [12] },
    { name: "Phaser",  presets: [13] }
];


// -----------------------------------------------------------------------------
// STEMS BEHAVIOUR
// -----------------------------------------------------------------------------

// Pads 5–8 behaviour in STEMS mode.
//
// "solo"
//     Pads isolate the selected stem while muting the others.
//
// "fx"
//     Pads control stem quick effects.
//
PioneerDDJFLX4.STEMS_PAD5_8_MODE = "solo";


// SHIFT + EQ: stem volume and separate pickup for each mode.
PioneerDDJFLX4.eqStemPickupThreshold =
    Number.isFinite(PioneerDDJFLX4.eqStemPickupThreshold)
        ? PioneerDDJFLX4.eqStemPickupThreshold
        : 0.02; // ~2% pickup window

// ---------- STEM INDEX CONFIG ----------
// Adjust these indices AFTER verifying stem order in Mixxx.
// Example below assumes:
//   Stem1 = drums
//   Stem2 = bass
//   Stem3 = melody
//   Stem4 = vocals
//
// If your files/controller/UI expose a different order, change ONLY this map.
PioneerDDJFLX4.stemIndexMap = PioneerDDJFLX4.stemIndexMap || {
    low:  [1, 2], // drums + bass
    mid:  [3],    // melody / instruments
    high: [4],    // vocals
};

PioneerDDJFLX4.eqStemPickup = PioneerDDJFLX4.eqStemPickup || {
    "[Channel1]": {
        eq:   { high: false, mid: false, low: false },
        stem: { high: false, mid: false, low: false },
    },
    "[Channel2]": {
        eq:   { high: false, mid: false, low: false },
        stem: { high: false, mid: false, low: false },
    },
};

PioneerDDJFLX4.eqStemLastMode = PioneerDDJFLX4.eqStemLastMode || {
    "[Channel1]": "eq",
    "[Channel2]": "eq",
};

PioneerDDJFLX4._deckShiftActive = function(channelGroup) {
    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(channelGroup);
    return deckIdx === 0
        ? !!PioneerDDJFLX4._shiftDeck1
        : !!PioneerDDJFLX4._shiftDeck2;
};

PioneerDDJFLX4._eqStemModeName = function(channelGroup) {
    return PioneerDDJFLX4._deckShiftActive(channelGroup) ? "stem" : "eq";
};

PioneerDDJFLX4._stemGroup = function(channelGroup, stemIndex) {
    return `[${channelGroup.substring(1, channelGroup.length - 1)}_Stem${stemIndex}]`;
};

PioneerDDJFLX4._availableStemCount = function(channelGroup) {
    return engine.getValue(channelGroup, "stem_count");
};

PioneerDDJFLX4._configuredStemGroupsForBand = function(channelGroup, band) {
    const indices = PioneerDDJFLX4.stemIndexMap[band] || [];
    const stemCount = PioneerDDJFLX4._availableStemCount(channelGroup);
    const groups = [];

    for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        if (idx >= 1 && idx <= stemCount) {
            groups.push(PioneerDDJFLX4._stemGroup(channelGroup, idx));
        }
    }

    return groups;
};

PioneerDDJFLX4._getCurrentEqValue = function(channelGroup, band) {
    const eqGroup = PioneerDDJFLX4._eqGroupFromChannelGroup(channelGroup);
    const eqKey = PioneerDDJFLX4._eqKeyFromBand(band);
    return PioneerDDJFLX4._clamp01(engine.getParameter(eqGroup, eqKey));
};

PioneerDDJFLX4._getCurrentStemValue = function(channelGroup, band) {
    const stemGroups = PioneerDDJFLX4._configuredStemGroupsForBand(channelGroup, band);
    if (stemGroups.length === 0) {
        return 0;
    }

    // Use first assigned stem as pickup reference.
    return PioneerDDJFLX4._clamp01(engine.getParameter(stemGroups[0], "volume"));
};

PioneerDDJFLX4._getCurrentModeValue = function(channelGroup, band, mode) {
    if (mode === "stem") {
        return PioneerDDJFLX4._getCurrentStemValue(channelGroup, band);
    }
    return PioneerDDJFLX4._getCurrentEqValue(channelGroup, band);
};

PioneerDDJFLX4._softTakeoverPass = function(channelGroup, mode, band, targetValue) {
    const pickupState = PioneerDDJFLX4.eqStemPickup[channelGroup][mode];

    if (pickupState[band]) {
        return true;
    }

    const currentValue = PioneerDDJFLX4._getCurrentModeValue(channelGroup, band, mode);
    const diff = Math.abs(targetValue - currentValue);

    if (diff <= PioneerDDJFLX4.eqStemPickupThreshold) {
        pickupState[band] = true;
        return true;
    }

    return false;
};

PioneerDDJFLX4._resetEqStemPickupForDeck = function(channelGroup) {
    if (!PioneerDDJFLX4.eqStemPickup[channelGroup]) {
        return;
    }

    PioneerDDJFLX4.eqStemPickup[channelGroup].eq.high = false;
    PioneerDDJFLX4.eqStemPickup[channelGroup].eq.mid = false;
    PioneerDDJFLX4.eqStemPickup[channelGroup].eq.low = false;

    PioneerDDJFLX4.eqStemPickup[channelGroup].stem.high = false;
    PioneerDDJFLX4.eqStemPickup[channelGroup].stem.mid = false;
    PioneerDDJFLX4.eqStemPickup[channelGroup].stem.low = false;
};

PioneerDDJFLX4._resetEqStemPickupAll = function() {
    PioneerDDJFLX4._resetEqStemPickupForDeck("[Channel1]");
    PioneerDDJFLX4._resetEqStemPickupForDeck("[Channel2]");
};

PioneerDDJFLX4._syncEqStemMode = function(channelGroup) {
    const currentMode = PioneerDDJFLX4._eqStemModeName(channelGroup);
    const previousMode = PioneerDDJFLX4.eqStemLastMode[channelGroup];

    if (previousMode !== currentMode) {
        PioneerDDJFLX4._resetEqStemPickupForDeck(channelGroup);
        PioneerDDJFLX4.eqStemLastMode[channelGroup] = currentMode;
    }

    return currentMode;
};

PioneerDDJFLX4._setStemValue = function(channelGroup, band, value) {
    const stemGroups = PioneerDDJFLX4._configuredStemGroupsForBand(channelGroup, band);
    const v = PioneerDDJFLX4._clamp01(value);

    for (let i = 0; i < stemGroups.length; i++) {
        engine.setParameter(stemGroups[i], "volume", v);
    }
};

PioneerDDJFLX4._routeEq = function(channelGroup, band, value14bit) {
    const normalized = PioneerDDJFLX4._clamp01(value14bit / 16383);
    const mode = PioneerDDJFLX4._syncEqStemMode(channelGroup);

    if (!PioneerDDJFLX4._softTakeoverPass(channelGroup, mode, band, normalized)) {
        return;
    }

    if (mode === "stem") {
        PioneerDDJFLX4._setStemValue(channelGroup, band, normalized);
    } else {
        PioneerDDJFLX4._setEqValue(channelGroup, band, normalized);
    }
};

///////////////////////////////////////////////////////////////
// PLAY BUTTON: OPTIONAL VINYL BRAKE / SOFT START
//
// Configurable behaviour for the PLAY button when Vinyl Mode
// is active on the deck.
//
// Behaviour:
//
// PLAY_BRAKE_ON_VINYL = false
//     -> PLAY behaves like normal Play/Pause
//
// PLAY_BRAKE_ON_VINYL = true
//     -> when Vinyl Mode is active:
//        stopped deck  -> soft start playback
//        playing deck  -> apply vinyl brake
//        press during brake -> cancel brake and resume playback
//
// SHIFT+PLAY (reverseroll) is unaffected.
///////////////////////////////////////////////////////////////


// -----------------------------------------------------------------------------
// USER OPTION
// -----------------------------------------------------------------------------
PioneerDDJFLX4.PLAY_BRAKE_ON_VINYL = false;

PioneerDDJFLX4.vinylFx = {
    brakeFactor: 10,
    softStartFactor: 15,
};

// -----------------------------------------------------------------------------
// RUNTIME STATE
// -----------------------------------------------------------------------------

if (!Array.isArray(PioneerDDJFLX4._brakeInProgress)) {
    PioneerDDJFLX4._brakeInProgress = [false, false];
}

if (!Array.isArray(PioneerDDJFLX4._brakeCompleted)) {
    PioneerDDJFLX4._brakeCompleted = [false, false];
}

if (!Array.isArray(PioneerDDJFLX4._brakeWatchTimer)) {
    PioneerDDJFLX4._brakeWatchTimer = [-1, -1];
}


// -----------------------------------------------------------------------------
// CANCEL BRAKE WATCH
// -----------------------------------------------------------------------------

PioneerDDJFLX4._cancelBrakeWatch = function(deckIdx) {

    const t = PioneerDDJFLX4._brakeWatchTimer[deckIdx];

    if (t !== -1) {
        try {
            engine.stopTimer(t);
        } catch (e) { void e; }

        PioneerDDJFLX4._brakeWatchTimer[deckIdx] = -1;
    }

    PioneerDDJFLX4._brakeInProgress[deckIdx] = false;
};


// -----------------------------------------------------------------------------
// STOP VINYL FX
// -----------------------------------------------------------------------------

PioneerDDJFLX4._stopAllVinylFx = function(deck) {

    try {
        if (typeof engine.isBrakeActive === "function" && engine.isBrakeActive(deck)) {
            engine.brake(deck, false);
        }
    } catch (e) { void e; }

    try {
        if (typeof engine.isSoftStartActive === "function" && engine.isSoftStartActive(deck)) {
            engine.softStart(deck, false);
        }
    } catch (e) { void e; }
};


// -----------------------------------------------------------------------------
// BRAKE WATCH TIMER
// -----------------------------------------------------------------------------

PioneerDDJFLX4._startBrakeWatch = function(deckIdx, group) {

    const deck = deckIdx + 1;

    PioneerDDJFLX4._cancelBrakeWatch(deckIdx);

    PioneerDDJFLX4._brakeInProgress[deckIdx] = true;
    PioneerDDJFLX4._brakeCompleted[deckIdx] = false;

    PioneerDDJFLX4._brakeWatchTimer[deckIdx] = engine.beginTimer(50, function() {

        let done;

        if (typeof engine.isBrakeActive === "function") {
            done = !engine.isBrakeActive(deck);
        } else {
            done = engine.getValue(group, "play") === 0;
        }

        if (done) {

            engine.setValue(group, "play", 0);

            PioneerDDJFLX4._cancelBrakeWatch(deckIdx);
            PioneerDDJFLX4._brakeCompleted[deckIdx] = true;
        }

    });
};


// -----------------------------------------------------------------------------
// PLAY BUTTON HANDLER
// -----------------------------------------------------------------------------

PioneerDDJFLX4.playPressed = function(_channel, _control, value, _status, group) {

    if (value !== 0x7F) return;
    // Basic owns the preview commit and normal Play/Pause behavior.
    if (PioneerDDJFLX4._hotcuePreview[group]) {
        PioneerDDJFLX4._basicPlayPressed(_channel, _control, value, _status, group);
        return;
    }

    const deckIdx = PioneerDDJFLX4._deckIndexFromGroup(group);
    const deck = deckIdx + 1;

    const vinylOn = !!PioneerDDJFLX4._vinylWanted[deckIdx];
    const brakeMode = !!PioneerDDJFLX4.PLAY_BRAKE_ON_VINYL;

    // Normal behaviour if vinyl mode is off or brake mode disabled
    if (!vinylOn || !brakeMode) {
        PioneerDDJFLX4._basicPlayPressed(_channel, _control, value, _status, group);
        return;
    }

    // If brake currently running → cancel brake and resume playback
    if (PioneerDDJFLX4._brakeInProgress[deckIdx] &&
        !PioneerDDJFLX4._brakeCompleted[deckIdx]) {

        PioneerDDJFLX4._stopAllVinylFx(deck);
        PioneerDDJFLX4._cancelBrakeWatch(deckIdx);

        PioneerDDJFLX4._brakeInProgress[deckIdx] = false;
        PioneerDDJFLX4._brakeCompleted[deckIdx] = false;

        engine.setValue(group, "play", 1);
        return;
    }

    // Deck stopped → start playback with soft start
    if (PioneerDDJFLX4._brakeCompleted[deckIdx] ||
        engine.getValue(group, "play") === 0) {

        PioneerDDJFLX4._cancelBrakeWatch(deckIdx);
        PioneerDDJFLX4._brakeCompleted[deckIdx] = false;

        engine.setValue(group, "play", 1);

        if (typeof engine.softStart === "function") {
            engine.softStart(deck, true, PioneerDDJFLX4.vinylFx.softStartFactor);
        }

        return;
    }

    // Deck playing → start brake
    PioneerDDJFLX4._stopAllVinylFx(deck);
    PioneerDDJFLX4._startBrakeWatch(deckIdx, group);

    if (typeof engine.brake === "function") {
        engine.brake(deck, true, PioneerDDJFLX4.vinylFx.brakeFactor);
    } else {
        engine.setValue(group, "play", 0);
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

// ============================================================
// Beat FX preset groups
// ============================================================
//
// Goal:
// - FX SELECT cycles effect types (Echo, Reverb, Trans, Flanger, Phaser)
// - BEAT LEFT / RIGHT cycles only variants inside the current type
//
// Important:
// - This logic assumes the chain presets are stored in a fixed,
//   alphabetically stable order in Mixxx.
// - If presets are added/removed/renamed, update the table below.
// - This implementation treats the internal mapping state as the source of
//   truth and always requests the same preset index for both Beat FX units.
// - Manual preset changes in the Mixxx GUI will desync this state.

/**
 * Returns the current Beat FX group object.
 */
PioneerDDJFLX4._getBeatFxGroup = function() {
    return PioneerDDJFLX4._beatFxPresetGroups[PioneerDDJFLX4._beatFxPresetState.groupIndex];
};

/**
 * Returns the default variant index for a Beat FX group.
 *
 * This allows the preset order to stay musically/logically sorted
 * (1/4, 1/2, 1, 2, 4) while still choosing a more useful default
 * when switching effect types.
 *
 * Defaults:
 * - Echo   -> 1 beat
 * - Reverb -> DJ
 * - Trans  -> 1 beat
 * - Flanger/Phaser -> only available variant
 */
PioneerDDJFLX4._getBeatFxDefaultVariant = function(groupIndex) {
    const groups = PioneerDDJFLX4._beatFxPresetGroups;
    const group = groups[groupIndex];
    if (!group) return 0;

    switch (group.name) {
        case "Echo":
            return 2; // 01_ECHO_1_4, 02_ECHO_1_2, 03_ECHO_1
        case "Reverb":
            return 0; // 06_REVERB_DJ
        case "Trans":
            return 2; // 08_TRANS_1_4, 09_TRANS_1_2, 10_TRANS_1
        case "Flanger":
            return 0;
        case "Phaser":
            return 0;
        default:
            return 0;
    }
};

/**
 * Request a specific internal absolute preset index for one Beat FX unit.
 *
 * Internal mapping index:
 *   0 = first real preset file (01_ECHO_1_4)
 *   1 = second real preset file
 *   ...
 *
 * Mixxx slot index:
 *   0 = passthrough ("---")
 *   1 = first real preset
 *   2 = second real preset
 *   ...
 * @returns {boolean} Whether a valid target was requested.
 */
PioneerDDJFLX4._setBeatFxUnitToAbsolute = function(u, targetAbsolute) {
    const targetSlot = targetAbsolute + 1; // convert internal index -> Mixxx slot
    if (targetSlot < 0 || targetSlot >= engine.getValue(u, "num_chain_presets")) {
        return false;
    }

    engine.setValue(u, "loaded_chain_preset", targetSlot);
    return true;
};

/**
 * Request the same absolute preset index for both Beat FX units.
 * @returns {boolean} Whether both units received a valid target request.
 */
PioneerDDJFLX4._setBothBeatFxUnitsToAbsoluteFromState = function(targetAbsolute) {
    const unit1Set = PioneerDDJFLX4._setBeatFxUnitToAbsolute(PioneerDDJFLX4._beatFx.unit1, targetAbsolute);
    const unit2Set = PioneerDDJFLX4._setBeatFxUnitToAbsolute(PioneerDDJFLX4._beatFx.unit2, targetAbsolute);
    return unit1Set && unit2Set;
};

/**
 * Set Beat FX group + variant.
 *
 * The internal mapping state is treated as the source of truth.
 * Both Beat FX units receive the same target preset index.
 */
PioneerDDJFLX4._setBeatFxGroupVariant = function(groupIndex, variantIndex) {
    const group = PioneerDDJFLX4._beatFxPresetGroups[groupIndex];
    if (!group) return;
    if (variantIndex < 0 || variantIndex >= group.presets.length) return;

    const targetAbsolute = group.presets[variantIndex];

    if (!PioneerDDJFLX4._setBothBeatFxUnitsToAbsoluteFromState(targetAbsolute)) {
        return;
    }

    // Update internal state afterwards.
    PioneerDDJFLX4._beatFxPresetState.groupIndex = groupIndex;
    PioneerDDJFLX4._beatFxPresetState.variantIndex = variantIndex;
    PioneerDDJFLX4._beatFxPresetState.absoluteIndex = targetAbsolute;
};

/**
 * Select next Beat FX type and jump to its default variant.
 *
 * Example:
 * Echo -> Reverb -> Trans -> Flanger -> Phaser -> Echo
 */
PioneerDDJFLX4._nextBeatFxGroup = function() {
    const groups = PioneerDDJFLX4._beatFxPresetGroups;
    const nextGroup = (PioneerDDJFLX4._beatFxPresetState.groupIndex + 1) % groups.length;
    const defaultVariant = PioneerDDJFLX4._getBeatFxDefaultVariant(nextGroup);

    PioneerDDJFLX4._setBeatFxGroupVariant(nextGroup, defaultVariant);
};

/**
 * Select previous Beat FX type and jump to its default variant.
 */
PioneerDDJFLX4._prevBeatFxGroup = function() {
    const groups = PioneerDDJFLX4._beatFxPresetGroups;
    const prevGroup =
        (PioneerDDJFLX4._beatFxPresetState.groupIndex - 1 + groups.length) % groups.length;
    const defaultVariant = PioneerDDJFLX4._getBeatFxDefaultVariant(prevGroup);

    PioneerDDJFLX4._setBeatFxGroupVariant(prevGroup, defaultVariant);
};

/**
 * Select previous preset variant inside the current Beat FX group.
 */
PioneerDDJFLX4._prevBeatFxVariant = function() {
    const group = PioneerDDJFLX4._getBeatFxGroup();
    const currentVariant = PioneerDDJFLX4._beatFxPresetState.variantIndex;

    if (group.presets.length <= 1) return;
    if (currentVariant <= 0) return;

    PioneerDDJFLX4._setBeatFxGroupVariant(
        PioneerDDJFLX4._beatFxPresetState.groupIndex,
        currentVariant - 1
    );
};

/**
 * Select next preset variant inside the current Beat FX group.
 */
PioneerDDJFLX4._nextBeatFxVariant = function() {
    const group = PioneerDDJFLX4._getBeatFxGroup();
    const currentVariant = PioneerDDJFLX4._beatFxPresetState.variantIndex;

    if (group.presets.length <= 1) return;
    if (currentVariant >= group.presets.length - 1) return;

    PioneerDDJFLX4._setBeatFxGroupVariant(
        PioneerDDJFLX4._beatFxPresetState.groupIndex,
        currentVariant + 1
    );
};

/**
 * Force a known Beat FX startup state on both units.
 *
 * Default:
 * Echo group -> 1 beat variant
 */
PioneerDDJFLX4._initBeatFx = function() {
    const groupIndex = 0;
    const variantIndex = PioneerDDJFLX4._getBeatFxDefaultVariant(groupIndex);
    PioneerDDJFLX4._setBeatFxGroupVariant(groupIndex, variantIndex);
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
    try { engine.setValue(u, routeKey, enable); } catch (e) { void e; }
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

// ---- BEAT FX SELECT: cycle Beat FX groups ----
PioneerDDJFLX4.beatFxSelectPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;

    PioneerDDJFLX4._nextBeatFxGroup();
};

PioneerDDJFLX4.beatFxSelectShiftPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;

    PioneerDDJFLX4._prevBeatFxGroup();
};

// ---- BEAT LEFT/RIGHT: cycle variants inside current Beat FX group ----
PioneerDDJFLX4.beatFxLeftPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;

    PioneerDDJFLX4._prevBeatFxVariant();
};

PioneerDDJFLX4.beatFxRightPressed = function(_channel, _control, value) {
    if (value !== 0x7F) return;

    PioneerDDJFLX4._nextBeatFxVariant();
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

    let out = v;

    if (PioneerDDJFLX4.fxTuning.shapedBeatFxKnob) {
        out = isShift
            ? Math.pow(v, PioneerDDJFLX4.fxTuning.beatFxMixExp)
            : Math.pow(v, PioneerDDJFLX4.fxTuning.beatFxSuperExp);
    }

    PioneerDDJFLX4._beatFxTargets().forEach((u) => {
        engine.setParameter(u, key, out);
    });
};

// ---- ON/OFF: toggle Unit + Slots 1..3 together ----
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
            try { engine.setValue(u, routeKey, 0); } catch (e) { void e; }
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

    // Pioneer-Logik:
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

///////////////////////////////////////////////////////////////
// PAD FX for FLX4
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
    // if any slot is on -> ensure Unit enabled + routing to current deck ON
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
        try { engine.setValue(U, rk, 0); } catch (e) { void e; }
        return;
    }

    // ON: route + unit first, then slots
    try { engine.setValue(U, rk, 1); } catch (e) { void e; }
    engine.setValue(U, "enabled", 1);
    engine.setValue(S1, "enabled", 1);
    engine.setValue(S2, "enabled", 1);
    engine.setValue(S3, "enabled", 1);
};

PioneerDDJFLX4.updatePadFxUI = function(group) {
    const unitIdx = PioneerDDJFLX4._fxUnitsForDeckAndMode(group);
    if (!unitIdx) return;

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
        // Arm unit and routing only when the user enables a slot.
        if (!cur) {
            PioneerDDJFLX4._autoArmIfNeeded(unitIdx, group);
        }
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

///////////////////////////////////////////////////////////////
// VINYL MODE (PER-DECK)
//
// FLX4 has an internal Vinyl Mode that changes which CC the jog sends.
// To switch it, Mixxx must SEND the command to the controller:
//   Deck1: 0x90 0x17 <val>
//   Deck2: 0x91 0x17 <val>
///////////////////////////////////////////////////////////////

// Single source of truth: this is the documented command that switches the controller's jog mode.
PioneerDDJFLX4._setHardwareVinyl = function(deckIdx, on) {
    const st = (deckIdx === 0) ? 0x90 : 0x91;
    midi.sendShortMsg(st, 0x17, on ? 0x7F : 0x00);
};

// Per-deck Vinyl state belongs to the overlay.
if (!Array.isArray(PioneerDDJFLX4._vinylWanted)) {
    PioneerDDJFLX4._vinylWanted = [false, false];
}

PioneerDDJFLX4._applyVinylState = function(deckIdx, on) {
    const state = !!on;
    PioneerDDJFLX4._vinylWanted[deckIdx] = state;

    // switch controller jog MIDI mode
    PioneerDDJFLX4._setHardwareVinyl(deckIdx, state);

    // if turning OFF, ensure we don't stay in scratching
    if (!state) {
        if (PioneerDDJFLX4._scratchEnabled[deckIdx]) PioneerDDJFLX4._scratchDisable(deckIdx + 1);
    }

};

PioneerDDJFLX4.shiftReloopExitPressed = function(_channel, _control, value, _status, group) {
    if (value === 0x7F) {
        script.triggerControl(group, "reloop_toggle");
    }
};


// --- Quantize / Keylock (Short / Long Press) ---

PioneerDDJFLX4._quantizeLP = PioneerDDJFLX4._quantizeLP || {
    timer: {},
    fired: {}
};

PioneerDDJFLX4.shiftChannelCuePressed = function (_channel, _control, value, _status, group) {
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
//   - "fx": toggle Stem QuickEffect enabled, Shift = next preset
//   - "solo" (default, momentary):
//        Pad held        -> SOLO (only that stem unmuted, others muted)
//        Shift + held    -> HOLD-MUTE (only that stem muted, others unmuted)
//        Release         -> restore previous mute state
//
// LED sync:
// - Extended init connects:
//     [ChannelX] stem_count -> stemCountChanged
//     [ChannelX_StemY] mute -> stemMuteChanged
//     [QuickEffectRack1_[ChannelX_StemY]] enabled -> stemFxChanged
// - The shared Keyboard LED hook refreshes these on mode entry.
///////////////////////////////////////////////////////////////

// ------------------- CONSTANTS -------------------
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

PioneerDDJFLX4._stemQfxGroup = function(channelGroup, stemIdx1) {
    return `[QuickEffectRack1_[${channelGroup.substring(1, channelGroup.length - 1)}_Stem${stemIdx1}]]`;
};

// ------------------- MOMENTARY SOLO STATE -------------------
PioneerDDJFLX4._stemMomentary = PioneerDDJFLX4._stemMomentary || {
    "[Channel1]": { active: false, stemIdx1: 0, mode: "", prev: [0,0,0,0] },
    "[Channel2]": { active: false, stemIdx1: 0, mode: "", prev: [0,0,0,0] },
};

PioneerDDJFLX4._stemMomentaryApply = function(group, stemIdx1, mode /*"solo"|"holdmute"*/) {
    const stemCount = PioneerDDJFLX4._stemCount(group);
    if (stemIdx1 < 1 || stemIdx1 > stemCount) return;

    const st = PioneerDDJFLX4._stemMomentary[group] ||
        (PioneerDDJFLX4._stemMomentary[group] = { active:false, stemIdx1:0, mode:"", prev:[0,0,0,0] });

    // The first held pad owns the snapshot until its matching release.
    if (st.active) {
        return;
    }

    // Snapshot current mutes (1..4, egal ob vorhanden – safe)
    for (let s = 1; s <= 4; s++) {
        const sg = PioneerDDJFLX4._stemGroup(group, s);
        st.prev[s - 1] = engine.getValue(sg, "mute") > 0 ? 1 : 0;
    }
    st.active = true;
    st.stemIdx1 = stemIdx1;
    st.mode = mode;

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

PioneerDDJFLX4._stemMomentaryRelease = function(group, stemIdx1, mode) {
    const st = PioneerDDJFLX4._stemMomentary[group];
    if (!st || !st.active || st.stemIdx1 !== stemIdx1 || st.mode !== mode) {
        return;
    }

    const stemCount = PioneerDDJFLX4._stemCount(group);
    for (let s = 1; s <= stemCount; s++) {
        const sg = PioneerDDJFLX4._stemGroup(group, s);
        engine.setValue(sg, "mute", st.prev[s - 1] ? 1 : 0);
    }
    st.active = false;
    st.stemIdx1 = 0;
    st.mode = "";
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
        // Script-Binding forwards the matching release for momentary solo.
        if (value === 0x7F) {
            PioneerDDJFLX4._stemMomentaryApply(group, stemIdx1, "solo");
        } else if (value === 0x00) {
            PioneerDDJFLX4._stemMomentaryRelease(group, stemIdx1, "solo");
        }
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
        if (value === 0x7F) {
            PioneerDDJFLX4._stemMomentaryApply(group, stemIdx1, "holdmute");
        } else if (value === 0x00) {
            PioneerDDJFLX4._stemMomentaryRelease(group, stemIdx1, "holdmute");
        }
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

// Neutral Keyboard bindings dispatch to the existing Stem pad handlers.
PioneerDDJFLX4.keyboardModeEntered = function(_group) {};
PioneerDDJFLX4.updateKeyboardLeds = PioneerDDJFLX4._refreshKeyboardStemLeds;
PioneerDDJFLX4.keyboardPadPressed = function(channel, control, value, status, group) {
    if (control < 0x44) {
        PioneerDDJFLX4.stemMutePadPressed(channel, control, value, status, group);
    } else {
        PioneerDDJFLX4.stemFxPadPressed(channel, control, value, status, group);
    }
};
PioneerDDJFLX4.keyboardPadShiftPressed = function(channel, control, value, status, group) {
    if (control < 0x44) {
        PioneerDDJFLX4.stemMutePadShiftPressed(channel, control, value, status, group);
    } else {
        PioneerDDJFLX4.stemFxPadShiftPressed(channel, control, value, status, group);
    }
};
PioneerDDJFLX4.jogVinylEnabled = function(group) {
    return PioneerDDJFLX4._vinylWanted[PioneerDDJFLX4._deckIndexFromGroup(group)];
};

// The overlay owns only its additional engine connections.
PioneerDDJFLX4._extendedConnections = [];
PioneerDDJFLX4._basicInit = PioneerDDJFLX4.init;
PioneerDDJFLX4.init = function() {
    PioneerDDJFLX4._basicInit();

    // Register callbacks for each deck, when a file is loaded and the number of stems is available
    PioneerDDJFLX4._extendedConnections.push(engine.makeConnection("[Channel1]", "stem_count", PioneerDDJFLX4.stemCountChanged));
    PioneerDDJFLX4._extendedConnections.push(engine.makeConnection("[Channel2]", "stem_count", PioneerDDJFLX4.stemCountChanged));

    // Register callbacks for each stems of each decks, to change pad lights when muted/unmuted/FX
    for (let stem=1; stem<=4; stem++) {
        for (let deck=1; deck<=2; deck++) {
            PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(`[Channel${deck}_Stem${stem}]`, "mute", PioneerDDJFLX4.stemMuteChanged));
            PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(`[QuickEffectRack1_[Channel${deck}_Stem${stem}]]`, "enabled", PioneerDDJFLX4.stemFxChanged));
        }
    }

    // --- PAD FX LED SYNC (Engine -> Controller) ---
    [1,2,3,4].forEach((unitIdx) => {
        const U = `[EffectRack1_EffectUnit${unitIdx}]`;

        // Unit enable
        PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(U, "enabled", () => {
            PioneerDDJFLX4.updatePadFxUI("[Channel1]");
            PioneerDDJFLX4.updatePadFxUI("[Channel2]");
        }));

        // Slots 1–3
        [1,2,3].forEach((slotIdx) => {
            PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(
                `[EffectRack1_EffectUnit${unitIdx}_Effect${slotIdx}]`,
                "enabled",
                () => {
                    PioneerDDJFLX4.updatePadFxUI("[Channel1]");
                    PioneerDDJFLX4.updatePadFxUI("[Channel2]");
                }
            ));
        });

        // Routing Deck 1 / Deck 2
        PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(U, "group_[Channel1]_enable", () => {
            PioneerDDJFLX4.updatePadFxUI("[Channel1]");
        }));
        PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(U, "group_[Channel2]_enable", () => {
            PioneerDDJFLX4.updatePadFxUI("[Channel2]");
        }));
    });


    // Basic already connects Unit1 slot indicators; add the custom unit state.
    [1, 2].forEach(function(unit) {
        const group = `[EffectRack1_EffectUnit${unit}]`;
        PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(
            group, "enabled", PioneerDDJFLX4._updateBeatFxOnOffLed));
    });
    for (let slot = 1; slot <= 3; slot++) {
        PioneerDDJFLX4._extendedConnections.push(engine.makeConnection(
            `[EffectRack1_EffectUnit2_Effect${slot}]`, "enabled", PioneerDDJFLX4._updateBeatFxOnOffLed));
    }

    PioneerDDJFLX4._resetEqStemPickupAll();
    PioneerDDJFLX4._initBeatFx();
    PioneerDDJFLX4._applyBeatFxRouting();
    PioneerDDJFLX4._applyVinylState(0, false);
    PioneerDDJFLX4._applyVinylState(1, false);
    PioneerDDJFLX4.updateAllLeds();
};

PioneerDDJFLX4._basicShutdown = PioneerDDJFLX4.shutdown;
PioneerDDJFLX4.shutdown = function() {
    ["[Channel1]", "[Channel2]"].forEach(function(group, deckIdx) {
        const momentary = PioneerDDJFLX4._stemMomentary[group];
        PioneerDDJFLX4._stemMomentaryRelease(group, momentary.stemIdx1, momentary.mode);
        const timer = PioneerDDJFLX4._quantizeLP.timer[group];
        if (timer) {
            engine.stopTimer(timer);
        }
        PioneerDDJFLX4._quantizeLP.timer[group] = null;
        PioneerDDJFLX4._quantizeLP.fired[group] = false;
        PioneerDDJFLX4._cancelBrakeWatch(deckIdx);
        PioneerDDJFLX4._brakeCompleted[deckIdx] = false;
        PioneerDDJFLX4._stopAllVinylFx(deckIdx + 1);
    });
    PioneerDDJFLX4._extendedConnections.forEach(function(connection) {
        connection.disconnect();
    });
    PioneerDDJFLX4._extendedConnections = [];
    PioneerDDJFLX4._resetEqStemPickupAll();
    PioneerDDJFLX4._basicShutdown();
};
