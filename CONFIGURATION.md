# Pioneer DDJ-FLX4 Custom Mapping — Configuration

This file documents script configuration options available in the mapping.

These values can be changed directly in the mapping script.

---

# Browser

## BROWSE_FOCUS_TOGGLE_ONLY

Toggle between simple focus switching and full Mixxx focus cycling.

true  
Browse press toggles only between:

• library tree  
• track table

false  
Use Mixxx default focus cycling.

---

## BROWSE_LONGPRESS_MS

Reserved for possible long-press browser behavior.

Currently unused.

Default: 300

---

# Sampler

## SAMPLER_LONGPRESS_MS

Time threshold for detecting sampler long press.

Default: 350 ms

---

# Quantize / Keylock

## QUANTIZE_LONGPRESS_MS

Long press threshold for mixer cue buttons.

Short press → quantize  
Long press → keylock

Default: 350 ms

---

# Looping

## LOOP_ADJUST_MODE

Controls loop adjust workflow.

Options:

simple  
Standard Mixxx loop adjustment

hercules  
Hercules-style loop workflow with jog-based loop edge editing

Default: simple

---

## loopAdjustStepBeats

Step size used for loop edge adjustment.

Default: 0.02

---

## loopAdjustTimeoutMs

Time until loop adjust mode exits automatically.

Default: 5000

---

## reloopExitBeats

Default loop size created by 4BEAT/EXIT if no loop exists.

Default: 4

---

# Navigation

## quickJumpSize

Beat jump size used for quick jump commands.

Default: 32

---

# Jog behavior

## fastSeekScale

Multiplier used for Shift + jog search.

Default: 150

---

## bendScale

Pitch bend sensitivity.

Default: 0.8

---

## loopAdjustMultiply

Legacy multiplier for simple loop adjust mode.

Default: 50

---

## jogPPR

Jog pulses per revolution.

Default: 720

---

## jogRPM

Virtual platter speed.

Default: 33⅓

---

## scratchScale

Scratch movement scaling.

Default: 1.0

---

## seekScratchMultiplier

Speed multiplier for seek scratch mode.

Default: 4.0

---

# STEMS

## STEMS_PAD5_8_MODE

Controls behavior of pads 5-8 in STEMS mode.

Options:

solo  
Momentary solo / hold-mute behavior

fx  
Pads control stem quick effects

Default: solo

---

# Optional Vinyl Brake

## PLAY_BRAKE_ON_VINYL

Enables optional vinyl start/stop behavior for Play button.

false  
Play behaves normally

true  
Play triggers vinyl brake / soft start when Vinyl mode is active

Default: false

---

## Vinyl FX parameters
vinylFx = {
brakeFactor: 10,
softStartFactor: 15
}


Control strength of brake and soft start.
