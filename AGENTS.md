# AGENTS.md

## Scope

These instructions apply to the entire repository.

This repository contains the Pioneer DDJ-FLX4 controller mapping for Mixxx.

The current goal is to refactor the existing mapping into:

1. a clean and maintainable Basic mapping suitable for Mixxx upstream;
2. an optional Extended layer that builds on Basic without duplicating it.

## Primary design rule: KISS

Keep it simple.

This is a DJ controller mapping, not a safety-critical system.

Prefer:

- simple code over clever code;
- fewer states over more states;
- fewer timers and callbacks over additional coordination;
- existing Mixxx functionality over custom infrastructure;
- deleting unnecessary code over adding abstractions;
- direct solutions over generic frameworks;
- real controller behavior over hypothetical edge cases.

Do not introduce state machines, resource managers, wrapper frameworks,
compatibility layers, or defensive infrastructure unless they clearly reduce
existing complexity.

A refactor is successful when the resulting mapping is easier to understand,
test, and maintain.

The future Basic mapping should be simpler than the current mapping.

## Branch model

### `main`

`main` is the stable standalone version.

It should remain usable while the larger refactor is in progress.

### `refactor/mixxx-upstream`

This is the current working branch for potentially destructive refactoring.

Work here includes:

- confirmed bug fixes;
- lint cleanup;
- lifecycle cleanup;
- Components JS evaluation/migration;
- simplification;
- Basic extraction;
- Extended overlay architecture;
- installation tooling;
- upstream preparation.

Keep changes in small, understandable commits.

Do not merge this branch back into `main` until the resulting mapping has been
reviewed and hardware-tested.

### Future Mixxx pull request

The final upstream contribution will be prepared separately from the finished
Basic mapping against the appropriate branch of `mixxxdj/mixxx`.

Do not turn this repository into a second copy of the Mixxx source tree.

## Basic mapping

Basic is the primary mapping.

Basic must:

- work completely without Extended;
- provide predictable DDJ-FLX4 operation;
- cover useful normal controller functionality;
- follow Mixxx conventions where practical;
- avoid dependencies on project-specific effect presets;
- avoid highly personal or surprising workflows;
- reduce unnecessary complexity compared with the current mapping.

Do not make Basic artificially minimal.

Useful functionality may remain when it is intuitive, maintainable, and does
not require disproportionate complexity.

When choosing between two implementations with equivalent behavior, prefer the
simpler one.

## Extended mapping

Extended is optional functionality layered on top of Basic.

Extended must:

- use the same Basic implementation;
- never duplicate the complete mapping;
- be loaded after Basic;
- override or extend only what it needs;
- keep common bug fixes and shared behavior in Basic;
- own and clean up its own additional timers/connections/state.

The intended architecture is:

```text
Pioneer-DDJ-FLX4-script.js
        Basic
          |
          v
Pioneer-DDJ-FLX4-extended-scripts.js
        optional overlay
```

Basic must remain fully usable when the Extended script is absent.

Do not maintain separate Basic and Extended copies of the same implementation.

## Extended installation

Extended may later have manual installation instructions and an installer.

The installer may install:

- the Extended JavaScript file;
- an Extended user mapping XML;
- required effect-chain presets or other supporting files.

Do not modify system-installed Mixxx files in place.

In particular, do not patch files under `/usr/share/...`.

Prefer a user mapping under the active Mixxx profile.

The installer should be:

- idempotent;
- conservative with existing files;
- able to identify files it owns;
- reversible by a matching uninstall procedure.

Do not implement the installer until the Basic/Extended boundary is decided.

## Mixxx target

Unless explicitly changed by the human contributor, target Mixxx `2.6`.

Do not silently switch the target to another Mixxx branch.

For technical compatibility, prefer in this order:

1. actual Mixxx `2.6` implementation and configuration;
2. current applicable contribution policy;
3. Mixxx documentation/wiki;
4. examples from existing mappings.

If these disagree, report the conflict instead of guessing.

## JavaScript runtime

Mixxx controller mappings use QJSEngine.

For the current target:

```text
ecmaVersion: 7
sourceType: script
```

Therefore:

- no ES modules;
- no optional chaining (`?.`);
- no nullish coalescing (`??`);
- no Node.js APIs;
- no browser DOM APIs;
- use only APIs available in the target Mixxx version.

Keep the global mapping namespace compatible with Mixxx's `functionprefix`
loader.

Do not blindly replace the global namespace `var` if doing so prevents Mixxx
from finding the mapping object.

## JavaScript style

Use the actual Mixxx target branch ESLint configuration.

Fix ESLint errors.

Treat broad style warnings separately from logic changes.

Do not mass-format a file while fixing a functional bug.

Prefer:

- `===` / `!==`;
- `const` / `let` for local variables;
- braces around control flow;
- clear English names;
- concise comments that explain why.

Remove temporary, conversational, AI-like, or personal development comments
before upstream submission.

## Components JS and JSDoc

Current Mixxx contribution guidance favors Components JS and JSDoc.

Use Components where they simplify standard controller behavior.

Do not rewrite working controller-specific logic merely to increase the amount
of Components JS.

Native XML ControlObjects are valid and should remain native when JavaScript or
Components would only add complexity.

For each possible migration ask:

1. Does it remove custom code?
2. Does it reduce state or lifecycle handling?
3. Does it preserve the required hardware behavior?
4. Is the result easier to understand?

If not, keep the simpler implementation.

Controller-specific behavior such as hardware workarounds, protocol handling,
special jog decoding, or necessary pickup logic may remain custom.

## Hardware behavior

The repository hardware reference is:

```text
docs/DDJ-FLX4-MIDI-REFERENCE.md
```

Use it as the primary repository reference for DDJ-FLX4 MIDI addresses.

Do not change MIDI addresses merely because another Mixxx mapping uses
different values.

For ambiguous hardware behavior, prefer testing the real DDJ-FLX4 instead of
adding speculative code.

Hardware labels should generally keep their expected primary function.

Secondary functions are acceptable where intuitive and useful.

## Refactoring

Before changing existing logic, understand what behavior it protects.

Be particularly careful around:

- jog and scratch handling;
- MIDI relative encoders;
- pickup / soft takeover;
- TRIM / CFX hardware filtering;
- press/release handling;
- long/double presses;
- Hotcue preview;
- Stem momentary state;
- loops;
- effect routing;
- LED state;
- controller init/shutdown.

Do not preserve complexity merely because it already exists.

Conversely, do not remove code merely because it looks complex before
understanding why it exists.

Prefer the smallest change that fixes a confirmed problem.

## Timers, connections, and state

Avoid adding timers or persistent state unless necessary.

Reuse existing cleanup functions when possible.

Shutdown should restore temporary controller-induced states that would otherwise
remain active.

Do not build a generic lifecycle framework for a handful of resources.

Normal destruction of the Mixxx JS context does not require manually managing
every object solely for theoretical completeness.

Solve demonstrated lifecycle problems, not imaginary ones.

## LEDs

Each LED should have a clear owner.

Avoid having XML and JavaScript independently drive the same LED with conflicting
semantics.

Use native Mixxx indicator ControlObjects where they correctly express the
desired behavior.

Blink only when it communicates a meaningful temporary state.

Do not add decorative permanent blinking.

## Effects

Beat FX and Pad FX are design-review areas.

The current Beat FX implementation relies on project-specific effect presets.

Do not silently remove Beat FX.

Do not build additional complexity around its current implementation before the
Basic/Extended decision.

If Beat FX becomes Extended, its preset-selection robustness should be fixed in
Extended rather than making Basic depend on those presets.

Basic must not depend on custom project-specific effect-chain files.

## Testing

Tests should protect important behavior and previously observed failures.

Prefer small targeted regression tests.

Do not build large test frameworks for unlikely edge cases.

Before considering a change complete, run as applicable:

- JavaScript syntax / ES7 parsing;
- actual Mixxx ESLint;
- XML well-formedness;
- Script-Binding resolution;
- relevant regression tests;
- `git diff --check`.

Static tests do not replace real hardware tests.

Changes affecting physical controls, LEDs, timing, audio state, jog behavior,
or workflow require DDJ-FLX4 hardware testing before the result is considered
finished.

## Licensing and provenance

The mapping contains both original project work and code derived from the
existing Mixxx DDJ-FLX4 mapping.

Do not remove or obscure upstream provenance.

Do not assume that the repository-wide MIT license automatically applies to
derived Mixxx code.

Before upstream submission:

- preserve appropriate original attribution;
- document derived areas where relevant;
- use licensing compatible with the Mixxx origin for derived mapping files.

Independent project tools or other independently authored files may use a
different license where appropriate.

Do not make legal claims; report provenance facts and uncertainties.

## Upstream files

The eventual Mixxx Basic replacement is expected to use the existing official
paths:

```text
res/controllers/Pioneer-DDJ-FLX4.midi.xml
res/controllers/Pioneer-DDJ-FLX4-script.js
```

The current standalone `-2.0` names do not need to be changed until the
upstream-oriented Basic packaging is prepared.

Upstream metadata and manual references should describe the final behavior, not
an intermediate refactor state.

## Documentation

Developer implementation details belong in repository documentation.

User-facing Mixxx manual documentation should focus on:

- setup;
- controls;
- workflows;
- audio routing;
- supported/unsupported hardware behavior;
- relevant configuration.

Do not document unresolved design decisions as if they were final.

The MIDI reference is developer documentation, not a replacement for the Mixxx
controller manual.

## AI-assisted upstream work

The human contributor owns all upstream-facing work.

Do not autonomously:

- create or submit Mixxx pull requests;
- create or update Mixxx issues;
- answer upstream review comments;
- commit or push upstream-targeted changes.

The human must review final changes and perform real-controller testing before
submission.

Follow the current Mixxx `AGENTS.md` requirements when preparing actual upstream
text or contributions.

## Git and destructive actions

Work on the currently selected branch unless explicitly instructed otherwise.

Do not:

- commit;
- push;
- merge;
- rebase;
- reset;
- force-push;
- create or delete branches;
- modify installed Mixxx files;

unless explicitly requested.

Do not discard unrelated user changes.

## Reporting

Before handing work back, report:

- files changed;
- what was changed;
- tests actually performed;
- tests not performed;
- remaining known issues;
- hardware testing still required;
- `git status --short`;
- whether any commit or push was performed.

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

Checked on 2026-10-06.. Re-check these before an upstream submission because
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
