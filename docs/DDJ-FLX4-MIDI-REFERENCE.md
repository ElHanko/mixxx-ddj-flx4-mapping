# DDJ-FLX4 MIDI Reference

Source: Pioneer DJ DDJ-FLX4, **List of MIDI messages**, Version 1.0,
© 2022 AlphaTheta Corporation (PDF pages 1–5).

The PDF is the original source and is not included in this repository.
This Markdown file is a technical transcription/reference for mapping development.
It contains hardware messages and source conditions only.

## Notation

- Hexadecimal bytes use `0x90`, `0x0B`, etc. Each message is shown as
  **Status Data1 Data2**. `hh` denotes the variable Data2 byte in the source.
- MIDI-IN means controller → computer; MIDI-OUT means computer → controller.
- NOTE and CC are the source table's message types. MIDI channels are numbered
  1–16. For example, NOTE status `0x90` uses channel 1; CC status `0xB0`
  also uses channel 1. Data1 is the note or controller number; Data2 is its value.
- For rows marked OFF/ON, OFF=`0x00` and ON=`0x7F`.
- MSB / LSB are the most/least significant 7-bit bytes of a 14-bit pair;
  the value is `MSB × 128 + LSB` (0–16383). Both CC numbers are listed in
  each pair's details. Endpoint direction is copied from the source.
- Differential values describe change since the previous operation, not an
  absolute position. Jog: clockwise starts at `0x41`, counterclockwise at
  `0x3F`. Browse: clockwise starts at `0x01`, counterclockwise at `0x7F`.
- `—` means not defined/not applicable in the source. It does not establish
  that a message is physically unsupported. Normal and Shift rows are separate.
- The PDF's MIDI-channel, type and hexadecimal-status columns are retained
  separately, including the discrepancies noted below. No missing MIDI-OUT
  address is inferred from an input address.
- `p.` and figure identifiers in Details locate the original PDF entry.

## Source notes

- *1: The MIDI-assign columns also provide decimal numbers and musical note
  names for use with software that uses those notations.
- *2: Vinyl mode cannot be changed on the unit. Change it by sending MIDI-OUT
  from the DJ application. Default: ON.
- *3: Only BEAT SYNC sends its messages when the finger is released, rather
  than when the button is pressed. The trigger labels Press/Long press are
  retained, with this timing condition indicated explicitly.
- *4: FX ON/OFF blinks on receipt of NOTE ON and illuminates steadily on NOTE
  OFF. Its table rows nevertheless contain no explicit MIDI-OUT triplet.

The source has three column discrepancies on page 2: LEVEL/DEPTH lists MIDI
channel 6 alongside Status `0xB4` (channel 5); Shift crossfader-start rows list
channel 7 alongside `0x90`/`0x91` (channels 1/2); CH LEVEL METER is labelled
NOTE although its output statuses are `0xB0`/`0xB1` (CC). These are transcribed
literally and marked on the affected rows; no alternative byte is substituted.

## Deck

| UI / Control | Deck | Trigger | Shift | Mode / Condition | Type | MIDI Ch | Data1 | MIDI-IN | MIDI-OUT | Details |
|---|---:|---|---|---|---|---:|---|---|---|---|
| PLAY/PAUSE | 1 | Press | No | — | NOTE | 1 | `0x0B` | `0x90 0x0B hh` | `0x90 0x0B hh` | p. 1, fig. 1-1. OFF=0x00; ON=0x7F. |
| PLAY/PAUSE | 1 | Press | Yes | — | NOTE | 1 | `0x0E` | `0x90 0x0E hh` | `0x90 0x0E hh` | p. 1, fig. 1-1. OFF=0x00; ON=0x7F. |
| PLAY/PAUSE | 2 | Press | No | — | NOTE | 2 | `0x0B` | `0x91 0x0B hh` | `0x91 0x0B hh` | p. 1, fig. 1-1. OFF=0x00; ON=0x7F. |
| PLAY/PAUSE | 2 | Press | Yes | — | NOTE | 2 | `0x0E` | `0x91 0x0E hh` | `0x91 0x0E hh` | p. 1, fig. 1-1. OFF=0x00; ON=0x7F. |
| CUE | 1 | Press | No | — | NOTE | 1 | `0x0C` | `0x90 0x0C hh` | `0x90 0x0C hh` | p. 1, fig. 1-2. OFF=0x00; ON=0x7F. |
| CUE | 1 | Press | Yes | — | NOTE | 1 | `0x48` | `0x90 0x48 hh` | `0x90 0x48 hh` | p. 1, fig. 1-2. OFF=0x00; ON=0x7F. |
| CUE | 2 | Press | No | — | NOTE | 2 | `0x0C` | `0x91 0x0C hh` | `0x91 0x0C hh` | p. 1, fig. 1-2. OFF=0x00; ON=0x7F. |
| CUE | 2 | Press | Yes | — | NOTE | 2 | `0x48` | `0x91 0x48 hh` | `0x91 0x48 hh` | p. 1, fig. 1-2. OFF=0x00; ON=0x7F. |
| SHIFT | 1 | Press | No | — | NOTE | 1 | `0x3F` | `0x90 0x3F hh` | — | p. 1, fig. 1-3. OFF=0x00; ON=0x7F. |
| SHIFT | 2 | Press | No | — | NOTE | 2 | `0x3F` | `0x91 0x3F hh` | — | p. 1, fig. 1-3. OFF=0x00; ON=0x7F. |
| JOG DIAL (Platter) | 1 | Rotate | No | Vinyl On (*2) | CC | 1 | `0x22` | `0xB0 0x22 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Platter) | 1 | Rotate | No | Vinyl Off (*2) | CC | 1 | `0x23` | `0xB0 0x23 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Platter) | 1 | Rotate | Yes | — | CC | 1 | `0x29` | `0xB0 0x29 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Platter) | 1 | Touch | No | — | NOTE | 1 | `0x36` | `0x90 0x36 hh` | — | p. 1, fig. 1-4. OFF=0x00; ON=0x7F. |
| JOG DIAL (Platter) | 1 | Touch | Yes | — | NOTE | 1 | `0x67` | `0x90 0x67 hh` | — | p. 1, fig. 1-4. OFF=0x00; ON=0x7F. |
| JOG DIAL (Platter) | 2 | Rotate | No | Vinyl On (*2) | CC | 2 | `0x22` | `0xB1 0x22 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Platter) | 2 | Rotate | No | Vinyl Off (*2) | CC | 2 | `0x23` | `0xB1 0x23 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Platter) | 2 | Rotate | Yes | — | CC | 2 | `0x29` | `0xB1 0x29 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Platter) | 2 | Touch | No | — | NOTE | 2 | `0x36` | `0x91 0x36 hh` | — | p. 1, fig. 1-4. OFF=0x00; ON=0x7F. |
| JOG DIAL (Platter) | 2 | Touch | Yes | — | NOTE | 2 | `0x67` | `0x91 0x67 hh` | — | p. 1, fig. 1-4. OFF=0x00; ON=0x7F. |
| JOG DIAL (Wheel side) | 1 | Rotate | No | — | CC | 1 | `0x21` | `0xB0 0x21 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Wheel side) | 1 | Rotate | Yes | — | CC | 1 | `0x21` | `0xB0 0x21 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Wheel side) | 2 | Rotate | No | — | CC | 2 | `0x21` | `0xB1 0x21 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| JOG DIAL (Wheel side) | 2 | Rotate | Yes | — | CC | 2 | `0x21` | `0xB1 0x21 hh` | — | p. 1, fig. 1-4. Differential count from previous operation; clockwise increases from 0x41, counterclockwise decreases from 0x3F. |
| IN | 1 | Press | No | — | NOTE | 1 | `0x10` | `0x90 0x10 hh` | `0x90 0x10 hh` | p. 1, fig. 1-5. OFF=0x00; ON=0x7F. |
| IN | 1 | Press | Yes | — | NOTE | 1 | `0x4C` | `0x90 0x4C hh` | `0x90 0x4C hh` | p. 1, fig. 1-5. OFF=0x00; ON=0x7F. |
| IN | 2 | Press | No | — | NOTE | 2 | `0x10` | `0x91 0x10 hh` | `0x91 0x10 hh` | p. 1, fig. 1-5. OFF=0x00; ON=0x7F. |
| IN | 2 | Press | Yes | — | NOTE | 2 | `0x4C` | `0x91 0x4C hh` | `0x91 0x4C hh` | p. 1, fig. 1-5. OFF=0x00; ON=0x7F. |
| OUT | 1 | Press | No | — | NOTE | 1 | `0x11` | `0x90 0x11 hh` | `0x90 0x11 hh` | p. 1, fig. 1-6. OFF=0x00; ON=0x7F. |
| OUT | 1 | Press | Yes | — | NOTE | 1 | `0x4E` | `0x90 0x4E hh` | `0x90 0x4E hh` | p. 1, fig. 1-6. OFF=0x00; ON=0x7F. |
| OUT | 2 | Press | No | — | NOTE | 2 | `0x11` | `0x91 0x11 hh` | `0x91 0x11 hh` | p. 1, fig. 1-6. OFF=0x00; ON=0x7F. |
| OUT | 2 | Press | Yes | — | NOTE | 2 | `0x4E` | `0x91 0x4E hh` | `0x91 0x4E hh` | p. 1, fig. 1-6. OFF=0x00; ON=0x7F. |
| 4 BEAT / EXIT | 1 | Press | No | — | NOTE | 1 | `0x4D` | `0x90 0x4D hh` | — | p. 1, fig. 1-7. OFF=0x00; ON=0x7F. |
| 4 BEAT / EXIT | 1 | Press | Yes | — | NOTE | 1 | `0x50` | `0x90 0x50 hh` | — | p. 1, fig. 1-7. OFF=0x00; ON=0x7F. |
| 4 BEAT / EXIT | 2 | Press | No | — | NOTE | 2 | `0x4D` | `0x91 0x4D hh` | — | p. 1, fig. 1-7. OFF=0x00; ON=0x7F. |
| 4 BEAT / EXIT | 2 | Press | Yes | — | NOTE | 2 | `0x50` | `0x91 0x50 hh` | — | p. 1, fig. 1-7. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ◁ | 1 | Press | No | — | NOTE | 1 | `0x51` | `0x90 0x51 hh` | — | p. 1, fig. 1-8. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ◁ | 1 | Press | Yes | — | NOTE | 1 | `0x3E` | `0x90 0x3E hh` | — | p. 1, fig. 1-8. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ◁ | 2 | Press | No | — | NOTE | 2 | `0x51` | `0x91 0x51 hh` | — | p. 1, fig. 1-8. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ◁ | 2 | Press | Yes | — | NOTE | 2 | `0x3E` | `0x91 0x3E hh` | — | p. 1, fig. 1-8. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ▷ | 1 | Press | No | — | NOTE | 1 | `0x53` | `0x90 0x53 hh` | — | p. 1, fig. 1-9. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ▷ | 1 | Press | Yes | — | NOTE | 1 | `0x3D` | `0x90 0x3D hh` | — | p. 1, fig. 1-9. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ▷ | 2 | Press | No | — | NOTE | 2 | `0x53` | `0x91 0x53 hh` | — | p. 1, fig. 1-9. OFF=0x00; ON=0x7F. |
| CUE/LOOP CALL ▷ | 2 | Press | Yes | — | NOTE | 2 | `0x3D` | `0x91 0x3D hh` | — | p. 1, fig. 1-9. OFF=0x00; ON=0x7F. |
| BEAT SYNC | 1 | Press (*3) | No | — | NOTE | 1 | `0x58` | `0x90 0x58 hh` | `0x90 0x58 hh` | p. 2, fig. 1-10. OFF=0x00; ON=0x7F. *3: messages are sent on finger release, not on press. |
| BEAT SYNC | 1 | Long press (*3) | No | — | NOTE | 1 | `0x5C` | `0x90 0x5C hh` | — | p. 2, fig. 1-10. OFF=0x00; ON=0x7F. *3: messages are sent on finger release, not on press. |
| BEAT SYNC | 1 | Press (*3) | Yes | — | NOTE | 1 | `0x60` | `0x90 0x60 hh` | `0x90 0x60 hh` | p. 2, fig. 1-10. OFF=0x00; ON=0x7F. *3: messages are sent on finger release, not on press. |
| BEAT SYNC | 2 | Press (*3) | No | — | NOTE | 2 | `0x58` | `0x91 0x58 hh` | `0x91 0x58 hh` | p. 2, fig. 1-10. OFF=0x00; ON=0x7F. *3: messages are sent on finger release, not on press. |
| BEAT SYNC | 2 | Long press (*3) | No | — | NOTE | 2 | `0x5C` | `0x91 0x5C hh` | — | p. 2, fig. 1-10. OFF=0x00; ON=0x7F. *3: messages are sent on finger release, not on press. |
| BEAT SYNC | 2 | Press (*3) | Yes | — | NOTE | 2 | `0x60` | `0x91 0x60 hh` | `0x91 0x60 hh` | p. 2, fig. 1-10. OFF=0x00; ON=0x7F. *3: messages are sent on finger release, not on press. |
| TEMPO | 1 | Slide | No | — | CC | 1 | `0x00` | `0xB0 0x00 MSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 1 | Slide | No | — | CC | 1 | `0x20` | `0xB0 0x20 LSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 1 | Slide | Yes | — | CC | 1 | `0x00` | `0xB0 0x00 MSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 1 | Slide | Yes | — | CC | 1 | `0x20` | `0xB0 0x20 LSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 2 | Slide | No | — | CC | 2 | `0x00` | `0xB1 0x00 MSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 2 | Slide | No | — | CC | 2 | `0x20` | `0xB1 0x20 LSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 2 | Slide | Yes | — | CC | 2 | `0x00` | `0xB1 0x00 MSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| TEMPO | 2 | Slide | Yes | — | CC | 2 | `0x20` | `0xB1 0x20 LSB` | — | p. 2, fig. 1-11. 14-bit pair: MSB 0x00, LSB 0x20; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (minus side → plus side). |
| LOADED (Illumination control) | 1 | Track Load Illumination | — | — | NOTE | 16 | `0x00` | — | `0x9F 0x00 0x7F` | p. 5. Output-only Track Load Illumination; Data2 fixed at 0x7F. |
| LOADED (Illumination control) | 2 | Track Load Illumination | — | — | NOTE | 16 | `0x01` | — | `0x9F 0x01 0x7F` | p. 5. Output-only Track Load Illumination; Data2 fixed at 0x7F. |
| VINYL MODE (Settings) | 1 | Vinyl mode on/off | — | — | NOTE | 1 | `0x17` | — | `0x90 0x17 hh` | p. 5. OFF=0x00; ON=0x7F. Default: ON. *2: cannot be changed on the unit; send MIDI-OUT from the DJ application. |
| VINYL MODE (Settings) | 2 | Vinyl mode on/off | — | — | NOTE | 2 | `0x17` | — | `0x91 0x17 hh` | p. 5. OFF=0x00; ON=0x7F. Default: ON. *2: cannot be changed on the unit; send MIDI-OUT from the DJ application. |

## Effect

| UI / Control | Deck | Trigger | Shift | Mode / Condition | Type | MIDI Ch | Data1 | MIDI-IN | MIDI-OUT | Details |
|---|---:|---|---|---|---|---:|---|---|---|---|
| FX CH SELECT | — | Slide | No | CH1 | NOTE | 5 | `0x10` | `0x94 0x10 0x7F` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1 | NOTE | 5 | `0x11` | `0x94 0x11 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1 | NOTE | 6 | `0x10` | `0x95 0x10 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1 | NOTE | 6 | `0x11` | `0x95 0x11 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH2 | NOTE | 5 | `0x10` | `0x94 0x10 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH2 | NOTE | 5 | `0x11` | `0x94 0x11 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH2 | NOTE | 6 | `0x10` | `0x95 0x10 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH2 | NOTE | 6 | `0x11` | `0x95 0x11 0x7F` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1&CH2 | NOTE | 5 | `0x10` | `0x94 0x10 0x7F` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1&CH2 | NOTE | 5 | `0x11` | `0x94 0x11 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1&CH2 | NOTE | 6 | `0x10` | `0x95 0x10 0x00` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX CH SELECT | — | Slide | No | CH1&CH2 | NOTE | 6 | `0x11` | `0x95 0x11 0x7F` | — | p. 2, fig. 2-1. Four-message selector state; retain all four bytes/rows for each position. |
| FX SELECT | — | Press | No | — | NOTE | 5 | `0x63` | `0x94 0x63 hh` | — | p. 2, fig. 2-2. OFF=0x00; ON=0x7F. |
| FX SELECT | — | Press | Yes | — | NOTE | 5 | `0x64` | `0x94 0x64 hh` | — | p. 2, fig. 2-2. OFF=0x00; ON=0x7F. |
| BEAT ◁ | — | Press | No | — | NOTE | 5 | `0x4A` | `0x94 0x4A hh` | — | p. 2, fig. 2-3. OFF=0x00; ON=0x7F. |
| BEAT ◁ | — | Press | Yes | — | NOTE | 5 | `0x66` | `0x94 0x66 hh` | — | p. 2, fig. 2-3. OFF=0x00; ON=0x7F. |
| BEAT ▷ | — | Press | No | — | NOTE | 5 | `0x4B` | `0x94 0x4B hh` | — | p. 2, fig. 2-4. OFF=0x00; ON=0x7F. |
| BEAT ▷ | — | Press | Yes | — | NOTE | 5 | `0x6B` | `0x94 0x6B hh` | — | p. 2, fig. 2-4. OFF=0x00; ON=0x7F. |
| LEVEL/DEPTH | — | Rotate | No | — | CC | 6 | `0x02` | `0xB4 0x02 MSB` | — | p. 2, fig. 2-5. 14-bit pair: MSB 0x02, LSB 0x22; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). Source discrepancy: MIDI Ch=6, but Status=0xB4 encodes channel 5. Both source fields are retained. |
| LEVEL/DEPTH | — | Rotate | No | — | CC | 6 | `0x22` | `0xB4 0x22 LSB` | — | p. 2, fig. 2-5. 14-bit pair: MSB 0x02, LSB 0x22; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). Source discrepancy: MIDI Ch=6, but Status=0xB4 encodes channel 5. Both source fields are retained. |
| FX ON/OFF | — | Press | No | CH1 | NOTE | 5 | `0x47` | `0x94 0x47 hh` | — | p. 2, fig. 2-6. OFF=0x00; ON=0x7F. *4: NOTE ON causes blinking; NOTE OFF causes steady illumination. MIDI-OUT columns are blank/dashes in the table. |
| FX ON/OFF | — | Press | No | CH2 | NOTE | 6 | `0x47` | `0x95 0x47 hh` | — | p. 2, fig. 2-6. OFF=0x00; ON=0x7F. *4: NOTE ON causes blinking; NOTE OFF causes steady illumination. MIDI-OUT columns are blank/dashes in the table. |
| FX ON/OFF | — | Press | No | CH1&CH2 | NOTE | 5 | `0x47` | `0x94 0x47 hh` | — | p. 2, fig. 2-6. OFF=0x00; ON=0x7F. *4: NOTE ON causes blinking; NOTE OFF causes steady illumination. MIDI-OUT columns are blank/dashes in the table. |
| FX ON/OFF | — | Press | Yes | CH1 | NOTE | 5 | `0x43` | `0x94 0x43 hh` | — | p. 2, fig. 2-6. OFF=0x00; ON=0x7F. *4: NOTE ON causes blinking; NOTE OFF causes steady illumination. MIDI-OUT columns are blank/dashes in the table. |
| FX ON/OFF | — | Press | Yes | CH2 | NOTE | 6 | `0x43` | `0x95 0x43 hh` | — | p. 2, fig. 2-6. OFF=0x00; ON=0x7F. *4: NOTE ON causes blinking; NOTE OFF causes steady illumination. MIDI-OUT columns are blank/dashes in the table. |
| FX ON/OFF | — | Press | Yes | CH1&CH2 | NOTE | 5 | `0x43` | `0x94 0x43 hh` | — | p. 2, fig. 2-6. OFF=0x00; ON=0x7F. *4: NOTE ON causes blinking; NOTE OFF causes steady illumination. MIDI-OUT columns are blank/dashes in the table. |

## Mixer

| UI / Control | Deck | Trigger | Shift | Mode / Condition | Type | MIDI Ch | Data1 | MIDI-IN | MIDI-OUT | Details |
|---|---:|---|---|---|---|---:|---|---|---|---|
| MASTER LEVEL | — | Rotate | No | — | CC | 7 | `0x08` | `0xB6 0x08 MSB` | — | p. 2, fig. 3-1. 14-bit pair: MSB 0x08, LSB 0x28; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| MASTER LEVEL | — | Rotate | No | — | CC | 7 | `0x28` | `0xB6 0x28 LSB` | — | p. 2, fig. 3-1. 14-bit pair: MSB 0x08, LSB 0x28; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| MASTER CUE | — | Press | No | — | NOTE | 7 | `0x63` | `0x96 0x63 hh` | — | p. 2, fig. 3-2. OFF=0x00; ON=0x7F. |
| MASTER CUE | — | Press | Yes | — | NOTE | 7 | `0x78` | `0x96 0x78 hh` | — | p. 2, fig. 3-2. OFF=0x00; ON=0x7F. |
| TRIM | 1 | Rotate | No | — | CC | 1 | `0x04` | `0xB0 0x04 MSB` | — | p. 2, fig. 3-3. 14-bit pair: MSB 0x04, LSB 0x24; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| TRIM | 1 | Rotate | No | — | CC | 1 | `0x24` | `0xB0 0x24 LSB` | — | p. 2, fig. 3-3. 14-bit pair: MSB 0x04, LSB 0x24; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| TRIM | 2 | Rotate | No | — | CC | 2 | `0x04` | `0xB1 0x04 MSB` | — | p. 2, fig. 3-3. 14-bit pair: MSB 0x04, LSB 0x24; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| TRIM | 2 | Rotate | No | — | CC | 2 | `0x24` | `0xB1 0x24 LSB` | — | p. 2, fig. 3-3. 14-bit pair: MSB 0x04, LSB 0x24; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ HI | 1 | Rotate | No | — | CC | 1 | `0x07` | `0xB0 0x07 MSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x07, LSB 0x27; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ HI | 1 | Rotate | No | — | CC | 1 | `0x27` | `0xB0 0x27 LSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x07, LSB 0x27; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ HI | 2 | Rotate | No | — | CC | 2 | `0x07` | `0xB1 0x07 MSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x07, LSB 0x27; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ HI | 2 | Rotate | No | — | CC | 2 | `0x27` | `0xB1 0x27 LSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x07, LSB 0x27; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ MID | 1 | Rotate | No | — | CC | 1 | `0x0B` | `0xB0 0x0B MSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0B, LSB 0x2B; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ MID | 1 | Rotate | No | — | CC | 1 | `0x2B` | `0xB0 0x2B LSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0B, LSB 0x2B; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ MID | 2 | Rotate | No | — | CC | 2 | `0x0B` | `0xB1 0x0B MSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0B, LSB 0x2B; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ MID | 2 | Rotate | No | — | CC | 2 | `0x2B` | `0xB1 0x2B LSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0B, LSB 0x2B; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ LOW | 1 | Rotate | No | — | CC | 1 | `0x0F` | `0xB0 0x0F MSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0F, LSB 0x2F; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ LOW | 1 | Rotate | No | — | CC | 1 | `0x2F` | `0xB0 0x2F LSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0F, LSB 0x2F; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ LOW | 2 | Rotate | No | — | CC | 2 | `0x0F` | `0xB1 0x0F MSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0F, LSB 0x2F; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| EQ LOW | 2 | Rotate | No | — | CC | 2 | `0x2F` | `0xB1 0x2F LSB` | — | p. 2, fig. 3-4. 14-bit pair: MSB 0x0F, LSB 0x2F; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| CFX | 1 | Rotate | No | — | CC | 7 | `0x17` | `0xB6 0x17 MSB` | — | p. 2, fig. 3-5. 14-bit pair: MSB 0x17, LSB 0x37; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| CFX | 1 | Rotate | No | — | CC | 7 | `0x37` | `0xB6 0x37 LSB` | — | p. 2, fig. 3-5. 14-bit pair: MSB 0x17, LSB 0x37; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| CFX | 2 | Rotate | No | — | CC | 7 | `0x18` | `0xB6 0x18 MSB` | — | p. 2, fig. 3-5. 14-bit pair: MSB 0x18, LSB 0x38; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| CFX | 2 | Rotate | No | — | CC | 7 | `0x38` | `0xB6 0x38 LSB` | — | p. 2, fig. 3-5. 14-bit pair: MSB 0x18, LSB 0x38; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| CH CUE | 1 | Press | No | — | NOTE | 1 | `0x54` | `0x90 0x54 hh` | `0x90 0x54 hh` | p. 2, fig. 3-6. OFF=0x00; ON=0x7F. |
| CH CUE | 1 | Press | Yes | — | NOTE | 1 | `0x68` | `0x90 0x68 hh` | `0x90 0x68 hh` | p. 2, fig. 3-6. OFF=0x00; ON=0x7F. |
| CH CUE | 2 | Press | No | — | NOTE | 2 | `0x54` | `0x91 0x54 hh` | `0x91 0x54 hh` | p. 2, fig. 3-6. OFF=0x00; ON=0x7F. |
| CH CUE | 2 | Press | Yes | — | NOTE | 2 | `0x68` | `0x91 0x68 hh` | `0x91 0x68 hh` | p. 2, fig. 3-6. OFF=0x00; ON=0x7F. |
| CH FADER | 1 | Slide | No | — | CC | 1 | `0x13` | `0xB0 0x13 MSB` | — | p. 2, fig. 3-7. 14-bit pair: MSB 0x13, LSB 0x33; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (bottom end → top end). |
| CH FADER | 1 | Slide | No | — | CC | 1 | `0x33` | `0xB0 0x33 LSB` | — | p. 2, fig. 3-7. 14-bit pair: MSB 0x13, LSB 0x33; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (bottom end → top end). |
| CH FADER | 1 | Slide | Yes | From bottom to another position | NOTE | 1 | `0x66` | `0x90 0x66 hh` | — | p. 2, fig. 3-7. OFF=0x00; ON=0x7F. PLAY message only for channel-fader start. |
| CH FADER | 1 | Slide | Yes | From another position to bottom | NOTE | 1 | `0x52` | `0x90 0x52 hh` | — | p. 2, fig. 3-7. OFF=0x00; ON=0x7F. CUE message only for channel-fader start. |
| CH FADER | 2 | Slide | No | — | CC | 2 | `0x13` | `0xB1 0x13 MSB` | — | p. 2, fig. 3-7. 14-bit pair: MSB 0x13, LSB 0x33; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (bottom end → top end). |
| CH FADER | 2 | Slide | No | — | CC | 2 | `0x33` | `0xB1 0x33 LSB` | — | p. 2, fig. 3-7. 14-bit pair: MSB 0x13, LSB 0x33; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (bottom end → top end). |
| CH FADER | 2 | Slide | Yes | From bottom to another position | NOTE | 2 | `0x66` | `0x91 0x66 hh` | — | p. 2, fig. 3-7. OFF=0x00; ON=0x7F. PLAY message only for channel-fader start. |
| CH FADER | 2 | Slide | Yes | From another position to bottom | NOTE | 2 | `0x52` | `0x91 0x52 hh` | — | p. 2, fig. 3-7. OFF=0x00; ON=0x7F. CUE message only for channel-fader start. |
| CROSSFADER | — | Slide | No | — | CC | 7 | `0x1F` | `0xB6 0x1F MSB` | — | p. 2, fig. 3-8. 14-bit pair: MSB 0x1F, LSB 0x3F; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (left side → right side). |
| CROSSFADER | — | Slide | No | — | CC | 7 | `0x3F` | `0xB6 0x3F LSB` | — | p. 2, fig. 3-8. 14-bit pair: MSB 0x1F, LSB 0x3F; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (left side → right side). |
| CROSSFADER | — | Slide | Yes | From right edge toward left | NOTE | 7 | `0x66` | `0x90 0x66 hh` | — | p. 2, fig. 3-8. OFF=0x00; ON=0x7F. Crossfader-start message only. Source discrepancy: MIDI Ch=7, but Status=0x90 encodes channel 1. Both source fields are retained. |
| CROSSFADER | — | Slide | Yes | From another position to right edge | NOTE | 7 | `0x52` | `0x90 0x52 hh` | — | p. 2, fig. 3-8. OFF=0x00; ON=0x7F. Crossfader-start message only. Source discrepancy: MIDI Ch=7, but Status=0x90 encodes channel 1. Both source fields are retained. |
| CROSSFADER | — | Slide | Yes | From left edge toward right | NOTE | 7 | `0x66` | `0x91 0x66 hh` | — | p. 2, fig. 3-8. OFF=0x00; ON=0x7F. Crossfader-start message only. Source discrepancy: MIDI Ch=7, but Status=0x91 encodes channel 2. Both source fields are retained. |
| CROSSFADER | — | Slide | Yes | From another position to left edge | NOTE | 7 | `0x52` | `0x91 0x52 hh` | — | p. 2, fig. 3-8. OFF=0x00; ON=0x7F. Crossfader-start message only. Source discrepancy: MIDI Ch=7, but Status=0x91 encodes channel 2. Both source fields are retained. |
| MIC LEVEL | — | Rotate | No | — | CC | 7 | `0x05` | `0xB6 0x05 MSB` | — | p. 2, fig. 3-9. 14-bit pair: MSB 0x05, LSB 0x25; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| MIC LEVEL | — | Rotate | No | — | CC | 7 | `0x25` | `0xB6 0x25 LSB` | — | p. 2, fig. 3-9. 14-bit pair: MSB 0x05, LSB 0x25; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| SMART CFX | — | Press | No | — | NOTE | 7 | `0x00` | `0x96 0x00 hh` | `0x96 0x00 hh` | p. 2, fig. 3-10. OFF=0x00; ON=0x7F. |
| SMART CFX | — | Press | Yes | — | NOTE | 7 | `0x08` | `0x96 0x08 hh` | — | p. 2, fig. 3-10. OFF=0x00; ON=0x7F. |
| HEADPHONE MIX | — | Rotate | No | — | CC | 7 | `0x0C` | `0xB6 0x0C MSB` | — | p. 2, fig. 3-11. 14-bit pair: MSB 0x0C, LSB 0x2C; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| HEADPHONE MIX | — | Rotate | No | — | CC | 7 | `0x2C` | `0xB6 0x2C LSB` | — | p. 2, fig. 3-11. 14-bit pair: MSB 0x0C, LSB 0x2C; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| HEADPHONE LEVEL | — | Rotate | No | — | CC | 7 | `0x0D` | `0xB6 0x0D MSB` | — | p. 2, fig. 3-12. 14-bit pair: MSB 0x0D, LSB 0x2D; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| HEADPHONE LEVEL | — | Rotate | No | — | CC | 7 | `0x2D` | `0xB6 0x2D LSB` | — | p. 2, fig. 3-12. 14-bit pair: MSB 0x0D, LSB 0x2D; min MSB/LSB=0x00/0x00, max=0x7F/0x7F (fully counterclockwise → fully clockwise). |
| SMART FADER | — | Press | No | — | NOTE | 7 | `0x01` | `0x96 0x01 hh` | `0x96 0x01 hh` | p. 2, fig. 3-13. OFF=0x00; ON=0x7F. |
| SMART FADER | — | Press | Yes | — | NOTE | 7 | `0x09` | `0x96 0x09 hh` | — | p. 2, fig. 3-13. OFF=0x00; ON=0x7F. |
| Android MONO/STEREO | — | Slide | No | — | NOTE | 7 | `0x6D` | `0x96 0x6D hh` | — | p. 2, fig. 3-14. STEREO=0x00; MONO=0x7F. |
| CH LEVEL METER | 1 | — | No | — | NOTE | 1 | `0x02` | — | `0xB0 0x02 hh` | p. 2, fig. 3-15. Lights from the bottom: Green1 0x26–0x40; through Green2 0x41–0x56; through Orange1 0x57–0x64; through Orange2 0x65–0x76; through Red 0x77–0x7F. Source discrepancy: Type=NOTE, but MIDI-OUT uses a CC status byte. |
| CH LEVEL METER | 2 | — | No | — | NOTE | 2 | `0x02` | — | `0xB1 0x02 hh` | p. 2, fig. 3-15. Lights from the bottom: Green1 0x26–0x40; through Green2 0x41–0x56; through Orange1 0x57–0x64; through Orange2 0x65–0x76; through Red 0x77–0x7F. Source discrepancy: Type=NOTE, but MIDI-OUT uses a CC status byte. |

## Browse

| UI / Control | Deck | Trigger | Shift | Mode / Condition | Type | MIDI Ch | Data1 | MIDI-IN | MIDI-OUT | Details |
|---|---:|---|---|---|---|---:|---|---|---|---|
| BROWSE | — | Rotate | No | — | CC | 7 | `0x40` | `0xB6 0x40 hh` | — | p. 2, fig. 4-1. Differential count from previous operation; clockwise increases from 0x01, counterclockwise decreases from 0x7F. |
| BROWSE | — | Rotate | Yes | — | CC | 7 | `0x64` | `0xB6 0x64 hh` | — | p. 2, fig. 4-1. Differential count from previous operation; clockwise increases from 0x01, counterclockwise decreases from 0x7F. |
| BROWSE | — | Press | No | — | NOTE | 7 | `0x41` | `0x96 0x41 hh` | — | p. 2, fig. 4-1. OFF=0x00; ON=0x7F. |
| BROWSE | — | Press | Yes | — | NOTE | 7 | `0x42` | `0x96 0x42 hh` | — | p. 2, fig. 4-1. OFF=0x00; ON=0x7F. |
| LOAD | 1 | Press | No | — | NOTE | 7 | `0x46` | `0x96 0x46 hh` | — | p. 2, fig. 4-2. OFF=0x00; ON=0x7F. |
| LOAD | 1 | Press | Yes | — | NOTE | 7 | `0x68` | `0x96 0x68 hh` | — | p. 2, fig. 4-2. OFF=0x00; ON=0x7F. |
| LOAD | 2 | Press | No | — | NOTE | 7 | `0x47` | `0x96 0x47 hh` | — | p. 2, fig. 4-3. OFF=0x00; ON=0x7F. |
| LOAD | 2 | Press | Yes | — | NOTE | 7 | `0x7A` | `0x96 0x7A hh` | — | p. 2, fig. 4-3. OFF=0x00; ON=0x7F. |

## Performance Pads

The mode buttons are followed by every pad/mode/deck/Shift combination.
Pad positions are numbered 1–8 exactly as in the PDF.

| UI / Control | Deck | Trigger | Shift | Mode / Condition | Type | MIDI Ch | Data1 | MIDI-IN | MIDI-OUT | Details |
|---|---:|---|---|---|---|---:|---|---|---|---|
| HOT CUE MODE | 1 | Press | No | — | NOTE | 1 | `0x1B` | `0x90 0x1B hh` | `0x90 0x1B hh` | p. 3, fig. 5-1. OFF=0x00; ON=0x7F. |
| HOT CUE MODE | 1 | Press | Yes | — | NOTE | 1 | `0x69` | `0x90 0x69 hh` | `0x90 0x69 hh` | p. 3, fig. 5-1. OFF=0x00; ON=0x7F. Shift row of HOT CUE MODE (the PDF does not name a separate mode in this row). |
| HOT CUE MODE | 2 | Press | No | — | NOTE | 2 | `0x1B` | `0x91 0x1B hh` | `0x91 0x1B hh` | p. 3, fig. 5-1. OFF=0x00; ON=0x7F. |
| HOT CUE MODE | 2 | Press | Yes | — | NOTE | 2 | `0x69` | `0x91 0x69 hh` | `0x91 0x69 hh` | p. 3, fig. 5-1. OFF=0x00; ON=0x7F. Shift row of HOT CUE MODE (the PDF does not name a separate mode in this row). |
| PAD FX 1 MODE | 1 | Press | No | — | NOTE | 1 | `0x1E` | `0x90 0x1E hh` | `0x90 0x1E hh` | p. 3, fig. 5-2. OFF=0x00; ON=0x7F. |
| PAD FX 1 MODE | 1 | Press | Yes | — | NOTE | 1 | `0x6B` | `0x90 0x6B hh` | `0x90 0x6B hh` | p. 3, fig. 5-2. OFF=0x00; ON=0x7F. Shift row of PAD FX 1 MODE (the PDF does not name a separate mode in this row). |
| PAD FX 1 MODE | 2 | Press | No | — | NOTE | 2 | `0x1E` | `0x91 0x1E hh` | `0x91 0x1E hh` | p. 3, fig. 5-2. OFF=0x00; ON=0x7F. |
| PAD FX 1 MODE | 2 | Press | Yes | — | NOTE | 2 | `0x6B` | `0x91 0x6B hh` | `0x91 0x6B hh` | p. 3, fig. 5-2. OFF=0x00; ON=0x7F. Shift row of PAD FX 1 MODE (the PDF does not name a separate mode in this row). |
| BEAT JUMP MODE | 1 | Press | No | — | NOTE | 1 | `0x20` | `0x90 0x20 hh` | `0x90 0x20 hh` | p. 3, fig. 5-3. OFF=0x00; ON=0x7F. |
| BEAT JUMP MODE | 1 | Press | Yes | — | NOTE | 1 | `0x6D` | `0x90 0x6D hh` | `0x90 0x6D hh` | p. 3, fig. 5-3. OFF=0x00; ON=0x7F. Shift row of BEAT JUMP MODE (the PDF does not name a separate mode in this row). |
| BEAT JUMP MODE | 2 | Press | No | — | NOTE | 2 | `0x20` | `0x91 0x20 hh` | `0x91 0x20 hh` | p. 3, fig. 5-3. OFF=0x00; ON=0x7F. |
| BEAT JUMP MODE | 2 | Press | Yes | — | NOTE | 2 | `0x6D` | `0x91 0x6D hh` | `0x91 0x6D hh` | p. 3, fig. 5-3. OFF=0x00; ON=0x7F. Shift row of BEAT JUMP MODE (the PDF does not name a separate mode in this row). |
| SAMPLER MODE | 1 | Press | No | — | NOTE | 1 | `0x22` | `0x90 0x22 hh` | `0x90 0x22 hh` | p. 3, fig. 5-4. OFF=0x00; ON=0x7F. |
| SAMPLER MODE | 1 | Press | Yes | — | NOTE | 1 | `0x6F` | `0x90 0x6F hh` | `0x90 0x6F hh` | p. 3, fig. 5-4. OFF=0x00; ON=0x7F. Shift row of SAMPLER MODE (the PDF does not name a separate mode in this row). |
| SAMPLER MODE | 2 | Press | No | — | NOTE | 2 | `0x22` | `0x91 0x22 hh` | `0x91 0x22 hh` | p. 3, fig. 5-4. OFF=0x00; ON=0x7F. |
| SAMPLER MODE | 2 | Press | Yes | — | NOTE | 2 | `0x6F` | `0x91 0x6F hh` | `0x91 0x6F hh` | p. 3, fig. 5-4. OFF=0x00; ON=0x7F. Shift row of SAMPLER MODE (the PDF does not name a separate mode in this row). |
| PERFORMANCE PAD 1 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x00` | `0x97 0x00 hh` | `0x97 0x00 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x00` | `0x98 0x00 hh` | `0x98 0x00 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x10` | `0x97 0x10 hh` | `0x97 0x10 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x10` | `0x98 0x10 hh` | `0x98 0x10 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x20` | `0x97 0x20 hh` | `0x97 0x20 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x20` | `0x98 0x20 hh` | `0x98 0x20 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x30` | `0x97 0x30 hh` | `0x97 0x30 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x30` | `0x98 0x30 hh` | `0x98 0x30 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x40` | `0x97 0x40 hh` | `0x97 0x40 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x40` | `0x98 0x40 hh` | `0x98 0x40 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x50` | `0x97 0x50 hh` | `0x97 0x50 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x50` | `0x98 0x50 hh` | `0x98 0x50 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x60` | `0x97 0x60 hh` | `0x97 0x60 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x60` | `0x98 0x60 hh` | `0x98 0x60 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x70` | `0x97 0x70 hh` | `0x97 0x70 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x70` | `0x98 0x70 hh` | `0x98 0x70 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x00` | `0x99 0x00 hh` | `0x99 0x00 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x00` | `0x9A 0x00 hh` | `0x9A 0x00 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x10` | `0x99 0x10 hh` | `0x99 0x10 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x10` | `0x9A 0x10 hh` | `0x9A 0x10 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x20` | `0x99 0x20 hh` | `0x99 0x20 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x20` | `0x9A 0x20 hh` | `0x9A 0x20 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x30` | `0x99 0x30 hh` | `0x99 0x30 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x30` | `0x9A 0x30 hh` | `0x9A 0x30 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x40` | `0x99 0x40 hh` | `0x99 0x40 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x40` | `0x9A 0x40 hh` | `0x9A 0x40 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x50` | `0x99 0x50 hh` | `0x99 0x50 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x50` | `0x9A 0x50 hh` | `0x9A 0x50 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x60` | `0x99 0x60 hh` | `0x99 0x60 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x60` | `0x9A 0x60 hh` | `0x9A 0x60 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x70` | `0x99 0x70 hh` | `0x99 0x70 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 1 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x70` | `0x9A 0x70 hh` | `0x9A 0x70 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x01` | `0x97 0x01 hh` | `0x97 0x01 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x01` | `0x98 0x01 hh` | `0x98 0x01 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x11` | `0x97 0x11 hh` | `0x97 0x11 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x11` | `0x98 0x11 hh` | `0x98 0x11 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x21` | `0x97 0x21 hh` | `0x97 0x21 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x21` | `0x98 0x21 hh` | `0x98 0x21 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x31` | `0x97 0x31 hh` | `0x97 0x31 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x31` | `0x98 0x31 hh` | `0x98 0x31 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x41` | `0x97 0x41 hh` | `0x97 0x41 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x41` | `0x98 0x41 hh` | `0x98 0x41 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x51` | `0x97 0x51 hh` | `0x97 0x51 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x51` | `0x98 0x51 hh` | `0x98 0x51 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x61` | `0x97 0x61 hh` | `0x97 0x61 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x61` | `0x98 0x61 hh` | `0x98 0x61 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x71` | `0x97 0x71 hh` | `0x97 0x71 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x71` | `0x98 0x71 hh` | `0x98 0x71 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x01` | `0x99 0x01 hh` | `0x99 0x01 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x01` | `0x9A 0x01 hh` | `0x9A 0x01 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x11` | `0x99 0x11 hh` | `0x99 0x11 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x11` | `0x9A 0x11 hh` | `0x9A 0x11 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x21` | `0x99 0x21 hh` | `0x99 0x21 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x21` | `0x9A 0x21 hh` | `0x9A 0x21 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x31` | `0x99 0x31 hh` | `0x99 0x31 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x31` | `0x9A 0x31 hh` | `0x9A 0x31 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x41` | `0x99 0x41 hh` | `0x99 0x41 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x41` | `0x9A 0x41 hh` | `0x9A 0x41 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x51` | `0x99 0x51 hh` | `0x99 0x51 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x51` | `0x9A 0x51 hh` | `0x9A 0x51 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x61` | `0x99 0x61 hh` | `0x99 0x61 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x61` | `0x9A 0x61 hh` | `0x9A 0x61 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x71` | `0x99 0x71 hh` | `0x99 0x71 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 2 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x71` | `0x9A 0x71 hh` | `0x9A 0x71 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x02` | `0x97 0x02 hh` | `0x97 0x02 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x02` | `0x98 0x02 hh` | `0x98 0x02 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x12` | `0x97 0x12 hh` | `0x97 0x12 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x12` | `0x98 0x12 hh` | `0x98 0x12 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x22` | `0x97 0x22 hh` | `0x97 0x22 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x22` | `0x98 0x22 hh` | `0x98 0x22 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x32` | `0x97 0x32 hh` | `0x97 0x32 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x32` | `0x98 0x32 hh` | `0x98 0x32 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x42` | `0x97 0x42 hh` | `0x97 0x42 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x42` | `0x98 0x42 hh` | `0x98 0x42 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x52` | `0x97 0x52 hh` | `0x97 0x52 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x52` | `0x98 0x52 hh` | `0x98 0x52 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x62` | `0x97 0x62 hh` | `0x97 0x62 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x62` | `0x98 0x62 hh` | `0x98 0x62 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x72` | `0x97 0x72 hh` | `0x97 0x72 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x72` | `0x98 0x72 hh` | `0x98 0x72 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x02` | `0x99 0x02 hh` | `0x99 0x02 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x02` | `0x9A 0x02 hh` | `0x9A 0x02 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x12` | `0x99 0x12 hh` | `0x99 0x12 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x12` | `0x9A 0x12 hh` | `0x9A 0x12 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x22` | `0x99 0x22 hh` | `0x99 0x22 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x22` | `0x9A 0x22 hh` | `0x9A 0x22 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x32` | `0x99 0x32 hh` | `0x99 0x32 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x32` | `0x9A 0x32 hh` | `0x9A 0x32 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x42` | `0x99 0x42 hh` | `0x99 0x42 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x42` | `0x9A 0x42 hh` | `0x9A 0x42 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x52` | `0x99 0x52 hh` | `0x99 0x52 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x52` | `0x9A 0x52 hh` | `0x9A 0x52 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x62` | `0x99 0x62 hh` | `0x99 0x62 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x62` | `0x9A 0x62 hh` | `0x9A 0x62 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x72` | `0x99 0x72 hh` | `0x99 0x72 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 3 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x72` | `0x9A 0x72 hh` | `0x9A 0x72 hh` | p. 3, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x03` | `0x97 0x03 hh` | `0x97 0x03 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x03` | `0x98 0x03 hh` | `0x98 0x03 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x13` | `0x97 0x13 hh` | `0x97 0x13 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x13` | `0x98 0x13 hh` | `0x98 0x13 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x23` | `0x97 0x23 hh` | `0x97 0x23 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x23` | `0x98 0x23 hh` | `0x98 0x23 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x33` | `0x97 0x33 hh` | `0x97 0x33 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x33` | `0x98 0x33 hh` | `0x98 0x33 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x43` | `0x97 0x43 hh` | `0x97 0x43 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x43` | `0x98 0x43 hh` | `0x98 0x43 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x53` | `0x97 0x53 hh` | `0x97 0x53 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x53` | `0x98 0x53 hh` | `0x98 0x53 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x63` | `0x97 0x63 hh` | `0x97 0x63 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x63` | `0x98 0x63 hh` | `0x98 0x63 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x73` | `0x97 0x73 hh` | `0x97 0x73 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x73` | `0x98 0x73 hh` | `0x98 0x73 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x03` | `0x99 0x03 hh` | `0x99 0x03 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x03` | `0x9A 0x03 hh` | `0x9A 0x03 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x13` | `0x99 0x13 hh` | `0x99 0x13 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x13` | `0x9A 0x13 hh` | `0x9A 0x13 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x23` | `0x99 0x23 hh` | `0x99 0x23 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x23` | `0x9A 0x23 hh` | `0x9A 0x23 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x33` | `0x99 0x33 hh` | `0x99 0x33 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x33` | `0x9A 0x33 hh` | `0x9A 0x33 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x43` | `0x99 0x43 hh` | `0x99 0x43 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x43` | `0x9A 0x43 hh` | `0x9A 0x43 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x53` | `0x99 0x53 hh` | `0x99 0x53 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x53` | `0x9A 0x53 hh` | `0x9A 0x53 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x63` | `0x99 0x63 hh` | `0x99 0x63 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x63` | `0x9A 0x63 hh` | `0x9A 0x63 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x73` | `0x99 0x73 hh` | `0x99 0x73 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 4 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x73` | `0x9A 0x73 hh` | `0x9A 0x73 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x04` | `0x97 0x04 hh` | `0x97 0x04 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x04` | `0x98 0x04 hh` | `0x98 0x04 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x14` | `0x97 0x14 hh` | `0x97 0x14 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x14` | `0x98 0x14 hh` | `0x98 0x14 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x24` | `0x97 0x24 hh` | `0x97 0x24 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x24` | `0x98 0x24 hh` | `0x98 0x24 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x34` | `0x97 0x34 hh` | `0x97 0x34 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x34` | `0x98 0x34 hh` | `0x98 0x34 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x44` | `0x97 0x44 hh` | `0x97 0x44 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x44` | `0x98 0x44 hh` | `0x98 0x44 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x54` | `0x97 0x54 hh` | `0x97 0x54 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x54` | `0x98 0x54 hh` | `0x98 0x54 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x64` | `0x97 0x64 hh` | `0x97 0x64 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x64` | `0x98 0x64 hh` | `0x98 0x64 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x74` | `0x97 0x74 hh` | `0x97 0x74 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x74` | `0x98 0x74 hh` | `0x98 0x74 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x04` | `0x99 0x04 hh` | `0x99 0x04 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x04` | `0x9A 0x04 hh` | `0x9A 0x04 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x14` | `0x99 0x14 hh` | `0x99 0x14 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x14` | `0x9A 0x14 hh` | `0x9A 0x14 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x24` | `0x99 0x24 hh` | `0x99 0x24 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x24` | `0x9A 0x24 hh` | `0x9A 0x24 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x34` | `0x99 0x34 hh` | `0x99 0x34 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x34` | `0x9A 0x34 hh` | `0x9A 0x34 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x44` | `0x99 0x44 hh` | `0x99 0x44 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x44` | `0x9A 0x44 hh` | `0x9A 0x44 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x54` | `0x99 0x54 hh` | `0x99 0x54 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x54` | `0x9A 0x54 hh` | `0x9A 0x54 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x64` | `0x99 0x64 hh` | `0x99 0x64 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x64` | `0x9A 0x64 hh` | `0x9A 0x64 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x74` | `0x99 0x74 hh` | `0x99 0x74 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 5 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x74` | `0x9A 0x74 hh` | `0x9A 0x74 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x05` | `0x97 0x05 hh` | `0x97 0x05 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x05` | `0x98 0x05 hh` | `0x98 0x05 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x15` | `0x97 0x15 hh` | `0x97 0x15 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x15` | `0x98 0x15 hh` | `0x98 0x15 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x25` | `0x97 0x25 hh` | `0x97 0x25 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x25` | `0x98 0x25 hh` | `0x98 0x25 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x35` | `0x97 0x35 hh` | `0x97 0x35 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x35` | `0x98 0x35 hh` | `0x98 0x35 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x45` | `0x97 0x45 hh` | `0x97 0x45 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x45` | `0x98 0x45 hh` | `0x98 0x45 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x55` | `0x97 0x55 hh` | `0x97 0x55 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x55` | `0x98 0x55 hh` | `0x98 0x55 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x65` | `0x97 0x65 hh` | `0x97 0x65 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x65` | `0x98 0x65 hh` | `0x98 0x65 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x75` | `0x97 0x75 hh` | `0x97 0x75 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x75` | `0x98 0x75 hh` | `0x98 0x75 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x05` | `0x99 0x05 hh` | `0x99 0x05 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x05` | `0x9A 0x05 hh` | `0x9A 0x05 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x15` | `0x99 0x15 hh` | `0x99 0x15 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x15` | `0x9A 0x15 hh` | `0x9A 0x15 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x25` | `0x99 0x25 hh` | `0x99 0x25 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x25` | `0x9A 0x25 hh` | `0x9A 0x25 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x35` | `0x99 0x35 hh` | `0x99 0x35 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x35` | `0x9A 0x35 hh` | `0x9A 0x35 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x45` | `0x99 0x45 hh` | `0x99 0x45 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x45` | `0x9A 0x45 hh` | `0x9A 0x45 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x55` | `0x99 0x55 hh` | `0x99 0x55 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x55` | `0x9A 0x55 hh` | `0x9A 0x55 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x65` | `0x99 0x65 hh` | `0x99 0x65 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x65` | `0x9A 0x65 hh` | `0x9A 0x65 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x75` | `0x99 0x75 hh` | `0x99 0x75 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 6 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x75` | `0x9A 0x75 hh` | `0x9A 0x75 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x06` | `0x97 0x06 hh` | `0x97 0x06 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x06` | `0x98 0x06 hh` | `0x98 0x06 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x16` | `0x97 0x16 hh` | `0x97 0x16 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x16` | `0x98 0x16 hh` | `0x98 0x16 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x26` | `0x97 0x26 hh` | `0x97 0x26 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x26` | `0x98 0x26 hh` | `0x98 0x26 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x36` | `0x97 0x36 hh` | `0x97 0x36 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x36` | `0x98 0x36 hh` | `0x98 0x36 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x46` | `0x97 0x46 hh` | `0x97 0x46 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x46` | `0x98 0x46 hh` | `0x98 0x46 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x56` | `0x97 0x56 hh` | `0x97 0x56 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x56` | `0x98 0x56 hh` | `0x98 0x56 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x66` | `0x97 0x66 hh` | `0x97 0x66 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x66` | `0x98 0x66 hh` | `0x98 0x66 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x76` | `0x97 0x76 hh` | `0x97 0x76 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x76` | `0x98 0x76 hh` | `0x98 0x76 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x06` | `0x99 0x06 hh` | `0x99 0x06 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x06` | `0x9A 0x06 hh` | `0x9A 0x06 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x16` | `0x99 0x16 hh` | `0x99 0x16 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x16` | `0x9A 0x16 hh` | `0x9A 0x16 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x26` | `0x99 0x26 hh` | `0x99 0x26 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x26` | `0x9A 0x26 hh` | `0x9A 0x26 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x36` | `0x99 0x36 hh` | `0x99 0x36 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x36` | `0x9A 0x36 hh` | `0x9A 0x36 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x46` | `0x99 0x46 hh` | `0x99 0x46 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x46` | `0x9A 0x46 hh` | `0x9A 0x46 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x56` | `0x99 0x56 hh` | `0x99 0x56 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x56` | `0x9A 0x56 hh` | `0x9A 0x56 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x66` | `0x99 0x66 hh` | `0x99 0x66 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x66` | `0x9A 0x66 hh` | `0x9A 0x66 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x76` | `0x99 0x76 hh` | `0x99 0x76 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 7 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x76` | `0x9A 0x76 hh` | `0x9A 0x76 hh` | p. 4, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | HOT CUE MODE | NOTE | 8 | `0x07` | `0x97 0x07 hh` | `0x97 0x07 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | HOT CUE MODE | NOTE | 9 | `0x07` | `0x98 0x07 hh` | `0x98 0x07 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | PAD FX 1 MODE | NOTE | 8 | `0x17` | `0x97 0x17 hh` | `0x97 0x17 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | PAD FX 1 MODE | NOTE | 9 | `0x17` | `0x98 0x17 hh` | `0x98 0x17 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | BEAT JUMP MODE | NOTE | 8 | `0x27` | `0x97 0x27 hh` | `0x97 0x27 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | BEAT JUMP MODE | NOTE | 9 | `0x27` | `0x98 0x27 hh` | `0x98 0x27 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | SAMPLER MODE | NOTE | 8 | `0x37` | `0x97 0x37 hh` | `0x97 0x37 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | SAMPLER MODE | NOTE | 9 | `0x37` | `0x98 0x37 hh` | `0x98 0x37 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | KEYBOARD MODE | NOTE | 8 | `0x47` | `0x97 0x47 hh` | `0x97 0x47 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | KEYBOARD MODE | NOTE | 9 | `0x47` | `0x98 0x47 hh` | `0x98 0x47 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | PAD FX 2 MODE | NOTE | 8 | `0x57` | `0x97 0x57 hh` | `0x97 0x57 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | PAD FX 2 MODE | NOTE | 9 | `0x57` | `0x98 0x57 hh` | `0x98 0x57 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | BEAT LOOP MODE | NOTE | 8 | `0x67` | `0x97 0x67 hh` | `0x97 0x67 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | BEAT LOOP MODE | NOTE | 9 | `0x67` | `0x98 0x67 hh` | `0x98 0x67 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | No | KEY SHIFT MODE | NOTE | 8 | `0x77` | `0x97 0x77 hh` | `0x97 0x77 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 1 | Press | Yes | KEY SHIFT MODE | NOTE | 9 | `0x77` | `0x98 0x77 hh` | `0x98 0x77 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | HOT CUE MODE | NOTE | 10 | `0x07` | `0x99 0x07 hh` | `0x99 0x07 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | HOT CUE MODE | NOTE | 11 | `0x07` | `0x9A 0x07 hh` | `0x9A 0x07 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | PAD FX 1 MODE | NOTE | 10 | `0x17` | `0x99 0x17 hh` | `0x99 0x17 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | PAD FX 1 MODE | NOTE | 11 | `0x17` | `0x9A 0x17 hh` | `0x9A 0x17 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | BEAT JUMP MODE | NOTE | 10 | `0x27` | `0x99 0x27 hh` | `0x99 0x27 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | BEAT JUMP MODE | NOTE | 11 | `0x27` | `0x9A 0x27 hh` | `0x9A 0x27 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | SAMPLER MODE | NOTE | 10 | `0x37` | `0x99 0x37 hh` | `0x99 0x37 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | SAMPLER MODE | NOTE | 11 | `0x37` | `0x9A 0x37 hh` | `0x9A 0x37 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | KEYBOARD MODE | NOTE | 10 | `0x47` | `0x99 0x47 hh` | `0x99 0x47 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | KEYBOARD MODE | NOTE | 11 | `0x47` | `0x9A 0x47 hh` | `0x9A 0x47 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | PAD FX 2 MODE | NOTE | 10 | `0x57` | `0x99 0x57 hh` | `0x99 0x57 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | PAD FX 2 MODE | NOTE | 11 | `0x57` | `0x9A 0x57 hh` | `0x9A 0x57 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | BEAT LOOP MODE | NOTE | 10 | `0x67` | `0x99 0x67 hh` | `0x99 0x67 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | BEAT LOOP MODE | NOTE | 11 | `0x67` | `0x9A 0x67 hh` | `0x9A 0x67 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | No | KEY SHIFT MODE | NOTE | 10 | `0x77` | `0x99 0x77 hh` | `0x99 0x77 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |
| PERFORMANCE PAD 8 | 2 | Press | Yes | KEY SHIFT MODE | NOTE | 11 | `0x77` | `0x9A 0x77 hh` | `0x9A 0x77 hh` | p. 5, fig. 5-5. OFF=0x00; ON=0x7F. |

Documented reference entries: 423. Each MSB/LSB message and each selector-state message is counted separately.
