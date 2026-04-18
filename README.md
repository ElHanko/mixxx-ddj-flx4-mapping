# Mixxx Pioneer DDJ-FLX4 Mapping

Custom Mixxx controller mapping for the Pioneer DDJ-FLX4.

This mapping replaces large parts of the stock FLX4 mapping with
script-driven logic to achieve consistent behavior and deterministic control flow.

---

## Requirements

This mapping targets **Mixxx 2.6 or newer**.

Older versions (e.g. 2.5) are not supported.

---

## Setup

### Recommended setup
After cloning the repository, run:


./setup-mixxx-links.sh

This creates symlinks for the mapping files into your Mixxx user directories.

Manual setup

If you do not want to use symlinks:

Copy the files from controllers/ into your Mixxx controllers directory.
Copy the contents of effects/chains/ into your Mixxx effects directory.
Restart Mixxx.

Without the provided effect chains:

Beat FX behavior will not match the intended design
---

## Repository Structure


controllers/
Pioneer-DDJ-FLX4-2.0.midi.xml
Pioneer-DDJ-FLX4-2.0.script.js

effects/chains/

setup-mixxx-links.sh
CONTROLS.md
CONFIGURATION.md
CHANGELOG.md

* `controllers/` – mapping implementation
* `effects/chains/` – effect chain presets used by the Beat FX system
* `setup-mixxx-links.sh` – creates symlinks into local Mixxx user directories
* `CONTROLS.md` – complete control reference
* `CONFIGURATION.md` – script configuration
* `CHANGELOG.md` – version history

---

## Documentation

Detailed controller documentation is maintained separately:

https://github.com/ElHanko/manual/blob/feat/flx4-controller-doc/source/hardware/controllers/pioneer_ddj_flx4.rst

This repository focuses on:

* implementation
* behavior definition
* configuration

---

## Core Characteristics

This mapping differs from the stock implementation in several key areas:

* Script-driven LED handling based on Mixxx engine state
* Deterministic button behavior (no implicit toggle assumptions)
* Centralized pad logic per mode
* Stateful loop workflow with jog-based adjustment
* Banked hotcue system (up to 32 hotcues)
* Explicit short/long press handling for shared controls
* Script-routed EQ layer with optional Shift-based stem volume control

---

## Features

* Beat FX system with group + variant control
* Custom Pad FX layers (FX1 / FX2)
* Sampler with explicit LED state machine (off / solid / blink)
* STEMS mode on Keyboard layer
* Keyshift pad mode (semitone mapping)
* Instant doubles via LOAD double press
* Configurable browser focus behavior
* Quantize / Keylock on shared control (short / long press)
* Vinyl mode toggle via **SHIFT + 4BEAT/EXIT**
* Optional vinyl brake / soft-start on PLAY
* Script-controlled VU meters with peak hold
* Shift-based stem volume control on EQ knobs with per-mode soft takeover

---

## Beat FX

The Beat FX implementation relies on predefined effect chains.

These are provided in:

effects/chains/

The mapping expects these chains to be available in Mixxx.
---

## Status

Work in progress.

The mapping is actively used and updated based on:

* real-world usage
* identified inconsistencies
* engine behavior changes

---

## Author

ElHanko

---

## License

MIT