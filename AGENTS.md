# AGENTS.md

## Project goal

This repository contains a Mixxx controller mapping for the Pioneer DDJ-FLX4.

The current work aims to turn the existing mapping into a clean, maintainable
mapping suitable for upstream Mixxx, while keeping optional advanced features
available separately.

## Primary rule: KISS

Keep it simple.

This is a DJ controller mapping, not a safety-critical system.

Prefer:
- simple code over clever code;
- fewer states over more states;
- fewer timers and callbacks over additional coordination;
- existing Mixxx functionality over custom infrastructure;
- removing unnecessary code over adding abstractions;
- solving real, reproducible problems over hypothetical edge cases.

Do not introduce frameworks, state machines, generic resource managers, wrapper
layers, or defensive machinery unless they clearly reduce existing complexity.

A refactor is successful when the resulting code is easier to understand and
maintain, not merely more abstract.

## Basic mapping

The future Basic mapping is the primary product.

Basic must:
- work completely on its own;
- provide predictable DDJ-FLX4 operation;
- follow Mixxx mapping conventions where practical;
- become simpler than the current mapping;
- avoid surprising or highly personal workflows;
- avoid dependencies on custom effect presets or Extended files.

Do not remove useful functionality merely to make Basic artificially minimal.
The goal is a capable but straightforward standard mapping.

## Extended mapping

Advanced or opinionated functionality may later live in an optional Extended
JavaScript file.

Extended must:
- build on Basic instead of duplicating it;
- be loaded after Basic;
- extend or override only the behavior it needs;
- keep shared bug fixes and common behavior in Basic;
- never require maintaining a second copy of the mapping.

Basic must always remain usable without Extended.

Extended installation tooling may later install the additional script,
supporting files, and a user mapping XML. Do not modify system-installed Mixxx
files in place.

## Refactoring rules

During the current refactor:

- Preserve working behavior unless a change is intentional and documented.
- Fix confirmed bugs before speculative cleanup.
- Keep unrelated changes separate.
- Do not perform broad formatting together with logic changes.
- Do not migrate code to Components JS merely for the sake of using Components.
- Use Components JS where it genuinely simplifies standard controller behavior.
- Keep controller-specific logic custom where that is clearer.
- Reuse existing cleanup and helper functions before adding new ones.
- Prefer deleting obsolete code to maintaining compatibility layers for it.

When choosing between a comprehensive solution and a simple solution that
covers the actual controller behavior, prefer the simple solution.

## Mixxx compatibility

The mapping currently targets Mixxx 2.6 functionality.

For upstream-oriented work:
- follow the actual Mixxx 2.6 implementation and CI configuration;
- also check current Mixxx contribution guidance where relevant;
- treat repository configuration and source code as more authoritative than
  outdated wiki examples;
- keep JavaScript compatible with the ECMAScript level required by Mixxx;
- do not add dependencies that are unavailable in the target Mixxx version.

Native XML ControlObjects are valid and should remain native when JavaScript
would only add complexity.

## Hardware behavior

The DDJ-FLX4 MIDI reference in:

`docs/DDJ-FLX4-MIDI-REFERENCE.md`

is the primary repository reference for hardware MIDI addresses.

Do not change hardware MIDI values based only on another Mixxx mapping when
they conflict with the documented DDJ-FLX4 protocol.

For ambiguous hardware behavior, prefer a real hardware test over speculative
code.

## Testing

Tests should protect behavior that is important or has previously failed.

Prefer small targeted regression tests.

Do not build large test frameworks for unlikely theoretical cases.

Before considering a change complete, check as applicable:
- JavaScript syntax;
- Mixxx ESLint;
- XML well-formedness;
- Script-Binding resolution;
- relevant regression tests;
- `git diff --check`.

Changes affecting physical controls, LEDs, timing, audio state, or controller
workflow should be verified on real hardware before being considered finished.

## Licensing and provenance

The mapping contains code derived in part from the existing Mixxx DDJ-FLX4
mapping as well as original project code.

Do not remove or obscure upstream provenance.

Before upstream submission, derived mapping files must use licensing and
attribution compatible with their Mixxx origin.

Do not assume the repository-wide MIT license automatically applies to derived
Mixxx code.

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

Before handing work back, report:
- files changed;
- tests performed;
- remaining known issues;
- `git status --short`;
- whether any commit or push was performed.
