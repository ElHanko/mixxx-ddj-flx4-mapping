# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Added configurable stopped-deck Hot Cue behavior (`preview`, `goto`, `play`) while keeping `preview` as the default.
- Shift-based stem volume control on EQ knobs
  - Shift + LOW controls drums + bass stem volume
  - Shift + MID controls melody / instruments stem volume
  - Shift + HIGH controls vocals stem volume
- `setup-mixxx-links.sh` for linking mapping assets into Mixxx user directories
- Support for linking assets into multiple Mixxx directories
- C_Noise sweep effect for Beat FX

### Changed
- EQ knobs are now routed through script handlers instead of direct XML EQ bindings
- EQ / stem handling now uses 14-bit script-side routing
- Scratch feel improved by increasing `scratchScale`
- Shift + jog search now uses the configurable `jogSearchScale` and `shiftSearchTouchMultiplier` values
- Removed obsolete seek-scratch configuration and unreachable seek-scratch state
- Setup and control documentation updated to reflect current EQ/stem and setup behavior

### Fixed
- Added required script binding for EQ script handlers
- Reset soft takeover state when switching between EQ and stem mode
- Stop and reset all mapping-owned timers during controller shutdown
- Restored loop adjust behavior in `jogTurn`
- Made vinyl mode deterministic and forced startup with vinyl off
- Setup script now handles directories correctly when linking Mixxx assets
- Prevented instant double from overwriting the playing deck
- Swapped Smart CFX normal and shift behavior to match intended workflow
- Made shift jog search controllable via playposition scaling
- Switched shift jog search to `playposition`-based behavior and bound shift touch correctly

### Documentation
- Updated README setup instructions
- Reformatted and reorganized the README
- Updated EQ/stem control documentation
- Documented setup script usage and current control behavior
- Corrected loop-adjust step and timeout configuration descriptions
- Documented the fixed Beat FX preset-order requirement and conflict behavior
- Aligned browser, Shift+LOAD and loop-call documentation with script behavior

### Repository / Setup
- Setup script is tracked as executable


## [v1.1]

### Added
- Optional vinyl brake and soft start on PLAY button
- Configurable brake and soft start factors
- Split controller documentation into controls and configuration reference

### Changed
- Set default vinyl brake mode
- Declared Mixxx 2.6 as the required version
- Simplified README and moved detailed configuration into `CONFIGURATION.md`

### Fixed
- Deck 2 play button now uses script binding correctly

### Documentation
- Documented optional vinyl brake behavior
- Added detailed documentation for user configuration options
- Added contributing guidelines
- Simplified public repository `.gitignore`


## [v1.0]

Initial public release of the custom Pioneer DDJ-FLX4 mapping.

### Added
- Initial public project structure
- Project README
- MIT license
- Initial changelog
- Mapping files moved into `controllers/`

### Core controller features
- Custom Beat FX system with per-deck routing, preset handling, LED feedback and rotary control
- Smart CFX control with active LED feedback and shift-layer preset cycling
- Script-based loop system with unified loop LED handling and reloop/exit logic
- Stateful jog scratch / bend handling with loop-adjust priority
- Per-deck vinyl mode handling via hardware command
- Keyboard / stems pad mode state tracking and LED refresh
- Direct-engine beatjump mapping
- PAD FX bindings and sampler pad handling
- Long-press and double-press actions for selected controls
- Configurable browse focus behavior
- Instant doubles via LOAD double press
- Quantize / keylock and cue / loop workflow improvements

### Improved
- Waveform zoom behavior
- Beat sync logic and tempo range cycling
- VU meter scaling, LED zones and peak hold behavior
- Sampler pad LED handling and sampler state logic
- Header structure and internal script organization
- Controller shutdown cleanup and timer handling

### Fixed
- Stem mute error on track load
- Beat FX routing and shift handling
- Loop adjust checks and browse press robustness
- XML formatting and minor mapping corrections

### Documentation
- README and controller documentation added and refined
