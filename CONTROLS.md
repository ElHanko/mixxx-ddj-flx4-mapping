# CONTROLS.md

# Pioneer DDJ-FLX4 (Custom) — Controller Reference

This file documents the current control layout and behavior of the custom Mixxx mapping for the Pioneer DDJ-FLX4.

It is intended as a practical reference for users and contributors.

## Scope

This mapping is not the stock Mixxx mapping. Several behaviors were intentionally changed to provide:

- more predictable transport behavior
- stronger LED consistency
- clearer loop handling
- more useful pad modes
- Pioneer-like workflow where possible
- Hercules-style logic where Mixxx defaults are weak

Some functions are configurable in the script. Where relevant, this document notes that behavior may depend on script options.

---

# Global Notes

## Shift behavior
Each deck has its own Shift button. Shift modifies transport, loop, pad, browser, and sync behavior depending on the section.

## Vinyl mode
Vinyl mode is handled per deck and changes jog behavior.  
It is toggled in this mapping with:

- **Shift + 4BEAT/EXIT**

Depending on script configuration, Vinyl mode may also enable optional **Play button brake / soft-start behavior**.

## Sync behavior
This mapping follows current Mixxx behavior:

- **Short press Sync** = one-shot beat sync
- **Long press Sync** = toggle sync lock (`sync_enabled`)

This is **not Rekordbox-style persistent Beat Sync mode**.  
If Mixxx changes its sync model in the future, this may be revisited.

---

# Browser / Library Section

## Browse encoder
### Rotate
- Scroll library vertically

### Press
Handled by script.

Depending on configuration:

- default Mixxx focus behavior, or
- toggle only between sidebar/tree and track table

## Shift + Browse encoder rotate
- Zoom waveform on both decks

## Load buttons
### LOAD
- Load selected track to the deck
- Double press within configured timing window:
  - Instant doubles / clone from the other deck

### Shift + LOAD (Deck 1)
- Toggle maximize/minimize library

### Shift + LOAD (Deck 2)
- Move right / open folder in library tree

---

# Transport Section

## Shift
Per-deck Shift button used to access modified functions.

## Play / Pause
### Normal
- Default:
  - Play / Pause
- Optional behavior when enabled in script:
  - if Vinyl mode is active, PLAY can behave like vinyl brake / soft start

### Optional Vinyl Brake Mode
When enabled by script config:

- stopped deck + Play -> soft start
- playing deck + Play -> brake
- pressing Play again during brake -> cancel brake and resume playback

This is optional and disabled by default unless configured otherwise.

## Shift + Play
- `reverseroll`
- Reverse playback in slip mode while held

## Cue
### Normal
- `cue_default`
- Standard cue behavior / back cue

### Shift + Cue
- `start_stop`
- Jump to track start

---

# Sync / Tempo Section

## Sync
### Short press
- One-shot beat sync (`beatsync`)

### Long press
- Toggle sync lock (`sync_enabled`)

## Shift + Sync
- Cycle tempo slider range

Current range cycle:

- ±8%
- ±16%
- ±32%
- ±64%
- ±100%

## Tempo fader
- High-resolution tempo control
- 14-bit MSB/LSB mapping per deck

---

# Jog Wheels

## Platter rotate
### Vinyl mode ON
- Scratch

### Vinyl mode OFF
- Pitch bend

The mapping also learns the controller’s internal vinyl state from incoming jog MIDI data.

## Shift + platter rotate
- Fast search / faster bend

## Platter touch
Script-controlled touch logic:

- If deck is stopped -> scratch mode on touch
- If Vinyl mode is active -> scratch mode on touch
- Otherwise -> bend mode

## Shift + platter touch
Current script intends high-speed bend / seek-style behavior.  
This should be considered script-driven behavior rather than a stock Pioneer function.

## Jog side ring rotate
- Pitch bend

## Loop-adjust priority
When loop-adjust mode is active, jog movement is used for loop point editing instead of scratch/bend.

---

# Loop Section

## LOOP IN
### Normal press
Current custom mapping uses a script wrapper.

Depending on active loop mode:

### Simple mode
- Set loop in

### Hercules mode
- If no loop is active:
  - set loop in
  - enter pending loop-out state
- If loop is active:
  - toggle loop-in adjust mode

## LOOP OUT
### Normal press
Current custom mapping uses a script wrapper.

Depending on active loop mode:

### Simple mode
- Set loop out

### Hercules mode
- If no loop is active:
  - set loop out and complete loop
- If loop is active:
  - toggle loop-out adjust mode

## 4BEAT/EXIT
### Normal press
- If loop is active:
  - exit / reloop toggle
- If loop is inactive:
  - re-enable stored loop if available
  - otherwise create default beat loop (`reloopExitBeats`, default 4)

## Shift + 4BEAT/EXIT
- Toggle Vinyl mode for the deck

## Shift + LOOP IN
- Loop in adjust mode using jog wheel

## Shift + LOOP OUT
- Loop out adjust mode using jog wheel

## CUE/LOOP CALL LEFT
### Normal
- Halve active loop
- If no active loop, attempts reloop behavior

### Shift
- Quick jump backward

## CUE/LOOP CALL RIGHT
### Normal
- Double active loop
- If no active loop, attempts reloop behavior

### Shift
- Quick jump forward

## Loop adjust modes
This mapping supports two loop-adjust models in script config:

### `simple`
- More Mixxx-like behavior
- adjust only when loop is already active

### `hercules`
- loop-in / loop-out workflow
- pending loop-out state
- jog adjusts loop points sample-based
- optional adjust timeout

---

# Mixer Section

## Crossfader
- Standard high-resolution crossfader

## Channel faders
- Standard high-resolution channel volume

## Trim / Gain
- Standard high-resolution pregain control per deck

## EQ
Per deck:

- HI
- MID
- LOW

All mapped in high-resolution mode.

## Headphone Cue
- Toggle PFL per channel

## Headphones Mixing
- Adjust cue/master monitor mix

## Quantize / Keylock

This mapping assigns Quantize and Keylock control to the **Shift + Channel Cue buttons** in the mixer section.

These are the two **headphone cue buttons** above the channel faders.

This keeps the controller layout simple and avoids dedicating additional buttons
to Quantize and Keylock while still keeping both functions quickly accessible.

### Shift + Channel Cue (Deck 1 / Deck 2)

Short press  
- toggle Quantize

Long press  
- toggle Keylock

---

# Quick Effects / Smart CFX / Beat FX

## Filter knobs
Per channel:

- QuickEffect super knob (`super1`)

## Smart CFX
### Press
- Toggle Smart CFX mode

### Shift + press
- Cycle Smart CFX preset

This is implemented through QuickEffectRack enable/preset logic, not Pioneer firmware magic.

---

# Beat FX Section

## Beat FX Select
Currently reserved / unused.

## Beat Left / Right
- Cycle effect chain preset backward / forward
- Applies to currently selected Beat FX target(s)

## Beat FX channel selector
Target routing:

- CH1 -> Deck 1 via EffectUnit1
- CH2 -> Deck 2 via EffectUnit2
- 1&2 -> both

## Beat FX Level/Depth encoder
14-bit script-controlled behavior.

### Normal
- Adjust `super1`

### Shift
- Adjust `mix`

## Beat FX On/Off
### Press
- Toggle selected Beat FX target(s)
- If anything is on -> turn all off
- If everything is off -> turn all on

### Shift + press
- Turn selected Beat FX target(s) off

LED behavior is script-driven and follows slot state rather than blindly trusting one unit flag.

---

# Pad Modes

The FLX4 pad mode buttons are remapped as follows.

## Hot Cue Mode
- Standard hotcue mode

## Keyboard Mode
Used as **STEMS mode** in this custom mapping.

## Pad FX1 Mode
- Custom pad FX layer
- Deck 1 -> EffectUnit1
- Deck 2 -> EffectUnit2

## Pad FX2 Mode
- Custom pad FX layer
- Deck 1 -> EffectUnit3
- Deck 2 -> EffectUnit4

## Beat Jump Mode
- Direct beatjump controls
- Static pad LEDs when mode is active

## Beat Loop Mode
- Direct beatloop controls
- Static pad LEDs when mode is active

## Sampler Mode
- Sampler trigger / stop / eject mode
- Custom LED state machine

## Key Shift Mode
- Pitch shift / semitone mode

---

# Hot Cue Mode

## Pads 1–8
- Activate or set Hotcue 1–8

## Shift + Pads 1–8
- Clear Hotcue 1–8

This is standard direct Mixxx hotcue behavior.

---

# Keyboard Mode / STEMS Mode

This mapping repurposes **Keyboard Mode** as **STEMS Mode**.

## Pads 1–4
### Normal
- Toggle stem mute for Stem 1–4

### Shift
- Solo-style "only this stem active"

## Pads 5–8
Behavior depends on script config.

### If `STEMS_PAD5_8_MODE = "solo"`
#### Normal
- Momentary solo for selected stem

#### Shift
- Momentary hold-mute for selected stem

### If `STEMS_PAD5_8_MODE = "fx"`
#### Normal
- Toggle Stem QuickEffect

#### Shift
- Next QuickEffect preset for that stem

## LED behavior
Stem LEDs are updated from:

- stem mute state
- stem quick effect state
- stem count availability

So unavailable stems should stay dark.

---

# Pad FX1 / Pad FX2 Modes

These are custom effect control layers.

## General layout
For both Pad FX modes:

- Pad 1 -> Slot 1 enable
- Pad 2 -> Slot 2 enable
- Pad 3 -> Slot 3 enable
- Pad 4 -> Unit enable
- Pad 5 -> Route FX to own deck
- Pad 6 -> Route FX to other deck
- Pad 7 -> unused
- Pad 8 -> toggle all slots on/off

## Pad FX1
- Deck 1 controls EffectUnit1
- Deck 2 controls EffectUnit2

## Pad FX2
- Deck 1 controls EffectUnit3
- Deck 2 controls EffectUnit4

## LED logic
LEDs are script-synchronized and reflect:

- slot enabled state
- unit enabled state
- routing state
- all-on state

The script also auto-arms routing when needed so active slots do not silently do nothing.

---

# Beat Loop Mode

## Pads 1–8
Per deck:

1. 1/4 beat loop
2. 1/2 beat loop
3. 1 beat loop
4. 2 beat loop
5. 4 beat loop
6. 8 beat loop
7. 16 beat loop
8. 32 beat loop

These are direct Mixxx beatloop toggle actions.

---

# Beat Jump Mode

## Pads 1–8
Per deck:

1. beatjump 1 backward
2. beatjump 1 forward
3. beatjump 2 backward
4. beatjump 2 forward
5. beatjump 4 backward
6. beatjump 4 forward
7. beatjump 32 backward
8. beatjump 32 forward

This mode is intentionally practical rather than symmetric in tiny increments.

---

# Sampler Mode

This mapping uses 16 samplers.

## Left side sampler pads
Left deck pad layout maps to:

- Pads 1–4 -> Sampler 1–4
- Pads 5–8 -> Sampler 9–12

## Right side sampler pads
Right deck pad layout maps to:

- Pads 1–4 -> Sampler 5–8
- Pads 5–8 -> Sampler 13–16

## Normal press
- If sample loaded:
  - play / cue_gotoandplay
- If no sample loaded:
  - load selected track into sampler

## Long press
- Stop currently playing sampler

## Shift + pad
- If sample is playing:
  - stop playback
- If sample is loaded but not playing:
  - eject sample

## Sampler LED behavior
Script-controlled:

- off -> no sample loaded
- solid -> sample loaded, not playing
- blinking -> sample playing

---

# Key Shift Mode

This mode is implemented as direct semitone selection via `pitch_adjust`.

## Current semitone layout
The script maps pads to semitone offsets in a custom way.

Current mapping in script:

- Pad 1 -> +4
- Pad 2 -> +5
- Pad 3 -> +6
- Pad 4 -> +7
- Pad 5 -> 0
- Pad 6 -> +1
- Pad 7 -> +2
- Pad 8 -> +3

This is script-defined behavior and takes precedence over older XML descriptions if they conflict.

## Shift layer
Currently intentionally left empty / not implemented for additional pitch-bank logic.

That means:

- normal layer works
- shift layer is reserved for future extension

---

# LEDs and Visual Feedback

## Transport LEDs
Script aims for engine-driven feedback instead of controller-side assumptions.

## Loop LEDs
Loop LEDs are centrally managed and depend on:

- track loaded state
- loop active state
- loop adjust state
- pending loop-out state

## Sampler LEDs
Sampler LEDs use an explicit off / solid / blink state machine.

## Pad FX LEDs
Pad FX LEDs reflect actual engine state:

- slot on/off
- unit on/off
- routing on/off

## Stem LEDs
Stem LEDs reflect:

- mute status
- quick effect status
- stem count availability

## VU meters
VU meters are script-managed and include peak latch behavior.

---

# Configurable Script Options

Some important behavior is controlled in the script.

Examples include:

- `BROWSE_FOCUS_TOGGLE_ONLY`
- `BROWSE_LONGPRESS_MS`
- `SAMPLER_LONGPRESS_MS`
- `QUANTIZE_LONGPRESS_MS`
- `LOOP_ADJUST_MODE`
- `loopAdjustStepBeats`
- `reloopExitBeats`
- `loopAdjustTimeoutMs`
- `quickJumpSize`
- `fastSeekScale`
- `bendScale`
- `loopAdjustMultiply`
- `STEMS_PAD5_8_MODE`
- `PLAY_BRAKE_ON_VINYL`

Users should check the script header and config section for exact current defaults.

---

# Known Differences from Rekordbox / Stock Pioneer Expectations

This mapping does not try to fake unsupported engine behavior.

Examples:

- Sync short press is not a persistent Beat Sync mode
- Some LED behavior is based on Mixxx engine states, not Rekordbox states
- Keyboard mode is repurposed as STEMS mode
- Pad FX modes are custom and not stock Pioneer functions
- Optional Vinyl brake behavior is custom and configurable

---

# Contributor Notes

When changing control behavior:

1. update the XML if MIDI binding changes
2. update the script if logic changes
3. update this file if user-visible behavior changes
4. do not document imagined behavior — document actual current behavior

If XML labels and script behavior conflict, the script is the source of truth.

---
