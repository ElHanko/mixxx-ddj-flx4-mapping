# Pioneer DDJ-FLX4 Custom Mapping — Controls

This document describes the **user-visible controller behavior** of the custom Mixxx mapping.

The JavaScript mapping script is the authoritative source of truth.

If XML descriptions differ from the script, the script behavior takes precedence.

---

# Browser / Library

## Browse encoder

Rotate  
• Scroll library vertically

Shift + rotate  
• Zoom waveform on both decks

Press  
• Toggle focus between library tree and track table

Shift + press  
• Currently unused

---

## Load buttons

Load  
• Load selected track into the deck

Double press  
• Instant double (clone track from the opposite deck)

Shift + Load (Deck 1)  
• Toggle maximize / minimize library

Shift + Load (Deck 2)  
• Expand folder / MoveRight in library tree

---

# Transport

## Play / Pause

Default  
• Standard Mixxx play / pause

Shift + Play  
• Reverse roll (censor)

Optional behavior exists where Play acts like a vinyl start/stop when Vinyl mode is active.

---

## Cue

Cue  
• Standard cue_default

Shift + Cue  
• Jump to track start (start_stop)

---

# Sync

Short press  
• One-shot beat sync

Long press  
• Toggle sync lock

Shift + Sync  
• Cycle tempo range

Tempo ranges cycle:

• ±8%  
• ±16%  
• ±32%  
• ±64%  
• ±100%

---

# Jog Wheels

## Platter rotate

Vinyl mode ON  
• Scratch

Vinyl mode OFF  
• Pitch bend

Side ring  
• Pitch bend

Shift + rotate  
• Fast search

---

## Platter touch

Touch behavior is script controlled.

Touching the platter:

• Deck stopped → scratch  
• Vinyl mode active → scratch  
• Otherwise → pitch bend

Releasing the platter disables scratch.

---

## Shift + platter touch

Activates **seek scratch mode**.

Jog rotation behaves like fast track seeking.

---

# Vinyl Mode

Vinyl mode is toggled per deck with:

Shift + 4BEAT / EXIT

When enabled:

• jog touch enables scratching while playing  
• jog rotation behaves like a vinyl platter

---

# Tempo Fader

High-resolution 14-bit tempo control.

---

# Loop Section

## Loop In

Sets loop in point.

Pending loop-out state is indicated via LED behavior.

---

## Loop Out

Sets loop out point and activates loop.

---

## 4BEAT / EXIT

If loop active  
• exit loop

If loop inactive  
• reloop previous loop if available  
• otherwise create default loop

---

## Shift + 4BEAT / EXIT

Toggle Vinyl mode.

---

## Cue / Loop Call

Left  
• halve active loop

Right  
• double active loop

Shift + Left  
• quick jump backward

Shift + Right  
• quick jump forward

---

# Mixer

## Channel faders
Standard deck volume control.

## Crossfader
Standard Mixxx crossfader.

## Trim
Pregain control.

## EQ

Three band EQ:

• High  
• Mid  
• Low

---

## Headphone Cue

Toggle deck PFL.

---

# Quantize / Keylock

Mixer cue buttons use custom behavior:

Short press  
• toggle quantize

Long press  
• toggle keylock

---

# Smart CFX

Smart CFX button:

Press  
• Toggle QuickEffectRack

Shift + press  
• Cycle QuickEffect preset

---

# Beat FX

## Channel selectors

CH1 → Deck 1 FX  
CH2 → Deck 2 FX

Both selected → both decks.

---

## Beat Left / Right

Cycle effect chain preset.

---

## Level / Depth knob

Normal  
• Control effect parameter (super1)

Shift  
• Control effect mix

---

## Beat FX On / Off

Press  
• Toggle all FX slots

Shift + press  
• Turn FX off

---

# Pad Modes

Pad mode buttons select:

• Hot Cue  
• Keyboard (STEMS)  
• Pad FX1  
• Pad FX2  
• Beat Jump  
• Beat Loop  
• Sampler  
• Key Shift

---

# Hot Cue Mode

Pads 1-8  
• Trigger / set hot cues

Shift + pads  
• Clear hot cues

---

# Keyboard Mode (STEMS)

Pads 1-4  
• Toggle stem mute

Shift + pads  
• Solo stem

Pads 5-8  
• Stem solo / momentary mute depending on configuration

---

# Pad FX Modes

Pad FX modes control Mixxx effect units.

Pad layout:

Pad1 → slot1  
Pad2 → slot2  
Pad3 → slot3  
Pad4 → unit enable  
Pad5 → route FX to own deck  
Pad6 → route FX to opposite deck  
Pad7 → unused  
Pad8 → toggle all slots

Shift pads currently mirror normal pads.

---

# Beat Jump Mode

Pads:

1 beat back  
1 beat forward  
2 beat back  
2 beat forward  
4 beat back  
4 beat forward  
32 beat back  
32 beat forward

---

# Beat Loop Mode

Pads:

¼ beat  
½ beat  
1 beat  
2 beat  
4 beat  
8 beat  
16 beat  
32 beat

---

# Sampler Mode

16 samplers are used.

Short press  
• play sample

Long press  
• stop sample

Shift + pad  
• stop or eject sample

LED states:

off → empty  
solid → loaded  
blink → playing

---

# Key Shift Mode

Pads select fixed pitch offsets.

Current mapping:

Pad1 → +4  
Pad2 → +5  
Pad3 → +6  
Pad4 → +7  
Pad5 → 0  
Pad6 → +1  
Pad7 → +2  
Pad8 → +3

Shift layer currently unused.
