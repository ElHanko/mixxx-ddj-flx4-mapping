# AGENTS.md — Pioneer DDJ-FLX4 Mixxx Mapping

## Scope

These instructions apply to the entire repository.

This repository contains the actively developed Pioneer DDJ-FLX4 controller
mapping for Mixxx. The long-term goal is to contribute a reviewed variant as a
complete replacement for the DDJ-FLX4 mapping currently shipped with Mixxx.

The repository is **not** merely a staging area for an upstream patch. `main`
remains the canonical standalone/development version of the mapping.

## Human ownership and AI-assistance policy

This project may use Codex or other AI tools as an assistant for analysis,
refactoring, code generation, documentation, and review.

For work intended for Mixxx upstream, follow Mixxx's current AI-agent policy:

- Do not autonomously create, update, reopen, or submit pull requests.
- Do not autonomously create, update, or reopen issues, bug reports, or feature
  requests.
- Do not autonomously reply to Mixxx pull-request review comments.
- Do not autonomously `git commit` or `git push` changes intended for upstream.
- The human contributor must review and deliberately approve the final changes.
- Functional controller changes must be tested by a human with the real
  DDJ-FLX4 and a real DJ setup before upstream submission.
- Text written autonomously by an AI agent for an upstream PR, commit-message
  body, code comment, or documentation must follow the disclaimer requirements
  in the current Mixxx `AGENTS.md`.

When working only in this repository, edit files when explicitly asked, but do
not commit, push, create branches, or publish anything unless the human user
explicitly requests that action.

## Repository / branch model

### `main`

`main` is the complete standalone and development version.

Changes belong in `main` when they are generally beneficial and do not exist
only to satisfy upstream packaging or policy. Examples:

- ES7 / Mixxx runtime compatibility fixes
- bug fixes
- lint fixes
- removal of dead code
- timer / connection cleanup
- clearer internal structure
- safer state handling
- concise, useful comments
- removal of temporary development notes
- documentation corrections
- refactors that intentionally preserve behavior

Do not deliberately reduce functionality in `main` merely to make a future
Mixxx pull request smaller.

### `mixxx-pr`

A persistent `mixxx-pr` branch will be created from a cleaned-up `main`.

It contains only changes that are specifically required or deliberately chosen
for the upstream Mixxx version, for example:

- upstream metadata
- upstream file naming / paths
- removal of standalone branding such as `(Custom)`
- upstream-specific defaults
- upstream-specific packaging decisions
- behavior changes requested or justified specifically for inclusion in Mixxx

General fixes should normally be made in `main` first and then merged into
`mixxx-pr`.

Prefer:

```text
main -> fix/refactor -> merge into mixxx-pr
```

Do not let `mixxx-pr` become an independently maintained second implementation.

### Mixxx fork

The final Mixxx pull-request branch is prepared separately in the user's fork of
`mixxxdj/mixxx`.

The intended controller replacement paths are:

```text
res/controllers/Pioneer-DDJ-FLX4.midi.xml
res/controllers/Pioneer-DDJ-FLX4-script.js
```

The current Mixxx 2.6 mapping already uses those paths and the function prefix
`PioneerDDJFLX4`.

The preferred final Mixxx commit should represent the finished mapping
replacement, not the entire development history of this standalone repository.

## Upstream target

Unless explicitly changed by the human contributor, evaluate upstream
compatibility against the Mixxx `2.6` branch.

Do not silently switch the target to `main`, `2.5`, or another branch.

When a Mixxx rule differs between branches, the target branch is authoritative
for technical checks that affect that branch.

## JavaScript runtime compatibility

Mixxx controller mappings run in `QJSEngine`.

For Mixxx 2.4+ the documented scripting target is ES7, excluding ES6 modules.

The Mixxx `2.6` ESLint configuration explicitly uses:

```text
ecmaVersion: 7
sourceType: script
```

Therefore:

- Do not introduce JavaScript syntax newer than ES7.
- Do not use ES modules (`import`, `export`).
- Optional chaining (`?.`) is not allowed.
- Nullish coalescing (`??`) is not allowed.
- Check all new syntax against ES7 rather than assuming that a modern Node.js or
  browser feature is available.
- Do not rely on Node.js APIs or browser DOM APIs.
- Use Mixxx-provided controller APIs only where they are actually available in
  the targeted Mixxx version.

Compatibility changes that preserve intended behavior belong in `main`.

## ESLint and JavaScript style

The Mixxx target branch's `eslint.config.cjs` is the primary machine-readable
source of truth for JavaScript linting.

For Mixxx 2.6 it includes, among other rules:

- `eqeqeq`: error
- function-expression style: error
- unused variables: error
- atomic-update checks: error
- 4-space indentation: warning
- `curly`: warning
- Unix line endings
- semicolons
- double-quote preference
- `no-var`: warning
- `prefer-const`: warning

Important: older Mixxx wiki text contains some JavaScript style guidance that
predates the current ESLint configuration. If an old prose convention conflicts
with the target branch's actual ESLint rules, do not blindly rewrite code to
satisfy the older convention. Report the conflict and prefer the current target
branch's executable lint configuration unless a maintainer has explicitly said
otherwise.

General rules:

- Use `===` and `!==`, not `==` and `!=`.
- Use braces around control-flow bodies.
- Avoid one-line functions and dense one-line conditionals.
- Use 4 spaces; do not use tabs.
- Avoid accidental globals.
- Keep names readable and consistent.
- Keep comments concise and explain *why*, especially for hardware quirks.
- Remove chat-like, AI-like, temporary, or personal development notes before
  upstream submission.
- For upstream-facing code, comments and identifiers should be clear English.
- Do not mass-reformat unrelated code.
- Do not perform broad stylistic rewrites while fixing a specific bug unless
  explicitly asked.

## Components JS and JSDoc

Current Mixxx `CONTRIBUTING.md` says controller mapping scripts should use the
Components JS library and JSDoc comments.

Treat this as an important upstream review requirement.

However, this project replaces an existing FLX4 mapping with a substantial
working implementation. Do **not** autonomously rewrite the complete mapping to
Components JS merely because the guideline exists.

Instead:

1. identify where the current implementation differs from current guidance;
2. determine whether the difference is local or architectural;
3. propose a migration only when it has a concrete maintainability or upstream
   benefit;
4. preserve behavior;
5. leave broad architectural rewrites for explicit human approval.

Do not label the whole mapping invalid solely because legacy/non-Components
patterns remain.

## XML mapping rules

For the MIDI XML:

- Keep the document valid XML.
- Preserve the correct script file and `functionprefix` relationship.
- Organize controls and outputs in a logical, maintainable order.
- Do not leave mappings in arbitrary MIDI-learn generation order.
- Use meaningful descriptions for non-obvious mappings.
- Keep script bindings synchronized with the JavaScript implementation.
- Check for duplicate, unreachable, stale, or conflicting bindings.
- Preserve required soft-takeover behavior.
- Do not mass-reorder or mass-format the entire XML unless asked or necessary.
- Use `xmllint` for validation when available.

For the upstream variant, use the existing official DDJ-FLX4 identity instead
of creating a parallel custom controller entry.

Current Mixxx 2.6 upstream metadata/path expectations include:

```text
name: Pioneer DDJ-FLX4
controller id: DDJ-FLX4
functionprefix: PioneerDDJFLX4
script: Pioneer-DDJ-FLX4-script.js
manual: pioneer_ddj_FLX4
```

Do not change these merely to follow a generic or older filename example if the
existing official mapping already establishes the upstream name.

## Mapping design guidelines

Mixxx describes its controller design guidance as general guidelines, not
absolute rules.

Use them as review criteria, not as excuses to remove useful functionality.

### Hardware labels

Controls should generally perform the function suggested by their hardware
labels.

Additional or improved behavior is allowed when it makes sense for Mixxx, but
do not sacrifice important labeled hardware functionality merely to add a
secondary feature.

### User-configurable options

- Put user-facing configuration options in a clearly discoverable place.
- Explain what each option changes.
- Keep the number of options reasonable.
- Prefer one good behavior when there is a clearly superior default.
- Keep an option where genuinely different valid workflows exist.

Do not remove an option only because options are discouraged in general.
Evaluate the actual trade-off.

### Layers and Shift functions

Layering is allowed and can be useful.

Avoid making the controller unnecessarily confusing.

Mixxx specifically cautions against alternate functions on finite faders and
knobs because physical positions no longer directly represent the controlled
value. Buttons, pads, encoders, and touch controls have less of this problem.

For shifted knob/fader behavior, explicitly review:

- pickup / soft takeover
- state transitions
- value jumps
- discoverability
- whether the alternate function is justified by hardware limitations

The existing Shift+EQ stem-volume workflow is therefore a design-review topic,
not an automatic removal candidate.

### LEDs

- Do not make LEDs blink continuously without a temporary-state reason.
- Do not add beat-synchronized blinking merely as decoration.
- Play and Cue LEDs should follow Mixxx's corresponding indicator controls where
  applicable so hardware state matches the GUI.
- Temporary-state blinking may be acceptable when it clearly communicates a
  transient mode.

### Level meters

Controller meters should correspond meaningfully to Mixxx's on-screen level
meters.

In particular, red peak LEDs should correspond to clipping / `PeakIndicator`.
Do not claim the current implementation complies until its actual scaling and
peak behavior have been checked.

### Samplers

Mixxx's preferred sampler behavior is:

- empty pad: load selected track
- loaded pad: play/retrigger from cue
- Shift + pad while playing: stop
- Shift + pad while loaded and stopped: eject

If this mapping intentionally adds long-press behavior or another workflow,
compare it against this baseline and explain the UX benefit. Do not remove it
without evaluating the actual implementation.

## Feature-preservation rule

This project is intended to become a **complete replacement mapping**, not a
minimal incremental patch.

Do not recommend removing a feature merely because:

- the pull request is large;
- the stock FLX4 mapping does not already have it;
- it is implemented in JavaScript;
- it adds a layer;
- it requires nontrivial state;
- it would be easier to review without it.

Features currently considered part of the intended mapping include, among
others:

- 32 Hotcues / multiple hotcue banks
- Stems
- Pad FX1 / Pad FX2
- Beat FX
- Beat Jump
- Key Shift
- Smart CFX behavior
- per-deck Vinyl behavior
- Instant Doubles
- loop workflows
- VU / peak-hold behavior
- deterministic LED state
- TRIM / CFX hardware workaround
- scratch / jog behavior
- Shift+EQ stem-volume control
- configurable behavior where justified

If a feature is considered problematic, state the exact reason and classify it
as one of:

- runtime / compatibility problem
- lint / code-quality problem
- concrete Mixxx guideline conflict
- robustness problem
- UX/design concern
- documentation problem
- packaging problem

Then propose the smallest change that resolves the concrete issue.

## Beat FX / effect-chain special case

The mapping currently relies on custom effect-chain presets.

Treat Beat FX as a specific architecture review item.

Check:

- how presets are selected;
- whether selection relies on absolute numeric indexes;
- assumptions about sorting or preset order;
- interactions with user-created presets;
- behavior when expected presets are missing;
- whether bundled Mixxx effect chains can satisfy the workflow;
- whether the Mixxx 2.6 controller API offers a more robust selection method;
- whether additional `res/effects/chains/` files would actually be required by
  the upstream implementation.

The current preferred upstream packaging goal is to replace only the two FLX4
controller files. If Beat FX cannot robustly work under that constraint, report
the conflict clearly as a design decision.

Do not silently remove Beat FX.

## Behavior-preserving refactoring

Before a refactor, identify the behavior that must remain unchanged.

For hardware-specific logic, be especially conservative around:

- MIDI message interpretation
- jog / scratch calculations
- soft takeover / pickup
- CFX/TRIM filtering
- press / release handling
- short / long / double press timing
- timer cancellation
- LED output state
- effect routing
- loop state
- deck state
- controller shutdown and reinitialization

Do not simplify state machines merely because they look complex. First determine
which hardware or UX behavior the state is protecting.

When a refactor cannot be proven behavior-preserving through static reasoning,
flag it for hardware testing.

## Timers, connections, and shutdown

Review all timers and engine connections for lifecycle correctness.

Check that:

- obsolete timers are stopped;
- timer IDs are cleared consistently;
- shutdown cannot leave active callbacks that reference stale state;
- engine connections are disconnected where required;
- re-enabling the controller does not duplicate callbacks;
- error handling does not hide meaningful failures.

Do not replace defensive hardware workarounds with generic code unless their
purpose has been understood.

## Documentation

The eventual upstream mapping needs a separate manual contribution in
`mixxxdj/manual`.

Controller documentation should cover, as applicable:

- manufacturer product page
- Mixxx forum thread
- short hardware description
- OS compatibility
- class-compliance notes
- unsupported hardware features
- special setup instructions
- audio interface inputs/outputs
- microphone routing limitations
- labeled diagrams where legally usable
- explanation of mapping behavior

Do not put raw MIDI implementation detail into end-user manual text when it is
only relevant to developers.

The documentation must describe the behavior that actually ships. Do not update
the manual ahead of an unresolved design decision and then treat the
documentation as a reason to keep that decision.

## Analysis classification

When asked to audit the mapping for upstream readiness, classify findings as:

### MAIN

A generally beneficial change that should be made in `main` and then merged
into `mixxx-pr`.

Typical examples:

- ES7 compatibility
- real bug fixes
- lint errors
- dead code
- cleanup of stale timers/connections
- behavior-preserving refactors
- clearer internal comments

### MIXXX-PR

A deliberate difference that exists only because of upstream Mixxx integration.

Typical examples:

- official upstream metadata
- official upstream paths / filenames
- upstream-only default choices
- packaging differences
- explicit maintainer-requested changes

### DESIGN-DECISION

Not objectively wrong. Requires human choice, hardware evaluation, or maintainer
discussion.

Typical examples:

- Shift+EQ stem-volume workflow
- Beat FX preset architecture
- optional behaviors with multiple valid workflows
- UX trade-offs

### NO-CHANGE

The current implementation is valid and there is no concrete reason to change
it.

Do not invent work merely to populate every category.

## Priority classification

Use:

- **BLOCKER** — demonstrably incompatible with the target runtime, fails a
  mandatory check, breaks functionality, or makes the upstream mapping
  technically invalid.
- **SHOULD FIX** — concrete maintainability, correctness, robustness, or
  guideline issue worth fixing before submission.
- **NICE TO HAVE** — improvement without a clear upstream-readiness impact.
- **DESIGN DISCUSSION** — valid implementation with a nontrivial UX or
  architecture trade-off.

A large diff by itself is not a blocker.

## Verification

Never claim a check passed unless it was actually run against the relevant
files/configuration.

Useful checks include:

```bash
# Syntax features known to be newer than ES7
grep -RInE '\?\?|\?\.' controllers/

# XML syntax
xmllint --noout controllers/Pioneer-DDJ-FLX4-2.0.midi.xml
```

For ESLint, use the actual Mixxx target branch configuration. A lint run with a
random globally installed ESLint configuration does not establish upstream
compatibility.

When working in a Mixxx checkout, run the repository's configured pre-commit
checks for the changed files.

Static checks do not replace hardware tests.

## Working method for agents

When the human asks for an audit:

1. Read the relevant code before proposing changes.
2. Identify the current behavior.
3. Consult current official Mixxx sources when claiming an upstream rule.
4. Distinguish mandatory rules from general design guidance.
5. Cite exact file/line locations for concrete findings where possible.
6. Separate technical errors from design preferences.
7. Propose the smallest appropriate change.
8. Do not modify files unless explicitly asked.

When the human asks for implementation:

1. Make only the approved scope of changes.
2. Preserve unrelated behavior.
3. Do not silently implement previously unresolved design choices.
4. Run available static checks.
5. Report exactly what changed and what was tested.
6. Clearly identify anything that still requires real-hardware testing.
7. Do not commit, push, or publish unless explicitly instructed and consistent
   with Mixxx's AI-agent policy.

## Authoritative references

Checked on 2026-08-17. Re-check these before an upstream submission because
project policy can change.

- Mixxx contribution guide:
  https://github.com/mixxxdj/mixxx/blob/main/CONTRIBUTING.md
- Mixxx current AI-agent policy:
  https://github.com/mixxxdj/mixxx/blob/main/AGENTS.md
- Controller mapping contribution guidelines:
  https://github.com/mixxxdj/mixxx/wiki/Contributing-Mappings
- MIDI scripting / runtime:
  https://github.com/mixxxdj/mixxx/wiki/midi-scripting
- MIDI mapping XML format:
  https://github.com/mixxxdj/mixxx/wiki/MIDI-controller-mapping-file-format
- Components JS:
  https://github.com/mixxxdj/mixxx/wiki/Components-JS
- Mixxx 2.6 ESLint configuration:
  https://github.com/mixxxdj/mixxx/blob/2.6/eslint.config.cjs
- Current Mixxx 2.6 DDJ-FLX4 mapping:
  https://github.com/mixxxdj/mixxx/blob/2.6/res/controllers/Pioneer-DDJ-FLX4.midi.xml

If these sources conflict, do not guess. Report the conflict and prefer the
target branch's executable configuration for technical checks, while following
the current project-level contribution policy for submission behavior.
