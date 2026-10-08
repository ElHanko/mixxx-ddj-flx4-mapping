# Pioneer DDJ-FLX4 Custom Mapping — Configuration

This file documents script configuration options available in the mapping.

Basic options are defined in `controllers/Pioneer-DDJ-FLX4-2.0.script.js`.
Sections marked Extended apply only to the optional
`controllers/Pioneer-DDJ-FLX4-extended-scripts.js`, loaded after Basic.
Basic is the default; see [README.md](README.md#enable-extended-manually-advanced--developer-setup)
for the current manual Extended activation path.

---

# Browser

## BROWSE_FOCUS_TOGGLE_ONLY

Controls browse encoder press behavior.

true  
Toggle only between:

• library tree  
• track table  

false  
Use full Mixxx focus cycling.

Default: true

---

# Quantize / Keylock (Extended only)

Basic SHIFT + Channel CUE performs BPM Tap. Extended replaces it with the
short/long-press behavior below.

## QUANTIZE_LONGPRESS_MS

Long-press threshold for **Shift + Channel Cue buttons**.

Short press  
→ toggle quantize  

Long press  
→ toggle keylock  

Default: 350 ms

---

# Looping

## LOOP_ADJUST_MODE

Selects loop adjustment model.

Options:

- `simple` — Basic Mixxx-style loop adjustment using `loopAdjustMultiply`.
- `workflow` — Stateful loop workflow with pending loop-out state and
  beat-relative jog adjustment using `loopAdjustStepBeats`.

Both modes support jog-based loop edge editing and the optional adjust timeout.

Default: simple

---

## loopAdjustStepBeats

Step size for jog-based loop edge adjustment.

Only used in `workflow` mode.

The `simple` mode uses `loopAdjustMultiply` instead.

Default: 0.02

---

## loopAdjustTimeoutMs

Timeout for automatic exit of loop-adjust mode.

Used in both `simple` and `workflow` mode. The timeout is restarted whenever
the jog wheel adjusts a loop edge.

Default: 5000 ms

---

## 4BEAT/EXIT (fixed behavior)

Without an active loop, 4BEAT/EXIT starts a new four-beat loop at the current
playback position. With an active loop, it exits. It does not reactivate a
stored inactive loop, and the four-beat size is not configurable.

SHIFT + 4BEAT/EXIT has no Basic action. Extended uses Mixxx `reloop_toggle`
for CDJ-style Reloop/Exit, without creating a new loop.

---

# Tempo

## tempoRanges

Tempo ranges cycled by SHIFT + SYNC:

- Basic: ±6%, ±10%, ±16%, ±25%.
- Extended: ±8%, ±16%, ±32%, ±64%, ±100%.

Extended replaces this property when loaded after Basic.

---

# Navigation

## LOAD_DOUBLEPRESS_MS

Window for detecting LOAD double press (Instant Doubles).
Single-press loading waits until this window expires.

Default: 400 ms

---

## quickJumpSize

Step size for quick jump actions.

Used by:

• Shift + loop call buttons  

Default: 32 beats

---

# Jog Behavior

## jogSearchScale

Base `playposition` step per MIDI tick for Shift + jog search.

Higher values scan through the track faster.

Default: 0.00015

---

## shiftSearchTouchMultiplier

Additional multiplier while the platter is touched during Shift + jog search.

Default: 2.0

---

## bendScale

Pitch bend sensitivity.

Affects jog behavior when not scratching.

Default: 0.8

---

## loopAdjustMultiply

Legacy multiplier used in `simple` loop mode.

Not used in `workflow` mode.

Default: 50

---

## jogPPR

Jog resolution (pulses per revolution).

Used for scratch calculations.

Default: 720

---

## jogRPM

Virtual platter rotation speed.

Used for scratch simulation.

Default: 33⅓

---

## scratchScale

Scaling factor for scratch movement.

Default: 1.8

---

# STEMS (Extended only)

## eqStemPickupThreshold

Pickup window for EQ knobs in both normal EQ mode and Shift stem-volume mode.
Values use the normalized 0–1 range.

Default: 0.02 (2%)

---

## stemIndexMap

Assigns stem indices to Shift + EQ knobs:

```js
stemIndexMap = {
    low: [1, 2],
    mid: [3],
    high: [4]
};
```

The default assumes Stem1 = drums, Stem2 = bass, Stem3 = melody/instruments,
Stem4 = vocals. Verify the order of your stem files in Mixxx before changing
this map. It applies to EQ stem-volume control, not the STEMS pads.

---

## STEMS_PAD5_8_MODE

Controls behavior of pads 5–8 in STEMS mode.

Options:

solo  
Momentary solo / hold-mute  

fx  
Control stem QuickEffect  

Default: solo

---

# Transport / Vinyl Behavior (Extended only)

Extended Vinyl Toggle currently has no controller binding. A new binding is
an open design decision. Extended starts with Vinyl OFF; the existing
Brake/SoftStart implementation remains present but requires Vinyl ON.

## PLAY_BRAKE_ON_VINYL

Enables vinyl-style transport behavior on PLAY button.

false  
Standard Play / Pause  

true  
When Vinyl mode is active:

• stopped → soft start  
• playing → brake  
• during brake → cancel + resume  

Default: false

---

## vinylFx

Controls strength of vinyl-style transport effects.

```js
vinylFx = {
    brakeFactor: 10,
    softStartFactor: 15
};
```

---

# Hotcues

## HOTCUE_STOPPED_MODE

Behavior when an existing hotcue is pressed on a stopped deck:

- `preview` — play while held; stop and return to the hotcue on release.
- `goto` — jump to the hotcue and remain stopped.
- `play` — jump to the hotcue and continue playing.

Default: preview

Bank changes and leaving Hot Cue mode also stop an active preview and return
to its starting hotcue.

## hotcueBankCount

Number of banks with eight hotcues each.

Default: 4 (hotcues 1–32)

---

# TRIM / CFX Guard

CFX movement temporarily locks TRIM and resets its pickup state to reject
spurious TRIM messages from the controller. TRIM resumes after the guard
expires and the physical knob reaches the current software value.

| Option | Default | Meaning |
| --- | --- | --- |
| `trimCfxGuardMs` | 2000 ms | TRIM lock duration after CFX movement |
| `trimPickupThreshold` | 0.02 (2%) | Pickup window in the normalized 0–1 range |
| `trimPickupHoldMs` | 1000 ms | Inactivity timeout before TRIM must be picked up again |

---

# FX Response

| Option | Default | Meaning |
| --- | --- | --- |
| `fxTuning.shapedBeatFxKnob` | false | Enable custom curves for Beat FX LEVEL/DEPTH (`super1`, Shift: `mix`) |
| `fxTuning.shapedFilterKnob` | false | Enable a symmetric center curve for CFX filter knobs |

The Beat FX shaping options and exponents belong to Extended. Basic Beat FX
uses the official 2.6 mix/meta knob behavior. Filter shaping remains in Basic.
Both knobs use a linear response by default. When shaping is enabled, the
curve exponents are `beatFxSuperExp = 1.5`, `beatFxMixExp = 1.2` and
`filterCenterExp = 1.8`.
