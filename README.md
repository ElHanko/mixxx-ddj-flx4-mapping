# Mixxx Pioneer DDJ-FLX4 Mapping

Custom Mixxx controller mapping for the Pioneer DDJ-FLX4.

This mapping started from the official FLX4 mapping but has been heavily modified
and partially rewritten.

The goal is a workflow that feels closer to standalone Pioneer players
while still taking advantage of Mixxx features.

---

## Requirements

This mapping targets **Mixxx 2.6 or newer**.

Older versions of Mixxx (e.g. 2.5) are not supported.

---

## Repository Structure

```
controllers/
  Pioneer-DDJ-FLX4-2.0.midi.xml
  Pioneer-DDJ-FLX4-2.0.script.js

CONTROLS.md
CONFIGURATION.md
CHANGELOG.md
```

* `controllers/` – actual mapping files
* `CONTROLS.md` – detailed controller behavior
* `CONFIGURATION.md` – script options
* `CHANGELOG.md` – version history

---

## Documentation

This repository contains the mapping implementation.

The full controller documentation is maintained separately:

https://github.com/ElHanko/manual/blob/feat/flx4-controller-doc/source/hardware/controllers/pioneer_ddj_flx4.rst

Additional documentation in this repository:

* `CONTROLS.md` – control behavior reference
* `CONFIGURATION.md` – configurable options
* `CHANGELOG.md` – project history

---

## Features

* Improved Beat FX behaviour
* PAD FX1 / PAD FX2 implementation
* Sampler LED state machine
* Keyshift pad mode
* Instant doubles
* Browser focus control
* Quantize / Keylock shortcuts
* Vinyl mode toggle via **SHIFT + 4BEAT/EXIT**
* Optional vinyl brake / soft-start behavior on PLAY
* Banked hotcue system (up to 32 hotcues)
* Script-driven LED logic

---

## Status

Work in progress.

This mapping is actively used and updated when issues are found
or improvements are identified.

---

## Author

ElHanko

---

## License

MIT
