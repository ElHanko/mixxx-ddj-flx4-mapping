# Mixxx Pioneer DDJ-FLX4 Mapping

Custom controller mapping for using the Pioneer DDJ-FLX4 with Mixxx.

The mapping replaces large parts of the stock FLX4 mapping with script-driven
logic for deterministic control flow and LED feedback based on Mixxx engine
state.

## Requirements

- Mixxx 2.6 or newer
- Pioneer DDJ-FLX4

Mixxx 2.5 and older versions are not supported.

## Installation

### Automated setup

After cloning the repository, run:

```bash
./setup-mixxx-links.sh
```

The script links the controller mapping and effect chains into both supported
user profiles:

- `~/.mixxx`
- `~/.mixxx-test`

Existing regular files and unrelated controller or effect files are left
unchanged. If a project file conflicts with an existing file, the script prints
a warning and skips that file.

### Manual setup

If you do not want to use symlinks:

1. Copy the files from `controllers/` to your Mixxx `controllers/` directory.
2. Copy the XML files from `effects/chains/` to your Mixxx `effects/chains/`
   directory.
3. Restart Mixxx.

The supplied effect chains are required for the intended Beat FX behavior.

## Repository layout

```text
.
├── controllers/
│   ├── Pioneer-DDJ-FLX4-2.0.midi.xml
│   └── Pioneer-DDJ-FLX4-2.0.script.js
├── effects/
│   └── chains/
├── setup-mixxx-links.sh
├── CONTROLS.md
├── CONFIGURATION.md
└── CHANGELOG.md
```

- `controllers/` contains the MIDI routing and JavaScript implementation.
- `effects/chains/` contains the presets used by Beat FX and Smart CFX.
- `setup-mixxx-links.sh` installs the mapping through symlinks.
- [`CONTROLS.md`](CONTROLS.md) is the complete control reference.
- [`CONFIGURATION.md`](CONFIGURATION.md) documents script configuration.
- [`CHANGELOG.md`](CHANGELOG.md) contains the version history.

## Features

- Script-driven LED handling based on Mixxx engine state
- Deterministic button behavior without implicit toggle assumptions
- Centralized pad-mode logic
- Simple and stateful loop workflows with jog-based adjustment
- Four hotcue banks with up to 32 hotcues
- Custom Pad FX1 and Pad FX2 layers
- Beat FX groups with variant selection
- Sampler LEDs with off, solid and blinking states
- STEMS mode on the Keyboard layer
- Keyshift pads with semitone mapping
- Instant doubles through LOAD double press
- Configurable browser focus behavior
- Shared Quantize and Keylock control with short and long press
- Vinyl mode toggle through **SHIFT + 4BEAT/EXIT**
- Optional vinyl brake and soft-start behavior on PLAY
- Script-controlled VU meters with peak hold
- Shift-based stem volume control on the EQ knobs with per-mode soft takeover

## Beat FX preset order

Beat FX selection intentionally uses fixed absolute preset positions. This is
required because Mixxx does not provide the mapping with a reliable way to
select these chain presets by name.

For correct Beat FX behavior:

- Install all effect chains supplied in `effects/chains/`.
- Keep the `01_` through `14_` filenames and chain names unchanged.
- Do not remove individual Beat FX presets.
- Ensure additional chain presets do not sort before or between the supplied
  `01_` through `14_` presets.

Adding, removing or renaming presets can shift their absolute positions. In
that case, FX SELECT and the BEAT LEFT / RIGHT buttons may load a different
effect than documented. A dedicated Mixxx profile such as `.mixxx-test` is
recommended when other custom chain presets would conflict with this order.

The setup script preserves existing files. Any reported filename conflict must
therefore be checked manually.

## Documentation

The implementation, behavior and configuration are documented in this
repository:

- [Controller reference](CONTROLS.md)
- [Configuration reference](CONFIGURATION.md)
- [Version history](CHANGELOG.md)

Additional controller documentation is maintained in the
[Mixxx manual contribution](https://github.com/ElHanko/manual/blob/feat/flx4-controller-doc/source/hardware/controllers/pioneer_ddj_flx4.rst).

## Status

This mapping is a work in progress. It is actively used and updated based on
real-world use, identified inconsistencies and Mixxx engine changes.

## Author

ElHanko

## License

[MIT](LICENSE)
