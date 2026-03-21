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

Default: false

---

## BROWSE_LONGPRESS_MS

Reserved for future long-press handling of the browse encoder.

Currently not used.

Default: 300

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

simple  
Basic Mixxx-style loop adjustment  

workflow  
Stateful loop workflow with:

• pending loop-out state  
• jog-based loop edge editing  
• optional timeout  

Default: simple

---

## loopAdjustStepBeats

Step size for jog-based loop edge adjustment.

Used in both modes.

Default: 0.02

---

## loopAdjustTimeoutMs

Timeout for automatic exit of loop-adjust mode.

Only relevant in `workflow` mode.

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

## fastSeekScale

Multiplier for Shift + jog fast seek.

Higher value = faster movement.

Default: 150

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

Default: 1.0

---

## seekScratchMultiplier

Speed multiplier for seek-style scratch (Shift + touch).

Default: 4.0

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