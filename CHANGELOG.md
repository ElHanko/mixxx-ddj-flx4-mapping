# Changelog

## Unreleased

### Added

- Optional vinyl brake / soft start behaviour for the PLAY button when Vinyl Mode is active
- Config flag `PLAY_BRAKE_ON_VINYL` to enable or disable this behaviour

### Documentation

- Documented optional vinyl brake behaviour in the README

## v1.0

Initial public GitHub release of the custom Pioneer DDJ-FLX4 mapping.

This mapping started from the original Mixxx FLX4 mapping but has been
heavily modified and partially rewritten to match a different workflow
and controller behaviour.

### Major changes

- Reworked Beat FX system with proper routing, LED feedback and
  improved on/off behaviour
- PAD FX implementation inspired by Hercules-style workflow
- Complete sampler pad LED state machine
- Refactored jogwheel handling and scratch logic
- Reworked loop handling and loop LED behaviour
- Reworked VU meter scaling with proper FLX4 LED zones and peak hold
- Keyshift pad mode improvements
- Beatjump logic aligned with direct engine mapping
- Vinyl mode toggle support via controller command

### Controller behaviour improvements

- Consistent pad mode behaviour across:
  - Beatjump
  - Beatloop
  - Sampler
  - Pad FX
  - Keyshift
  - Stems
- Improved LED synchronization with Mixxx state
- Proper initialization of LEDs and controller state
- Improved shutdown cleanup (timers and LEDs)

### Library / browsing improvements

- Improved BROWSE behaviour
- Optional focus toggle between sidebar and track list
- Tree expansion via dedicated control
- Library maximize moved to SHIFT + LOAD

### Performance / workflow improvements

- Instant doubles via LOAD double press
- Long press actions for several controls
- Quantize / Keylock shortcut handling
- Reloop fallback logic for Cue/Loop Call
- Cleaner tempo range handling
- Improved waveform zoom behaviour

### Internal refactoring

- Large parts of the original FLX4 script replaced or rewritten
- Cleaner controller initialization logic
- More reliable LED state synchronization
- Improved error handling and script stability

### Repository changes

- Mapping moved to GitHub
- Added README
- Added MIT license
- Added project structure with `controllers/` directory
