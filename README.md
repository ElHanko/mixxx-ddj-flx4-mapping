# Pioneer DDJ-FLX4 × Mixxx

**Your controller. Your workflow. Your Mixxx.**

Bring your FLX4 into the mix with hands-on looping, cue performance and effects.
**Basic** pairs familiar deck control with Hotcue Pitch Play and native Mixxx
Beat FX. **Extended** builds on the same mapping for a workflow centred on
Stems, Pad FX and custom Beat FX presets.

[Choose your workflow](#basic-vs-extended) · [Get started](#quick-start) · [Explore the controls](CONTROLS.md)

## Make it your set

### Hands-on mixing

- **Work the decks:** transport, jog and scratch control, beat alignment and
  Sync lock, plus loops you can adjust with the jog wheels.
- **Instant Doubles:** double-press LOAD to bring the opposite deck's track
  across at its current position.
- **Read the controller:** cue, loop, sampler and effect LEDs show what's
  active; VU meters include peak hold.

### Creative performance

- **Four Hotcue banks, up to 32 cues:** mark more moments in a track. Hold a
  stopped-deck cue to preview it, then press PLAY to keep it running.
- **Play with pitch:** Basic's Keyboard mode turns a selected Hotcue into
  pitched pad performances. Sampler and Key Shift are available in both variants.
- **Mix with Stems:** Extended replaces Keyboard mode with stem mute, isolate
  and momentary solo, and adds stem-volume control on SHIFT + EQ.

### Effects & control

- **Basic Beat FX:** select and control native Mixxx effects from the Beat FX
  section, using your existing effect setup.
- **Extended Beat FX and Pad FX:** browse Echo, Reverb, Trans, Flanger and Phaser
  presets, and control effect slots and routing from Pad FX1 / FX2.
- **Smart CFX in both variants:** toggle Mixxx QuickEffect and cycle its presets
  with SHIFT. Extended also adds Quantize/Keylock shortcuts and Reloop/Exit.

## Basic vs. Extended

Choose around the way you play. Basic works on its own, with no custom effect
chains to manage. Extended keeps the shared deck controls and changes selected
controls for stem and effect performance.

| Control / workflow | Basic | Extended |
| --- | --- | --- |
| Mapping | Standalone; default installation | Builds on Basic; optional preset |
| SHIFT + HOT CUE | Keyboard Hotcue Pitch Play | Stems: mute, isolate and momentary solo |
| SHIFT + EQ | Ordinary EQ | Stem volume |
| Pad FX1 / FX2 | Unassigned | Effect slots, unit enable and routing |
| Beat FX | Native Mixxx effects | Custom preset groups and variants |
| SHIFT + Channel CUE | BPM Tap | Short press: Quantize; hold: Keylock |
| SHIFT + 4BEAT/EXIT | Unassigned | Reloop/Exit for the stored loop |
| SHIFT + SYNC tempo ranges | ±6 / 10 / 16 / 25% | ±8 / 16 / 32 / 64 / 100% |
| Additional effect chains | Not required | Supplied chains required |

Both include Hotcue banking, Sampler, Key Shift, Beat Jump, Beat Loop, Instant
Doubles and Smart CFX. For jog/Vinyl differences and every button combination,
see the [full control reference](CONTROLS.md).

## Quick Start

You need a **Pioneer DDJ-FLX4** and **Mixxx 2.6 or newer**. Mixxx 2.5 and older
are not supported.

### Linux: start with Basic

Clone the repository and install Basic:

```bash
git clone https://github.com/ElHanko/mixxx-ddj-flx4-mapping.git
cd mixxx-ddj-flx4-mapping
./setup-mixxx-links.sh
```

Fully exit and restart Mixxx, then select **Pioneer DDJ-FLX4 (Basic)** in the
controller settings and enable the controller.

The Bash script links the mapping and supplied effect chains into the Linux
profiles `~/.mixxx` and `~/.mixxx-test`. This command creates no Extended XML;
linking the Extended script alone does not activate it. Keep the repository in
place so the links keep working.

<a id="enable-extended-manually-advanced--developer-setup"></a>

### Linux: add the Extended preset

From the already cloned `mixxx-ddj-flx4-mapping` directory, run the following
command to install both Basic and Extended (Python 3 is also required):

```bash
./setup-mixxx-links.sh --extended-copy
```

After fully exiting and restarting Mixxx, select **Pioneer DDJ-FLX4 (Basic)**
or **Pioneer DDJ-FLX4 (Extended)** in the controller settings. Switch back to
Basic whenever you want its Pitch Play and native Beat FX workflow.

### Manual setup / other platforms

Copy `controllers/Pioneer-DDJ-FLX4-2.0.midi.xml` and
`controllers/Pioneer-DDJ-FLX4-2.0.script.js` into the `controllers/` directory of
your active Mixxx user profile. Restart Mixxx and select the Basic preset.

The script's automatic profile paths are Linux-specific; use your platform's
Mixxx profile location for manual installation. On Windows or macOS, you can
create the Extended preset yourself:

<details>
<summary>Install Extended manually</summary>

1. In your profile's `controllers/` directory, copy
   `Pioneer-DDJ-FLX4-2.0.midi.xml` as `Pioneer-DDJ-FLX4-2.0-Extended.midi.xml`.
   Keep the Basic XML unchanged.
2. Open the new copy in a text editor and change the name inside `<info>` to
   `<name>Pioneer DDJ-FLX4 (Extended)</name>`.
3. Inside `<scriptfiles>`, add this entry **after the Basic script**:

   ```xml
   <file filename="Pioneer-DDJ-FLX4-extended-scripts.js" functionprefix="" />
   ```

   Basic must load first, followed by Extended with `functionprefix=""`.
4. Ensure both `Pioneer-DDJ-FLX4-2.0.script.js` and
   `Pioneer-DDJ-FLX4-extended-scripts.js` from the repository's `controllers/`
   directory are in your profile's `controllers/` directory.
5. Copy all supplied files from `effects/chains/` into your profile's
   `effects/chains/` directory. Keep the numbered Beat FX presets in their
   required order; see [Advanced / Technical Notes](#advanced--technical-notes).
6. Fully exit and restart Mixxx, then select **Pioneer DDJ-FLX4 (Extended)** in
   the controller settings.

</details>

## Documentation

| Guide | What you'll find |
| --- | --- |
| [Controls](CONTROLS.md) | Complete button layout, pad modes and performance workflows |
| [Configuration](CONFIGURATION.md) | Options for cues, loops, jog feel, Stems and more |
| [Changelog](CHANGELOG.md) | Changes and project history |
| [Mixxx manual contribution](https://github.com/ElHanko/manual/blob/feat/flx4-controller-doc/source/hardware/controllers/pioneer_ddj_flx4.md) | Companion controller guide in the manual contribution branch |

## Advanced / Technical Notes

Extended uses the supplied effect chains. Its **14 numbered Beat FX presets
must retain their fixed order**. Basic has no dependency on these presets.

Rerun `./setup-mixxx-links.sh --extended-copy` after changing the Basic XML to
refresh the local Extended presets. The repository's Basic XML stays unchanged.

<details>
<summary>Effect-chain setup and current limitations</summary>

- Install all supplied files from `effects/chains/`.
- Keep the `01_` through `14_` filenames and chain names unchanged, and keep all
  14 presets installed.
- Additional presets must not sort before or between those numbered presets.
  Extended selects by fixed preset positions; changing their order can make
  FX SELECT and BEAT LEFT / RIGHT load a different effect.
- Manual preset changes in the Mixxx GUI can also put Extended's remembered
  group/variant out of step. A dedicated profile such as `.mixxx-test` is useful
  when your other effect chains conflict with the required order.
- Extended starts with Vinyl OFF and currently has no controller binding to
  toggle it. Scratch is available while stopped; platter movement bends pitch
  during playback with Vinyl OFF. The optional brake/soft-start implementation
  requires Vinyl ON and is disabled by default. See [Configuration](CONFIGURATION.md).

</details>

<details>
<summary>Installed files, updates and conflict handling</summary>

The normal installation recursively links `controllers/` and `effects/` into
both profiles. The controller links include the Basic XML, Basic JavaScript
and Extended JavaScript. Rerun the script when repository files are added.

Existing regular files are protected and reported with a warning. Existing
symlinks at matching repository-file paths are replaced, even if they point
elsewhere; check those paths before installing. Files at unrelated paths are
left alone. Check any reported conflicts before using the mapping.

With `--extended-copy`, the normal installation runs first. It then writes
`Pioneer-DDJ-FLX4-2.0-Extended.midi.xml` as a **regular file** in each profile's
`controllers/` directory. Basic loads first; the Extended script follows with
`functionprefix=""`, sharing Basic's namespace.

A generated-file comment identifies the script's own copies. Repeating the
command refreshes those copies and replaces their local edits. Foreign files,
directories and symlinks at the Extended XML paths cause an error and remain
unchanged. The normal symlink rules above still apply to the other installed
files. The Basic source XML and its linked contents are never edited by
Extended generation.

To remove the additional preset, delete only the generated Extended XML from
both profiles and restart Mixxx. To keep it installed but use Basic, select
the Basic preset instead.

</details>

## Project & Credits

A community mapping for Mixxx, actively developed through real-world use.
Basic and Extended have both been tested on a real DDJ-FLX4. This project is
independent of Pioneer DJ / AlphaTheta.

Created and maintained by **ElHanko**. Parts of the mapping derive from the
existing Mixxx DDJ-FLX4 mapping; **Robert904** is credited alongside ElHanko in
the XML, and original attribution remains in the mapping files.

License: [MIT](LICENSE).
