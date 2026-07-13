# Pioneer DDJ-FLX4 Custom Mapping — Configuration

This file documents script configuration options available in the mapping.

All values are defined directly in the script and must be modified there.

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

# Sampler

## SAMPLER_LONGPRESS_MS

Threshold for detecting long press on sampler pads.

Used for:

• stop vs trigger behavior  

Default: 350 ms

---

# Quantize / Keylock

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

## reloopExitBeats

Default loop size when pressing 4BEAT/EXIT without an existing loop.

Default: 4

---

# Navigation

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

# STEMS

## STEMS_PAD5_8_MODE

Controls behavior of pads 5–8 in STEMS mode.

Options:

solo  
Momentary solo / hold-mute  

fx  
Control stem QuickEffect  

Default: solo

---

# Transport / Vinyl Behavior

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
