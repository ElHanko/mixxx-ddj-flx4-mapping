# Pioneer DDJ-FLX4 (Custom) — Controller Reference

This file documents the current control layout and behavior of the custom Mixxx mapping for the Pioneer DDJ-FLX4.

It is intended as a practical reference for users and contributors.

## Scope

This mapping is not the stock Mixxx mapping. Several behaviors were intentionally changed to provide:

* more predictable transport behavior
* stronger LED consistency
* clearer loop handling
* more useful pad modes
* Pioneer-like workflow where possible
* improved behavior where Mixxx defaults are limited

Some functions are configurable in the script. Where relevant, this document notes that behavior may depend on script options.

---

# Global Notes

## Shift behavior

Each deck has its own Shift button. Shift modifies transport, loop, pad, browser, and sync behavior depending on the section.

## Vinyl mode

Vinyl mode is handled per deck and changes jog behavior.
It is toggled in this mapping with:

* **Shift + 4BEAT/EXIT**

Depending on script configuration, Vinyl mode can optionally change PLAY button behavior to vinyl brake / soft-start transport.

## Sync behavior

This mapping follows current Mixxx behavior:

* **Short press Sync** = one-shot beat sync
* **Long press Sync** = toggle sync lock (`sync_enabled`)

This is not Rekordbox-style persistent Beat Sync mode.
The mapping cannot provide that behavior unless Mixxx exposes it as an engine state.

---

# Browser / Library Section

## Browse encoder

### Rotate

* Scroll library vertically

### Press

Handled by script.

Depending on configuration:

* default Mixxx focus behavior
* or toggle only between sidebar/tree and track table

## Shift + Browse encoder rotate

* Zoom waveform on both decks

## Load buttons

### LOAD

* Load selected track to the deck
* Double press:

  * Instant doubles / clone from the other deck

### Shift + LOAD (Deck 1)

* Toggle maximize/minimize library

### Shift + LOAD (Deck 2)

* Move right / open folder in library tree

---

# Transport Section

## Play / Pause

### Normal

* Play / Pause

### Optional Vinyl Brake Mode (script option)

* stopped deck + Play → soft start
* playing deck + Play → brake
* press again during brake → cancel and resume

## Shift + Play

* `reverseroll`
* Reverse playback in slip mode while held

## Cue

### Normal

* `cue_default`

### Shift + Cue

* `start_stop`

---

# Sync / Tempo Section

## Sync

### Short press

* `beatsync` (one-shot)

### Long press

* `sync_enabled` (persistent sync lock)

## Shift + Sync

* Cycle tempo range

Ranges:

* ±8%
* ±16%
* ±32%
* ±64%
* ±100%

## Tempo fader

* 14-bit high-resolution tempo control

---

# Jog Wheels

## Platter rotate

### Vinyl ON

* Scratch

### Vinyl OFF

* Pitch bend

## Platter touch

* stopped deck → scratch
* vinyl ON → scratch
* otherwise → bend

## Shift + platter rotate

* Fast seek / accelerated bend

## Loop-adjust priority

When loop-adjust mode is active, jog controls loop editing instead of scratch/bend.

---

# Loop Section

## LOOP IN / LOOP OUT

Script-driven behavior depending on mode:

### Simple mode

* basic loop in/out

### Advanced mode

* guided loop workflow
* pending loop state
* jog-based adjustment

## 4BEAT/EXIT

* toggle / re-enable loop
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

## Loop adjust modes

### `simple`

* Mixxx-like behavior
* adjust only when loop is active

### `advanced`

* guided workflow
* loop creation + adjustment
* optional timeout

---

# Mixer Section

## EQ / Gain / Faders

* standard high-resolution controls

## Headphone Cue buttons

* toggle PFL

## Quantize / Keylock

Mapped to **Shift + Channel Cue buttons**

### Short press

* Quantize toggle

### Long press

* Keylock toggle

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

This mapping uses a **banked hotcue system**.

## Hotcue banks

Default:

* 4 banks
* 8 hotcues per bank
* total: Hotcue 1–32

Mapping:

* Bank 1 → Hotcue 1–8
* Bank 2 → Hotcue 9–16
* Bank 3 → Hotcue 17–24
* Bank 4 → Hotcue 25–32

## Bank switching

* Press HOT CUE mode again → next bank

Short LED feedback indicates current bank.

## Pads 1–8

### Normal press

* empty → set hotcue
* existing + playing → jump
* existing + stopped → optional preview

### Shift + Pads

* clear hotcue

## Preview-on-hold (optional)

* press → play from cue
* release → stop + return

## LED behavior

* active → solid
* empty → off
* saved loop → blinking

---

# STEMS Mode (Keyboard Mode)

## Pads 1–4

* toggle stem mute

### Shift

* solo

## Pads 5–8

Depends on config:

### solo mode

* momentary solo / mute

### fx mode

* stem FX

---

# Pad FX Modes

## Layout

* Pads 1–3 → slots
* Pad 4 → unit
* Pad 5–6 → routing
* Pad 8 → toggle all

## Units

* FX1 → Unit1/2
* FX2 → Unit3/4

---

# Beat Loop Mode

Pads:

* 1/4 → 32 beats

---

# Beat Jump Mode

Pads:

* ±1 / ±2 / ±4 / ±32 beats

---

# Sampler Mode

## Layout

* 16 samplers

## Behavior

* press → play/load
* long press → stop
* shift → stop/eject

## LEDs

* off / solid / blinking

---

# Key Shift Mode

Pads control semitone offsets:

* script-defined mapping

Shift layer reserved.

---

# LEDs and Visual Feedback

## General

All LEDs are script-driven.

## Hotcue LEDs

* reflect active bank
* saved loops blink

## Loop LEDs

* reflect loop state + adjust state

## Sampler LEDs

* off / solid / blink

## Pad FX LEDs

* reflect slot / routing / unit state

## Stem LEDs

* reflect mute / FX / availability

## VU meters

* peak hold + scaling

---

# Configurable Script Options

Examples:

* `BROWSE_FOCUS_TOGGLE_ONLY`
* `BROWSE_LONGPRESS_MS`
* `SAMPLER_LONGPRESS_MS`
* `QUANTIZE_LONGPRESS_MS`
* `LOOP_ADJUST_MODE`
* `loopAdjustStepBeats`
* `reloopExitBeats`
* `loopAdjustTimeoutMs`
* `quickJumpSize`
* `fastSeekScale`
* `bendScale`
* `loopAdjustMultiply`
* `STEMS_PAD5_8_MODE`
* `PLAY_BRAKE_ON_VINYL`
* `hotcueBankCount`
* `HOTCUE_PREVIEW_ON_HOLD`

---

# Known Differences

* No persistent Beat Sync mode
* LED behavior follows Mixxx engine, not Rekordbox
* Keyboard mode repurposed
* Pad FX custom
* Vinyl brake optional

---

# Contributor Notes

When changing behavior:

1. update XML
2. update script
3. update this file
4. document actual behavior only

Script overrides XML if conflicts exist.
