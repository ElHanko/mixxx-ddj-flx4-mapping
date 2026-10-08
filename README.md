# Mixxx Pioneer DDJ-FLX4 Mapping

Basic controller mapping for the Pioneer DDJ-FLX4 with Mixxx, with an optional
Extended overlay. The supplied XML loads Basic alone.

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

The script links files recursively from `controllers/` and `effects/`, including
`Pioneer-DDJ-FLX4-extended-scripts.js`. Run it again after new repository files
are added. Both profiles' `controllers/` directories should contain links to:

- `Pioneer-DDJ-FLX4-2.0.script.js`
- `Pioneer-DDJ-FLX4-2.0.midi.xml`
- `Pioneer-DDJ-FLX4-extended-scripts.js`

Existing regular files are left unchanged, with a warning if they block a
project file. Existing symlinks at matching project paths are replaced, even
if they point elsewhere; check those paths before running the script. Files at
other paths are left unchanged. Linking Extended does not activate it. This
default command creates no Extended XML; Basic remains the default mapping.

### Optional Extended preset

To install Basic and Extended as separate presets, run:

```bash
./setup-mixxx-links.sh --extended-copy
```

This first performs the normal symlink installation, then generates
`Pioneer-DDJ-FLX4-2.0-Extended.midi.xml` as a regular file in both
`~/.mixxx/controllers/` and `~/.mixxx-test/controllers/`. The repository's Basic
XML and its symlinks are unchanged.

Fully exit and restart Mixxx. You can then select either **Pioneer DDJ-FLX4
(Basic)** or **Pioneer DDJ-FLX4 (Extended)** in the controller settings. The
Extended preset loads Basic first, followed by the Extended script with
`functionprefix=""`; both scripts use the same global namespace.

Run `./setup-mixxx-links.sh --extended-copy` again after changes to the Basic
XML to refresh both Extended copies. A generated-file comment identifies copies
owned by the script. Their local edits are replaced on regeneration; existing
foreign files, directories and symlinks at the Extended XML paths cause an error
and are left unchanged. The normal installation's symlink behavior described
above still applies to controller scripts and effect chains.

To disable Extended, select the Basic preset. To remove the additional preset,
delete only the generated `Pioneer-DDJ-FLX4-2.0-Extended.midi.xml` files from
both profiles and restart Mixxx.

### Manual setup

If you do not want to use symlinks:

1. Copy `controllers/Pioneer-DDJ-FLX4-2.0.midi.xml` and
   `controllers/Pioneer-DDJ-FLX4-2.0.script.js` to your Mixxx `controllers/` directory.
2. Restart Mixxx.

Basic Beat FX uses the existing Mixxx EffectUnit1 configuration and requires no
custom chains. The supplied chains support the optional Extended workflow.

## Repository layout

```text
.
├── controllers/
│   ├── Pioneer-DDJ-FLX4-2.0.midi.xml
│   ├── Pioneer-DDJ-FLX4-2.0.script.js
│   └── Pioneer-DDJ-FLX4-extended-scripts.js
├── effects/
│   └── chains/
├── setup-mixxx-links.sh
├── CONTROLS.md
├── CONFIGURATION.md
└── CHANGELOG.md
```

- `controllers/` contains the MIDI routing and JavaScript implementation.
- `effects/chains/` contains the presets used by Beat FX and Smart CFX.
- `setup-mixxx-links.sh` installs symlinks and optionally generates an Extended preset.
- [`CONTROLS.md`](CONTROLS.md) is the complete control reference.
- [`CONFIGURATION.md`](CONFIGURATION.md) documents script configuration.
- [`CHANGELOG.md`](CHANGELOG.md) contains the version history.

## Features

- Script-driven LED handling based on Mixxx engine state
- Deterministic button behavior without implicit toggle assumptions
- Centralized pad-mode logic
- Simple and stateful loop workflows with jog-based adjustment
- Four hotcue banks with up to 32 hotcues
- Optional Extended Pad FX1 and Pad FX2 layers
- Basic Mixxx Beat FX; optional Extended preset groups and variants
- Sampler LEDs with off, solid and blinking states
- Keyboard Hotcue Pitch Play, with fresh Hotcue selection on every entry;
  optional Extended STEMS replacement
- Keyshift pads with semitone mapping
- Instant doubles through LOAD double press
- Configurable browser focus behavior
- BPM Tap on SHIFT + Channel CUE; Extended Quantize/Keylock short and long press
- Basic 4BEAT/EXIT starts a new four-beat loop at the current position or exits
  the active loop; Basic SHIFT + 4BEAT/EXIT has no action
- Extended SHIFT + 4BEAT/EXIT provides CDJ-style Reloop/Exit
- SHIFT + SYNC cycles Basic tempo ranges ±6/10/16/25% or Extended ±8/16/32/64/100%
- Extended Vinyl Toggle currently has no controller binding; choosing one
  remains an open design decision
- Extended optional vinyl brake and soft-start behavior on PLAY
- Script-controlled VU meters with peak hold
- Extended SHIFT-based stem volume on EQ knobs with per-mode soft takeover

## Extended Beat FX preset order

Extended Beat FX selection intentionally uses fixed absolute preset positions.
The existing custom workflow relies on those positions rather than selecting
chain presets by name. Basic does not use this preset order.

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

The setup script preserves existing regular files. Any reported filename
conflict must therefore be checked manually; matching symlinks are replaced.

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

The current Basic/Extended split has been tested successfully on a real
DDJ-FLX4: Basic transport/loops, Keyboard Pitch Play and SHIFT + Channel CUE BPM
Tap, plus Extended overlay loading, Stems/overrides and SHIFT + 4BEAT Reloop/Exit.

## Author

ElHanko

## License

[MIT](LICENSE)
