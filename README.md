# Mixxx Pioneer DDJ-FLX4 Mapping

Custom Mixxx controller mapping for the Pioneer DDJ-FLX4.

This mapping started as the official FLX4 mapping but has been heavily modified
and partially rewritten. Some components originate from my previous
Hercules Inpulse 300 Mk2 mapping.

The goal is a workflow that feels closer to standalone Pioneer players
while still taking advantage of Mixxx features.

---

## Requirements

This mapping targets **Mixxx 2.6 or newer**.

Older versions of Mixxx (e.g. 2.5) are not supported.

---

## Repository Structure

controllers/
  Pioneer-DDJ-FLX4-2.0.midi.xml
  Pioneer-DDJ-FLX4-2.0.script.js

CONTROLS.md
  Detailed controller behavior reference

CONFIGURATION.md
  Script configuration options

CHANGELOG.md
  Version history

---

## Documentation

This repository contains the mapping implementation.

The full controller documentation is maintained in the Mixxx manual
documentation repository:

https://github.com/ElHanko/manual/blob/feat/flx4-controller-doc/source/hardware/controllers/pioneer_ddj_flx4.rst

Additional project documentation:

- `CONTROLS.md` – detailed control behavior
- `CONFIGURATION.md` – script configuration options
- `CHANGELOG.md` – project history
---

## Features

- Improved Beat FX behaviour
- PAD FX1 / PAD FX2 implementation
- Sampler LED state machine
- Keyshift pad mode
- Instant doubles
- Browser focus toggle
- Quantize / Keylock shortcuts
- Vinyl mode toggle via **SHIFT + 4BEAT/EXIT**
- Optional vinyl brake / soft start behaviour on the PLAY button
- Configurable controller behaviour for selected features

---

## Status

Work in progress.  
I will continue improving the mapping as I discover issues or new ideas.

---

## Author

ElHanko

---

## License

MIT