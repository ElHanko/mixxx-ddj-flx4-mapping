# Pioneer DDJ-FLX4 (Custom) — Controller Reference

This file documents the current control layout and behavior of the custom Mixxx mapping for the Pioneer DDJ-FLX4.

It is intended as a practical reference for users and contributors.

---

## Scope

This mapping is not the stock Mixxx mapping. Several behaviors were intentionally changed to provide:

* more predictable transport behavior
* consistent LED feedback driven by engine state
* explicit loop workflows
* extended pad functionality
* improved behavior where Mixxx defaults are limited

Some functions are configurable in the script. Where relevant, this document notes that behavior may depend on script options.

---

# Global Notes

## Shift behavior

Each deck has its own Shift button. Shift modifies transport, loop, pad, browser, and sync behavior depending on the section.

## Vinyl mode

Vinyl mode is handled per deck and affects jog behavior.

Toggle:

* **Shift + 4BEAT/EXIT**

Vinyl mode is also inferred from controller MIDI state and not treated as a purely internal flag.

Depending on script configuration, Vinyl mode can optionally modify PLAY button behavior (brake / soft start).

## Sync behavior

This mapping follows Mixxx engine behavior:

* **Short press Sync** → one-shot beat alignment (`beatsync`)
* **Long press Sync** → persistent sync lock (`sync_enabled`)

This is not a Rekordbox-style Beat Sync mode.
Such a mode does not exist in Mixxx and cannot be emulated reliably.

---

# Browser / Library Section

## Browse encoder

### Rotate

* Scroll library vertically

### Press

Script-controlled.

Depending on configuration:

* default Mixxx focus behavior
* or toggle between sidebar and track table only

## Shift + Browse rotate

* Zoom waveform (both decks)

## Load buttons

### LOAD

* Load selected track
* Double press (timing-based):

  * Instant double from opposite deck

### Shift + LOAD

* Deck 1 → toggle library maximize
* Deck 2 → navigate / open folder

---

# Transport Section

## Play / Pause

### Normal

* Play / Pause

### Optional Vinyl Brake Mode (script option)

If enabled:

* stopped deck → soft start
* playing deck → brake
* during brake → cancel and resume

## Shift + Play

* `reverseroll` (momentary slip reverse)

## Cue

### Normal

* `cue_default`

### Shift + Cue

* `start_stop`

---

# Sync / Tempo Section

## Sync

### Short press

* `beatsync`

### Long press

* `sync_enabled`

## Shift + Sync

* Cycle tempo range:

* ±8% → ±16% → ±32% → ±64% → ±100%

## Tempo fader

* 14-bit high-resolution mapping

---

# Jog Wheels

## Platter rotate

### Vinyl ON

* Scratch

### Vinyl OFF

* Pitch bend

## Platter touch

Scratch is enabled if:

* deck is stopped
* or Vinyl mode is active

Otherwise:

* bend mode

## Controller vinyl state

The script tracks the controller’s internal vinyl mode and uses it as input for scratch decisions.

## Shift + platter rotate

* Fast seek / accelerated bend

## Loop-adjust priority

When loop-adjust mode is active:

* jog controls loop point editing
* scratch/bend is suppressed

---

# Loop Section

## LOOP IN / LOOP OUT

Script-controlled behavior.

### `simple` mode

* direct loop in/out

### `workflow` mode

* guided loop creation
* pending loop-out state
* jog-based adjustment
* explicit state tracking

## 4BEAT/EXIT

* exit / re-enable loop
* fallback: create default loop

## Shift + 4BEAT/EXIT

* Toggle Vinyl mode

## Loop adjust

* Shift + LOOP IN / OUT → jog adjusts loop points

## CUE/LOOP CALL LEFT

### Normal

* halve loop or fallback reloop

### Shift

* quick jump backward

## CUE/LOOP CALL RIGHT

### Normal

* double loop or fallback reloop

### Shift

* quick jump forward

---

# Mixer Section

## EQ / Gain / Faders

* standard high-resolution mapping

## Headphone Cue buttons

* toggle PFL

## Quantize / Keylock

Mapped to **Shift + Channel Cue buttons**

### Short press

* Quantize toggle

### Long press

* Keylock toggle

---

# Beat FX Section

## FX SELECT

* Cycle FX groups
* Shift → cycle backward

## BEAT LEFT / RIGHT

* Cycle variants within current group

## ON/OFF

* toggle all slots
* partial state → reset

## Routing

* Unit1 → Deck1
* Unit2 → Deck2

## LEVEL/DEPTH

* 14-bit control

---

# Color FX / Smart CFX

## Smart CFX button

* Toggle QuickEffect

## Shift + Smart CFX

* Cycle QuickEffect preset

## Filter knobs

* 14-bit control
* optional response shaping around center

---

# Pad Modes

## Hot Cue Mode

* Banked hotcue system (see below)

## Keyboard Mode

* repurposed as STEMS

## Pad FX1 / Pad FX2

* custom FX layers

## Beat Jump / Beat Loop

* direct mappings

## Sampler Mode

* trigger / stop / eject

## Key Shift Mode

* semitone pitch control

---

# Hot Cue Mode

## Banks

* Default: 4 banks × 8 hotcues (1–32)

## Bank switching

* Press HOT CUE mode again → next bank

## Bank LED feedback

Short visual feedback indicates active bank:

* Bank 1 → all pads flash
* Bank 2 → first 2 pads flash
* Bank 3 → first 3 pads flash
* Bank 4 → first 4 pads flash

## Pads

### Normal

* empty → set
* playing → jump
* stopped → optional preview

### Shift

* clear

## Preview-on-hold (optional)

* press → play from cue
* release → stop + return

## LED behavior

* active → solid
* empty → off
* saved loop → blinking

---

# STEMS Mode

## Pads 1–4

* mute toggle

### Shift

* isolate

## Pads 5–8

Configurable:

### solo

* momentary solo / mute

### fx

* stem FX control

---

# Sampler Mode

## Layout

* 16 samplers

## Behavior

* press → play / load
* long press → stop
* shift → stop / eject

## LEDs

* off / solid / blinking

---

# Key Shift Mode

Pads map to semitone offsets (script-defined).

Shift layer reserved.

---

# LEDs and Visual Feedback

## General

All LEDs are script-driven and follow Mixxx engine state.

## Hotcues

* active bank only
* saved loops blink

## Loop

* loop state + adjust state

## Sampler

* explicit state machine

## Pad FX

* slot / unit / routing state

## STEMS

* mute / FX / availability

## VU meters

* peak hold

---

# Configurable Script Options

Examples:

* `BROWSE_FOCUS_TOGGLE_ONLY`
* `BROWSE_LONGPRESS_MS`
* `SAMPLER_LONGPRESS_MS`
* `QUANTIZE_LONGPRESS_MS`
* `LOOP_ADJUST_MODE`
* `loopAdjustStepBeats`
* `loopAdjustTimeoutMs`
* `STEMS_PAD5_8_MODE`
* `PLAY_BRAKE_ON_VINYL`
* `hotcueBankCount`
* `HOTCUE_PREVIEW_ON_HOLD`

---

# Known Differences

* No persistent Beat Sync mode
* Engine-driven LED behavior
* Custom pad layers
* Optional vinyl brake behavior

---

# Contributor Notes

When changing behavior:

1. update XML
2. update script
3. update this file
4. document actual behavior only

Script overrides XML if conflicts exist.