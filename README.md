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
other paths are left unchanged. Linking Extended does not activate it.

### Manual setup

If you do not want to use symlinks:

1. Copy `controllers/Pioneer-DDJ-FLX4-2.0.midi.xml` and
   `controllers/Pioneer-DDJ-FLX4-2.0.script.js` to your Mixxx `controllers/` directory.
2. Restart Mixxx.

Basic Beat FX uses the existing Mixxx EffectUnit1 configuration and requires no
custom chains. The supplied chains support the optional Extended workflow.

### Enable Extended manually (advanced / developer setup)

Basic alone is the default. To test or use Extended, first ensure
`Pioneer-DDJ-FLX4-extended-scripts.js` is present in the active profile's
`controllers/` directory. For the repository/symlink setup, rerun
`./setup-mixxx-links.sh` so it is also linked in `~/.mixxx/controllers/` and
`~/.mixxx-test/controllers/`. For manual setup, copy the Extended script there.

In `Pioneer-DDJ-FLX4-2.0.midi.xml`, add Extended **after Basic** inside
`<scriptfiles>`:

```xml
<scriptfiles>
    <file filename="Pioneer-DDJ-FLX4-2.0.script.js"
          functionprefix="PioneerDDJFLX4"/>
    <file filename="Pioneer-DDJ-FLX4-extended-scripts.js"
          functionprefix=""/>
</scriptfiles>
```

Extended deliberately uses `functionprefix=""` and shares Basic's global
`PioneerDDJFLX4` namespace. It wraps Basic's init/shutdown; there is no second
lifecycle. Basic must load first, followed by Extended in the same script engine.

Fully exit and restart Mixxx after changing the XML. To disable Extended,
remove the second `<file>` entry and restart Mixxx again. With symlink setup,
editing the profile's XML edits the repository file and affects both linked
profiles. Keep this local activation change out of the default repository XML.
This is the current manual activation path; a dedicated Extended installer is
not provided.

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
