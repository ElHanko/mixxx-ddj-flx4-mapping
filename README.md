# Mixxx Pioneer DDJ-FLX4 Mapping

Custom Mixxx controller mapping for the Pioneer DDJ-FLX4.

This mapping replaces large parts of the stock FLX4 mapping with
script-driven logic to achieve consistent behavior and deterministic control flow.

---

## Requirements

This mapping targets **Mixxx 2.6 or newer**.

Older versions (e.g. 2.5) are not supported.

---

## Repository Structure


controllers/
Pioneer-DDJ-FLX4-2.0.midi.xml
Pioneer-DDJ-FLX4-2.0.script.js

CONTROLS.md
CONFIGURATION.md
CHANGELOG.md


* `controllers/` – mapping implementation
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