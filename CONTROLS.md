# Pioneer DDJ-FLX4 — Basic and optional Extended controls

This file documents the Basic mapping for Mixxx 2.6. Basic works on its own and
does not require the supplied custom effect chains. The optional Extended
overlay changes only the controls listed in the Extended section below.

It is intended as a practical reference for users and contributors.

---

## Scope

The XML loads `Pioneer-DDJ-FLX4-2.0.script.js` (Basic). The tested transport,
hotcue banking, jog decoding, loop workflow and TRIM/CFX guard remain shared.
Some functions depend on script options; see `CONFIGURATION.md`.

Extended is activated manually by loading `Pioneer-DDJ-FLX4-extended-scripts.js`
after Basic with `functionprefix=""`. See [the activation instructions](README.md#enable-extended-manually-advanced--developer-setup).
The supplied XML keeps Basic alone as the default.

---

# Global Notes

## Shift behavior

Each deck has its own Shift button. Shift modifies transport, loop, pad, browser, sync, and mixer behavior depending on the section.

## Jog / Vinyl behavior

Basic uses platter touch for scratch and the wheel side for pitch bend, including
while playing. It does not send a Vinyl reset at startup. SHIFT + 4BEAT/EXIT
has no Basic action. Extended starts with Vinyl OFF. Extended Vinyl Toggle
currently has no controller binding; a new binding remains an open design decision.

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

* Load selected track after the 400 ms double-press window expires
* Double press within 400 ms (`LOAD_DOUBLEPRESS_MS`):

  * Instant double from opposite deck

### Shift + LOAD

* Deck 1 → toggle library maximize
* Deck 2 → navigate / open folder

---

# Transport Section

## Play / Pause

### Normal

* Play / Pause

While a Hot Cue preview is held, PLAY commits it to normal playback. Releasing
the pad afterwards does not stop playback. Brake/soft-start is available only
in Extended.

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

* Basic: ±6% → ±10% → ±16% → ±25%
* Extended: ±8% → ±16% → ±32% → ±64% → ±100%

## Tempo fader

* 14-bit high-resolution mapping

---

# Jog Wheels

## Platter rotate / touch

* Basic: touch enables scratch; the wheel side always bends pitch.
* Extended: touch scratches while stopped or while that deck's Vinyl mode is ON;
  while playing with Vinyl OFF, platter movement bends pitch.
* Touch release disables scratch with the existing ramp behavior.
* Both controller platter CCs remain supported; post-release Vinyl-ON jitter is
  filtered as before.

## Shift + platter rotate

* Search directly through the track position

## Shift + platter touch

* Increase Shift + platter search speed while held

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

* No active loop → start a new four-beat loop at the current playback position.
* Active loop → exit.
* An old inactive loop is never reactivated by this button.

This normal-button behavior is shared by Basic and Extended.

## Shift + 4BEAT/EXIT

* Basic: no action. Rekordbox Active Loop arm/disarm is not implemented.
* Extended: CDJ-style Reloop/Exit via Mixxx `reloop_toggle`: exit an active loop,
  reactivate the same stored inactive loop, or do nothing if no loop exists.
  It does not create a new four-beat loop.

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

### Gain
* script-controlled high-resolution TRIM with CFX guard and pickup
* CFX movement locks TRIM for 2000 ms; TRIM then requires pickup within 2%
* after 1000 ms without accepted TRIM input, pickup is required again

### Channel faders
* standard mapping

### EQ knobs
* 14-bit high-resolution mapping
* script-controlled routing

#### Normal
* control deck EQ:
  * **LOW** → EQ low
  * **MID** → EQ mid
  * **HIGH** → EQ high

#### Shift

Basic continues to control ordinary EQ. Extended adds stem-volume routing with
separate EQ/stem pickup; see the optional Extended section.

## Headphone Cue buttons

* toggle PFL

## Shift + Channel Cue

* Basic: tap the deck's BPM (`bpm_tap`), with no hold timer.
* Extended: short press toggles Quantize; hold for 350 ms toggles Keylock.

---

# Basic Beat FX

Uses Mixxx EffectUnit1 and the user's existing effects. Startup shows the effect
focus and enables standard soft takeover; it does not load custom presets or
change routing. The controller position query supplies the channel selector.

| Control | Basic action |
| --- | --- |
| FX SELECT | Load next effect in the focused slot |
| SHIFT + FX SELECT | Load previous effect |
| BEAT LEFT / RIGHT | Move focus between slots 1–3 |
| ON/OFF | Toggle focused slot |
| SHIFT + ON/OFF | Disable all three slots and set unit mix to zero |
| LEVEL/DEPTH | Unit mix (official 2.6 7-bit behavior) |
| SHIFT + LEVEL/DEPTH | Focused slot meta parameter |
| Channel selector | Route Unit1 to Deck1, Deck2, or both |

Basic needs no project-specific chain names or preset order. Custom dual-unit
Beat FX is optional Extended behavior described below.

---

# Color FX / Smart CFX

## Smart CFX button

* Toggle QuickEffect

## Shift + Smart CFX

* Cycle QuickEffect preset

## Filter knobs

* 14-bit control
* optional response shaping around center
* linear response by default (`fxTuning.shapedFilterKnob = false`)

---

# Pad Modes

## Hot Cue Mode

* Banked hotcue system (see below)

## Keyboard Mode

* Basic: Hotcue Pitch Play (SHIFT + HOT CUE); every entry begins with Hotcue selection.
* Extended: STEMS instead of Keyboard/Pitch Play (SHIFT + HOT CUE).

## Pad FX1 / Pad FX2

* Basic: not implemented; pads stay dark and perform no effect action.
* Extended: the previous custom FX layers.

## Beat Jump / Beat Loop

* direct mappings

## Sampler Mode

* start/restart loaded samples; SHIFT stops or loads a selected track

## Key Shift Mode

* semitone pitch control

---

# Hot Cue Mode

## Banks

* Default: 4 banks × 8 hotcues (1–32)

## Bank switching

* Press HOT CUE mode again → next bank
* an active held preview stops and returns to its starting hotcue before switching banks

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
* stopped → configurable behavior:
  * `preview` → play while held; stop and return on release
  * `goto` → jump to hotcue and remain stopped
  * `play` → jump to hotcue and continue playing

### Shift

* clear

## Stopped-deck behavior

Controlled by `HOTCUE_STOPPED_MODE`.

Available modes:

* `preview` → play from the hotcue while the pad is held; stop and return on release
* `goto` → jump to the hotcue and remain stopped
* `play` → jump to the hotcue and continue playing

Default: `preview`

Leaving Hot Cue mode also stops an active held preview and returns to its
starting hotcue.

## LED behavior

* active → solid
* empty → off
* saved loop → blinking

---

# Keyboard Pitch Play (Basic)

1. Press SHIFT + HOT CUE to enter Keyboard mode. Every entry begins with Hotcue
   selection; available hotcues in the current bank light up.
2. Press a lit pad to select its hotcue. This selection press does not play it.
3. Play the chosen hotcue at the pitches below. A stopped deck previews while
   held and stops on release; a playing deck jumps using native Mixxx hotcue
   activation.
4. SHIFT + any pad selects another existing hotcue in the current bank.

Pressing SHIFT + HOT CUE again while already in Keyboard also returns to Hotcue
selection. Pitch Play becomes available only after selecting a hotcue. Leaving
Keyboard or returning to selection releases a held Keyboard hotcue. Loading
another track also clears the selection.

Empty pads do not create hotcues. Keyboard uses the current Hot Cue bank; switch
banks in Hot Cue mode first to select hotcues 9–32.

| Pad | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Semitone offset | +4 | +5 | +6 | +7 | 0 | +1 | +2 | +3 |

SHIFT + Pads 7/8 also select hotcues; range shifting is not implemented. Pitch
changes use Mixxx's deck pitch adjustment and remain after leaving Keyboard.

---

# Sampler Mode

## Layout

* 16 samplers

## Behavior

* press → start/restart a loaded sample from the beginning of the track
* normal press on an empty pad → no action
* SHIFT + playing pad → stop
* SHIFT + stopped/empty pad → load the selected library track (replaces a stopped sample)
* release → no additional action

There is no sampler long-press action or hold timer, in either variant.

## LEDs

* off / solid / blinking

---

# Key Shift Mode

| Pad | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Semitone offset | +4 | +5 | +6 | +7 | 0 | +1 | +2 | +3 |

Shift layer reserved (no action).

---

# LEDs and Visual Feedback

## General

LED feedback follows Mixxx engine state. Transport, PFL and Sync use native
XML outputs; mode, hotcue, loop, sampler and effect feedback also use the
existing script callbacks.

## Hotcues

* active bank only
* saved loops blink

## Loop

* loop state + adjust state

## Sampler

* explicit state machine

## Pad FX (Extended only)

* slot / unit / routing state

## STEMS (Extended only)

* mute / FX / availability

## VU meters

* peak hold

---

# Optional Extended controls

Extended reuses Basic for controls not listed here, including Hotcue preview
and its PLAY commit, Key Shift, Sampler, Instant Doubles, Browse and normal loops.

## Keyboard → STEMS

SHIFT + HOT CUE opens Stems instead of Basic's Keyboard/Pitch Play.

### Pads 1–4

* mute toggle

### Shift

* isolate

### Pads 5–8

Configurable:

### solo

* default mode
* held pad → momentary solo; Shift + held pad → momentary hold-mute
* release restores the previous mute state
* the first held pad owns the action; additional momentary presses are ignored
  until its matching release

### fx

* stem FX control


## SHIFT + EQ → Stem volume

* LOW → drums + bass; MID → melody/instruments; HIGH → vocals.
* Assignments use `stemIndexMap`; verify the stem order of your tracks.
* Each deck has separate EQ/stem pickup state, reset on mode changes (2% window).

## SHIFT + 4BEAT/EXIT

* CDJ-style Reloop/Exit via Mixxx `reloop_toggle`.
* Active loop → exit; stored inactive loop → reloop the same loop.
* No previous loop → no new loop is created.

## Vinyl / PLAY

* Extended Vinyl Toggle currently has no controller binding; a new binding
  remains an open design decision.
* The existing Brake/SoftStart code remains available and requires Vinyl ON.
* `PLAY_BRAKE_ON_VINYL` defaults to false.
* When enabled with Vinyl ON: stopped → soft start; playing → brake;
  press during brake → cancel and resume.
* PLAY still commits a held Hotcue preview using Basic's implementation.

## SHIFT + Channel Cue

* Short press → Quantize toggle.
* Hold for 350 ms (`QUANTIZE_LONGPRESS_MS`) → Keylock toggle.
* The release after a long press does not toggle Quantize.

## Custom Beat FX

* FX SELECT cycles groups (SHIFT cycles backwards).
* BEAT LEFT/RIGHT selects variants within a group.
* ON/OFF toggles the selected units and all their slots; a partial ON state is
  switched fully OFF. SHIFT + ON/OFF disables the selected targets.
* Unit1 → Deck1, Unit2 → Deck2; the selector chooses the active target(s).
* LEVEL/DEPTH is 14-bit: `super1`; SHIFT controls unit mix.
* Extended initializes the custom presets and dual routing at startup.

This preserves the current preset-position requirement: all supplied chains
`01_` through `14_` must keep their sorted positions. Extra presets or renamed/
missing chains can select a different effect. Manual GUI preset changes can
also desynchronize the remembered group/variant; robust name-based selection
remains a separate design point.

## Pad FX1 / Pad FX2

Pad FX1 uses Unit1/2; Pad FX2 uses Unit3/4 for Deck1/2 respectively.

| Pads | Action |
| --- | --- |
| 1–3 | Toggle effect slots 1–3; turning a slot ON arms its unit and own-deck route |
| 4 | Toggle unit enabled |
| 5 | Toggle own-deck routing |
| 6 | Toggle other-deck routing |
| 7 | No action |
| 8 | Toggle unit and all slots |

Normal and SHIFT layers share these Pad FX actions. Turning a slot OFF does not
re-enable a manually disabled unit or route. Units 1/2 are shared with Extended
Beat FX, as before.

## Shutdown

Extended restores a held Stem solo/hold-mute, stops brake/soft-start and its
watchers, cancels Quantize/Keylock hold timers and disconnects its added engine
connections. Basic handles common Hotcue, scratch, load, loop and LED cleanup.

---

# Configurable Script Options

Basic options include `BROWSE_FOCUS_TOGGLE_ONLY`, `LOOP_ADJUST_MODE`,
`loopAdjustStepBeats`, `loopAdjustTimeoutMs`, `hotcueBankCount` and
`HOTCUE_STOPPED_MODE`.

Extended options include `STEMS_PAD5_8_MODE`, `stemIndexMap`,
`eqStemPickupThreshold`, `PLAY_BRAKE_ON_VINYL`, `vinylFx`,
`QUANTIZE_LONGPRESS_MS` and the custom Beat FX knob curves.

---

# Remaining differences

* SHIFT + CUE/LOOP CALL retains 32-beat quick jumps, not Memory Cue navigation.
* Active Loop arm/disarm and Keyboard range shifting are not implemented.
* PAD FX1 / PAD FX2 are unavailable in Basic; Smart Fader is not implemented.
* Sync retains the existing one-shot / persistent-lock Mixxx workflow.
* Extended Beat FX retains its fixed preset-order and GUI-state limitations.
* Extended Vinyl Toggle still needs a controller binding.

---

# Contributor Notes

When changing behavior:

1. update XML
2. update script
3. update this file
4. document actual behavior only

The XML routes controls to Basic handlers; Extended overrides only its defined hooks.
