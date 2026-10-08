# Mapping checks

The repository previously had no test runner. These checks use Python's XML
parser, Node's VM and Acorn's ECMAScript 7 parser, without a test framework.

With Node.js and Python 3 available, install only the parser outside the repo:

```sh
npm install --prefix /tmp/flx4-tests --no-save acorn@8
NODE_PATH=/tmp/flx4-tests/node_modules python3 tests/check-mapping.py
git diff --check
```

The runner checks all controller/effect XML files and every Script-Binding,
including both capitalization variants used by the XML. It evaluates Basic
alone and Basic followed by Extended in one context. Regression cases cover
startup isolation, the shared Hotcue PLAY commit, Pitch Play, the Key Shift
layout, Sampler press/release, Instant Doubles, Browse, loops, both effect
workflows, Stem ownership, EQ pickup and Extended lifecycle cleanup.

The engine mock records controls, connections, MIDI output and manually fired
timers. It models only the native control behavior needed by the tests; it
does not replace Mixxx's QJSEngine, audio engine or a real DDJ-FLX4 test.

For linting, use Mixxx **2.6** `eslint.config.cjs` and its dependencies from
`.pre-commit-config.yaml`. Place temporary copies under `res/controllers/` so
the actual config's controller globals apply. Run the unchanged config against
both files without `--fix`; keep broad style warnings separate from this
behavioral refactor. No upstream source checkout is needed in this repository.
