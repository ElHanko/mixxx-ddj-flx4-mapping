/* Node test harness only; controller scripts themselves run as ES7 in Mixxx. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const acorn = require("acorn");

const root = path.resolve(__dirname, "..");
const basicSource = fs.readFileSync(path.join(root, "controllers/Pioneer-DDJ-FLX4-2.0.script.js"), "utf8");
const extendedSource = fs.readFileSync(path.join(root, "controllers/Pioneer-DDJ-FLX4-extended-scripts.js"), "utf8");
const bindings = JSON.parse(process.argv[2]);
const scriptfiles = JSON.parse(process.argv[3]);
const decks = ["[Channel1]", "[Channel2]"];
const unit = "[EffectRack1_EffectUnit1]";
const slot = "[EffectRack1_EffectUnit1_Effect1]";
const plain = value => JSON.parse(JSON.stringify(value));
let passed = 0;
const test = (name, run) => {
    run();
    passed++;
    console.log(`ok ${passed} - ${name}`);
};

// Model the small engine surface used here; timers run only when explicitly fired.
const mapping = (extended = false, initialize = true) => {
    const values = new Map();
    const writes = [];
    const messages = [];
    const connections = [];
    const timers = new Map();
    const scratch = new Set();
    const brakes = new Set();
    const softStarts = new Set();
    const fxCalls = [];
    let nextTimer = 1;
    const key = (group, control) => `${group}|${control}`;
    const get = (group, control) => values.get(key(group, control)) || 0;
    const seed = (group, control, value) => values.set(key(group, control), value);
    const write = (group, control, value) => {
        value = Number(value); // Mixxx ControlObjects expose double values.
        writes.push([group, control, value]);
        const changed = get(group, control) !== value;
        seed(group, control, value);
        // These two native controls are used by the Sampler and Hotcue tests.
        if (value && control === "start_play") {
            seed(group, "playposition", 0);
            seed(group, "play", 1);
        }
        if (value && /hotcue_\d+_goto$/.test(control)) {
            seed(group, "playposition", get(group, control.replace("_goto", "_position")));
        }
        if (changed) {
            connections.filter(c => c.connected && c.group === group && c.control === control)
                .slice().forEach(c => c.callback(value, group, control));
        }
    };
    const engine = {
        getValue: get,
        getParameter: get,
        setValue: write,
        setParameter: write,
        softTakeover() {},
        softTakeoverIgnoreNextValue() {},
        makeConnection(group, control, callback) {
            assert.equal(typeof callback, "function", `${group} ${control} callback`);
            const connection = {group, control, callback, connected: true,
                disconnect() { this.connected = false; }};
            connections.push(connection);
            return connection;
        },
        beginTimer(ms, callback, once = false) {
            assert.equal(typeof callback, "function");
            const id = nextTimer++;
            timers.set(id, {ms, callback, once});
            return id;
        },
        stopTimer(id) { timers.delete(id); },
        scratchEnable(deck, ...args) { scratch.add(deck); fxCalls.push(["scratch", deck, ...args]); },
        scratchDisable(deck) { scratch.delete(deck); },
        isScratching(deck) { return scratch.has(deck); },
        scratchTick(deck, delta) { fxCalls.push(["tick", deck, delta]); },
        brake(deck, enabled, factor) {
            enabled ? brakes.add(deck) : brakes.delete(deck);
            fxCalls.push(["brake", deck, enabled, factor]);
        },
        softStart(deck, enabled, factor) {
            enabled ? softStarts.add(deck) : softStarts.delete(deck);
            fxCalls.push(["softStart", deck, enabled, factor]);
        },
        isBrakeActive(deck) { return brakes.has(deck); },
        isSoftStartActive(deck) { return softStarts.has(deck); }
    };
    const context = vm.createContext({engine,
        midi: {
            sendShortMsg(...args) { messages.push(args); },
            sendSysexMsg(...args) { messages.push(args); }
        },
        script: {
            samplerRegEx: /\[Sampler(\d+)\]/,
            toggleControl(group, control) { write(group, control, !get(group, control)); },
            // Match common-controller-scripts.js (Mixxx 2.6): default 200ms reset.
            triggerControl(group, control, delay = 200) {
                write(group, control, 1);
                engine.beginTimer(delay, () => write(group, control, 0), true);
            }
        }
    });
    seed(unit, "focused_effect", 1);
    [1, 2].forEach(index => seed(`[EffectRack1_EffectUnit${index}]`, "num_chain_presets", 15));
    vm.runInContext(basicSource, context);
    const basicObject = context.PioneerDDJFLX4;
    const originalFunctions = Object.assign({}, basicObject);
    if (extended) {
        vm.runInContext(extendedSource, context);
        assert.equal(context.PioneerDDJFLX4, basicObject, "Overlay must preserve namespace identity");
    }
    const m = context.PioneerDDJFLX4;
    if (initialize) m.init();
    const fire = id => {
        const timer = timers.get(id);
        assert.ok(timer, `timer ${id} exists`);
        if (timer.once) timers.delete(id);
        timer.callback();
    };
    const press = (handler, group = decks[0], control = 0, status = 0x90, value = 0x7F) =>
        m[handler](status & 0x0F, control, value, status, group);
    return {m, originalFunctions, get, seed, writes, messages, connections, timers,
        scratch, brakes, softStarts, fxCalls, fire, press};
};

test("Both controller files parse as ECMAScript 7 scripts", () => {
    [basicSource, extendedSource].forEach(source => acorn.parse(source, {ecmaVersion: 7, sourceType: "script"}));
});

test("Basic XML loads one namespace, all bindings resolve in both variants", () => {
    assert.deepEqual(scriptfiles, [{functionprefix: "PioneerDDJFLX4", filename: "Pioneer-DDJ-FLX4-2.0.script.js"}]);
    [false, true].forEach(extended => {
        const {m} = mapping(extended, false);
        bindings.forEach(binding => {
            assert.ok(binding.startsWith("PioneerDDJFLX4."));
            assert.equal(typeof m[binding.split(".")[1]], "function", binding);
        });
    });
});

test("Basic startup leaves presets, routing, stems and hardware vinyl alone", () => {
    const h = mapping();
    assert.deepEqual(plain(h.m.tempoRanges), [0.06, 0.10, 0.16, 0.25]);
    assert.equal(h.get("[App]", "num_samplers"), 16);
    assert.equal(h.get(unit, "show_focus"), 1);
    assert.ok(!h.writes.some(([g, c]) => /preset|group_.*enable/.test(c) || /Stem/.test(g)));
    assert.ok(!h.connections.some(c => /Stem/.test(c.group) || c.control === "stem_count"));
    assert.ok(!h.messages.some(([s, n]) => [0x90, 0x91].includes(s) && n === 0x17));
    ["_initBeatFx", "_beatFxPresetGroups", "_beatFxPresetState", "_applyBeatFxRouting",
        "_stemMomentary", "_vinylWanted", "_brakeWatchTimer", "_quantizeLP", "_samplerHold",
        "SAMPLER_LONGPRESS_MS", "eqStemPickup"].forEach(name => assert.equal(h.m[name], undefined, name));
    assert.ok(!basicSource.includes("01_ECHO"));
    h.m.shutdown();
    assert.equal(h.timers.size, 0);
});

test("Basic PLAY commits Hotcue preview, matching release cannot stop playback", () => {
    [false, true].forEach(extended => {
        const h = mapping(extended);
        decks.forEach((group, index) => {
            const status = index ? 0x99 : 0x97;
            h.seed(group, "hotcue_1_status", 1);
            h.seed(group, "hotcue_1_position", 0.25);
            h.press("hotcuePad", group, 0, status);
            assert.equal(h.m._hotcuePreview[group], 1);
            assert.equal(h.get(group, "play"), 1);
            h.press("playPressed", group);
            assert.equal(h.m._hotcuePreview[group], 0);
            h.press("hotcuePad", group, 0, status, 0);
            assert.equal(h.get(group, "play"), 1);
            h.press("playPressed", group);
            assert.equal(h.get(group, "play"), 0);
        });
    });
});

test("Hotcue preview restores on release, mode change, bank change and shutdown", () => {
    ["release", "mode", "bank", "shutdown"].forEach(action => {
        const h = mapping();
        h.seed(decks[0], "hotcue_1_status", 1);
        h.seed(decks[0], "hotcue_1_position", 0.25);
        h.press("hotcuePad", decks[0], 0, 0x97);
        if (action === "release") h.press("hotcuePad", decks[0], 0, 0x97, 0);
        if (action === "mode") h.press("padModeKeyPressed", "[PadMode]", 0x20);
        if (action === "bank") h.m.cycleHotcueBank(decks[0]);
        if (action === "shutdown") h.m.shutdown();
        assert.equal(h.get(decks[0], "play"), 0);
        assert.equal(h.get(decks[0], "playposition"), 0.25);
    });
});

test("Keyboard selects banked Hotcue then plays all eight pitches with releases", () => {
    const h = mapping();
    decks.forEach((group, deck) => {
        h.m.hotcueBank[group] = 1;
        h.seed(group, "hotcue_10_status", 1);
        h.press("padModeKeyPressed", "[PadMode]", 0x69, 0x90 + deck);
        h.press("keyboardPadPressed", group, 0x40);
        assert.equal(h.m.keyboardHotcue[group], 0, "Empty cue must not be created");
        h.press("keyboardPadPressed", group, 0x41);
        assert.equal(h.m.keyboardHotcue[group], 10);
        [4, 5, 6, 7, 0, 1, 2, 3].forEach((pitch, pad) => {
            h.press("keyboardPadPressed", group, 0x40 + pad);
            assert.equal(h.get(group, "pitch_adjust"), pitch);
            assert.equal(h.get(group, "hotcue_10_activate"), 1);
            h.press("keyboardPadPressed", group, 0x40 + pad, 0x97 + deck * 2, 0);
            assert.equal(h.get(group, "hotcue_10_activate"), 0);
        });
        h.seed(group, "hotcue_11_status", 1);
        h.press("keyboardPadShiftPressed", group, 0x42);
        assert.equal(h.m.keyboardHotcue[group], 11);
        h.m.keyboardTrackLoaded(1, group);
        assert.equal(h.m.keyboardHotcue[group], 0);
    });
    assert.ok(!h.writes.some(([g, c]) => /Stem/.test(g) || c === "mute"));
});

test("Basic Keyboard entry and repeated SHIFT + HOT CUE reset selection", () => {
    [false, true].forEach(stayInKeyboard => {
        const h = mapping();
        decks.forEach((group, deck) => {
            const status = 0x90 + deck;
            const padStatus = 0x97 + deck * 2;
            h.seed(group, "hotcue_1_status", 1);
            h.seed(group, "hotcue_2_status", 1);
            h.press("padModeKeyPressed", "[PadMode]", 0x69, status);
            h.press("keyboardPadPressed", group, 0x40);
            h.m.updateKeyboardLeds(group);
            assert.equal(h.m.keyboardHotcue[group], 1, "LED refresh must preserve selection");
            h.press("keyboardPadPressed", group, 0x44);
            assert.equal(h.get(group, "hotcue_1_activate"), 1);
            if (!stayInKeyboard) {
                h.press("padModeKeyPressed", "[PadMode]", 0x1B, status);
                assert.equal(h.get(group, "hotcue_1_activate"), 0, "Mode exit releases held cue");
            }
            h.press("padModeKeyPressed", "[PadMode]", 0x69, status, 0);
            assert.equal(h.m.keyboardHotcue[group], 1, "Button release must not reset selection");
            h.messages.length = 0;
            h.press("padModeKeyPressed", "[PadMode]", 0x69, status);
            assert.equal(h.m.keyboardHotcue[group], 0);
            assert.equal(h.get(group, "hotcue_1_activate"), 0, "Repeated entry releases held cue");
            assert.ok(h.messages.some(([s, c, v]) => s === padStatus && c === 0x41 && v === 0x7F));
            assert.ok(h.messages.some(([s, c, v]) => s === padStatus && c === 0x42 && v === 0));
            h.writes.length = 0;
            h.press("keyboardPadPressed", group, 0x41);
            assert.equal(h.m.keyboardHotcue[group], 2, "A new hotcue can be selected");
            assert.ok(!h.writes.some(([, c]) => c === "pitch_adjust" || c === "hotcue_2_activate"));
            h.press("keyboardPadPressed", group, 0x44);
            assert.equal(h.get(group, "hotcue_2_activate"), 1);
            assert.equal(h.get(group, "pitch_adjust"), 0);
        });
    });
});

test("Key Shift preserves the standard layout in Basic and Extended", () => {
    [false, true].forEach(extended => {
        const h = mapping(extended);
        [4, 5, 6, 7, 0, 1, 2, 3].forEach((pitch, pad) => {
            h.press("pitchPadPressed", decks[0], 0x70 + pad);
            assert.equal(h.get(decks[0], "pitch_adjust"), pitch);
        });
    });
});

test("Tempo cycling uses each variant's property and the same function", () => {
    [false, true].forEach(extended => {
        const h = mapping(extended);
        const ranges = extended ? [0.08, 0.16, 0.32, 0.64, 1] : [0.06, 0.10, 0.16, 0.25];
        assert.equal(h.m.cycleTempoRange, h.originalFunctions.cycleTempoRange);
        ranges.forEach((range, i) => {
            h.seed(decks[0], "rateRange", range);
            h.press("cycleTempoRange");
            assert.equal(h.get(decks[0], "rateRange"), ranges[(i + 1) % ranges.length]);
        });
    });
});

test("Basic SHIFT + Channel CUE sends BPM Tap press/release without timers", () => {
    const h = mapping();
    const timers = h.timers.size;
    h.press("shiftChannelCuePressed");
    h.press("shiftChannelCuePressed", decks[0], 0, 0x90, 0);
    assert.deepEqual(h.writes.slice(-2), [[decks[0], "bpm_tap", 1], [decks[0], "bpm_tap", 0]]);
    assert.equal(h.timers.size, timers);
});

test("Sampler restarts from track start on press, empty/release does nothing", () => {
    const h = mapping();
    const sg = "[Sampler1]";
    const count = h.writes.length;
    h.press("samplerPadPressed", sg);
    assert.equal(h.writes.length, count);
    h.seed(sg, "track_loaded", 1);
    h.seed(sg, "playposition", 0.4);
    const timers = h.timers.size;
    h.press("samplerPadPressed", sg);
    assert.equal(h.get(sg, "playposition"), 0);
    assert.equal(h.get(sg, "play"), 1);
    h.seed(sg, "playposition", 0.8);
    h.press("samplerPadPressed", sg);
    assert.equal(h.get(sg, "playposition"), 0);
    const after = h.writes.length;
    h.press("samplerPadPressed", sg, 0, 0x97, 0);
    assert.equal(h.writes.length, after);
    assert.equal(h.timers.size, timers, "Sampler actions add no hold/pulse timers");
});

test("SHIFT + Sampler stops playing, loads into stopped/empty slot, never ejects", () => {
    const h = mapping();
    const sg = "[Sampler1]";
    h.seed(sg, "track_loaded", 1);
    h.seed(sg, "play", 1);
    h.press("samplerPadShiftPressed", sg);
    assert.equal(h.get(sg, "play"), 0);
    h.press("samplerPadShiftPressed", sg, 0, 0x98, 0);
    assert.ok(!h.writes.some(([, c]) => c === "LoadSelectedTrack"));
    h.press("samplerPadShiftPressed", sg);
    assert.deepEqual(h.writes.slice(-2), [[sg, "LoadSelectedTrack", 1], [sg, "LoadSelectedTrack", 0]]);
    h.seed(sg, "track_loaded", 0);
    h.press("samplerPadShiftPressed", sg);
    assert.ok(!h.writes.some(([, c]) => c === "eject"));
});

test("Instant Doubles keeps delayed single load, cloning and playing-target guard", () => {
    const h = mapping();
    h.press("loadPressed");
    assert.ok(!h.writes.some(([, c]) => c === "LoadSelectedTrack"));
    h.fire(h.m._loadPress.timer[decks[0]]);
    assert.equal(h.get(decks[0], "LoadSelectedTrack"), 1);
    h.seed(decks[1], "track_loaded", 1);
    h.seed(decks[1], "playposition", 0.3);
    h.seed(decks[1], "play", 1);
    h.press("loadPressed");
    h.press("loadPressed");
    assert.equal(h.get(decks[0], "CloneFromDeck"), 2);
    assert.equal(h.get(decks[0], "playposition"), 0.3);
    assert.equal(h.get(decks[0], "play"), 1);
    h.writes.length = 0;
    h.press("loadPressed");
    h.press("loadPressed");
    assert.equal(h.writes.length, 0);
});

test("Browse focus toggle and relative multi-step waveform zoom stay Basic", () => {
    const h = mapping();
    h.seed("[Library]", "focused_widget", 3);
    h.press("browsePress", "[Library]", 0x41);
    assert.equal(h.get("[Library]", "focused_widget"), 2);
    h.press("browsePress", "[Library]", 0x41);
    assert.equal(h.get("[Library]", "focused_widget"), 3);
    h.press("waveformZoom", decks[0], 0x64, 0xB6, 0x7E);
    assert.equal(h.writes.filter(([, c, v]) => c === "waveform_zoom_up" && v === 1).length, 4);
});

test("Basic 4BEAT starts a new loop even with stored points, or exits an active loop", () => {
    [false, true].forEach(extended => {
        decks.forEach(group => {
            ["none", "stored", "active"].forEach(state => {
                const h = mapping(extended);
                h.seed(group, "track_loaded", 1);
                h.seed(group, "loop_enabled", state === "active" ? 1 : 0);
                h.seed(group, "loop_start_position", state === "none" ? -1 : 100);
                h.seed(group, "loop_end_position", state === "none" ? -1 : 200);
                h.seed(group, "playposition", 0.5);
                h.writes.length = 0;
                h.press("reloopExitPressed", group);
                const control = state === "active" ? "reloop_exit" : "beatloop_4_activate";
                assert.deepEqual(h.writes, [[group, control, 1]]);
                h.press("reloopExitPressed", group, 0, 0x90, 0);
                assert.deepEqual(h.writes, [[group, control, 1]], "Release does nothing");
            });
        });
    });
});

test("Basic SHIFT + 4BEAT is neutral on press and release", () => {
    const h = mapping();
    const before = [h.writes.length, h.messages.length, h.timers.size];
    decks.forEach(group => {
        h.press("shiftReloopExitPressed", group);
        h.press("shiftReloopExitPressed", group, 0, 0x90, 0);
    });
    assert.deepEqual([h.writes.length, h.messages.length, h.timers.size], before);
});

test("Basic loop halve/double controls work", () => {
    const h = mapping();
    h.seed(decks[0], "track_loaded", 1);
    h.seed(decks[0], "loop_enabled", 1);
    h.press("cueLoopCallLeft");
    h.press("cueLoopCallRight");
    assert.equal(h.get(decks[0], "loop_halve"), 1);
    assert.equal(h.get(decks[0], "loop_double"), 1);
});

test("Basic Beat FX controls focus, effects, slots, mix/meta and channel routing", () => {
    const h = mapping();
    h.press("beatFxSelectPressed");
    h.press("beatFxSelectShiftPressed");
    assert.equal(h.get(slot, "next_effect"), 0x7F);
    assert.equal(h.get(slot, "prev_effect"), 0x7F);
    h.press("beatFxLeftPressed");
    assert.equal(h.get(unit, "focused_effect"), 3);
    h.press("beatFxRightPressed");
    assert.equal(h.get(unit, "focused_effect"), 1);
    h.press("beatFxOnOffPressed");
    assert.equal(h.get(slot, "enabled"), 1);
    assert.ok(h.messages.some(([s, n, v]) => s === 0x94 && n === 0x47 && v === 0x7F));
    h.press("beatFxLevelDepthRotate", "[Master]", 0x02, 0xB4, 64);
    assert.equal(h.get(unit, "mix"), 64 / 127);
    h.m.shiftDown = true;
    h.press("beatFxLevelDepthRotate", "[Master]", 0x02, 0xB4, 100);
    assert.equal(h.get(slot, "meta"), 100 / 127);
    h.press("beatFxChannel1", unit);
    h.press("beatFxChannel2", unit);
    assert.equal(h.get(unit, "group_[Channel1]_enable"), 1);
    assert.equal(h.get(unit, "group_[Channel2]_enable"), 1);
    h.press("beatFxChannel1", unit, 0x10, 0x94, 0);
    assert.equal(h.get(unit, "group_[Channel1]_enable"), 0);
    h.press("beatFxOnOffShiftPressed");
    assert.equal(h.get(unit, "mix"), 0);
    [1, 2, 3].forEach(i => assert.equal(h.get(`[EffectRack1_EffectUnit1_Effect${i}]`, "enabled"), 0));
    assert.ok(!h.writes.some(([, c]) => /preset/.test(c)));
});

test("Basic Beat FX starts with a valid slot on fresh profiles, keeps existing focus", () => {
    const h = mapping(false, false);
    h.seed(unit, "focused_effect", 0);
    h.m.init();
    assert.equal(h.get(unit, "focused_effect"), 1);
    h.seed(unit, "focused_effect", 3);
    assert.equal(h.m.focusedFxGroup(), "[EffectRack1_EffectUnit1_Effect3]");
    h.seed(unit, "focused_effect", 0);
    assert.equal(h.m.focusedFxGroup(), slot);
    h.press("beatFxLeftPressed");
    assert.equal(h.get(unit, "focused_effect"), 3);
});

test("Keyboard hotcue releases on reselection, mode exit and shutdown", () => {
    ["select", "mode", "shutdown"].forEach(action => {
        const h = mapping();
        h.seed(decks[0], "hotcue_1_status", 1);
        h.seed(decks[0], "hotcue_2_status", 1);
        h.press("padModeKeyPressed", "[PadMode]", 0x69);
        h.press("keyboardPadPressed", decks[0], 0x40);
        h.press("keyboardPadPressed", decks[0], 0x44);
        assert.equal(h.get(decks[0], "hotcue_1_activate"), 1);
        if (action === "select") h.press("keyboardPadShiftPressed", decks[0], 0x41);
        if (action === "mode") h.press("padModeKeyPressed", "[PadMode]", 0x20);
        if (action === "shutdown") h.m.shutdown();
        assert.equal(h.get(decks[0], "hotcue_1_activate"), 0);
    });
});

test("Shared jog keeps 720 PPR, platter/side decoding and zero-delta loop guard", () => {
    [false, true].forEach(extended => {
        const h = mapping(extended);
        h.seed(decks[0], "play", 1);
        if (extended) h.m._applyVinylState(0, true);
        h.press("jogTouch", decks[0], 0x36);
        assert.ok(h.scratch.has(1));
        assert.equal(h.fxCalls.find(call => call[0] === "scratch")[2], 720);
        h.press("jogTurn", decks[0], 0x23, 0xB0, 65);
        assert.ok(h.fxCalls.some(call => call[0] === "tick" && call[2] === 1.8));
        h.press("jogTurn", decks[0], 0x21, 0xB0, 65);
        assert.equal(h.get(decks[0], "jog"), 0.8);
        h.press("jogTouch", decks[0], 0x36, 0x90, 0);
        assert.ok(!h.scratch.has(1));
        const writes = h.writes.length;
        h.press("jogTurn", decks[0], 0x22, 0xB0, 65);
        assert.equal(h.writes.length, writes);
        h.m.LOOP_ADJUST_MODE = "workflow";
        h.seed(decks[0], "loop_enabled", 1);
        h.m.loopAdjustIn[0] = true;
        assert.equal(h.m._handleJogLoopAdjust(0, decks[0], 0, 0x22, 0x90), true);
        assert.equal(h.writes.length, writes);
    });
});

test("Basic EQ remains EQ with SHIFT and Pad FX hooks cannot change effects", () => {
    const h = mapping();
    h.m._shiftDeck1 = true;
    h.press("eqHighMsb", decks[0], 0x07, 0xB0, 64);
    h.press("eqHighLsb", decks[0], 0x27, 0xB0, 0);
    assert.equal(h.get("[EqualizerRack1_[Channel1]_Effect1]", "parameter3"), 8192 / 16383);
    const before = h.writes.length;
    h.press("padFxPadPressed", decks[0], 0x10, 0x97);
    assert.equal(h.writes.length, before);
});

test("Overlay changes only the intended Basic functions and tempo property", () => {
    const h = mapping(true, false);
    const allowed = new Set(["init", "shutdown", "playPressed", "_routeEq", "keyboardModeEntered",
        "keyboardPadPressed", "keyboardPadShiftPressed", "updateKeyboardLeds", "jogVinylEnabled",
        "shiftReloopExitPressed", "shiftChannelCuePressed", "padFxPadPressed", "updatePadFxUI",
        "beatFxSelectPressed", "beatFxSelectShiftPressed", "beatFxLeftPressed", "beatFxRightPressed",
        "beatFxChannel1", "beatFxChannel2", "beatFxLevelDepthRotate", "beatFxOnOffPressed",
        "beatFxOnOffShiftPressed", "_updateBeatFxOnOffLed"]);
    Object.entries(h.originalFunctions).forEach(([name, value]) => {
        if (typeof value === "function" && !allowed.has(name)) assert.equal(h.m[name], value, name);
    });
    assert.equal(h.m._basicPlayPressed, h.originalFunctions.playPressed);
});

test("Overlay runs Basic init once, custom init once, with one keepalive", () => {
    const h = mapping(true, false);
    let basicInits = 0;
    let extendedInits = 0;
    const basic = h.m._basicInit;
    const fx = h.m._initBeatFx;
    h.m._basicInit = () => { basicInits++; basic(); };
    h.m._initBeatFx = () => { extendedInits++; fx(); };
    h.m.init();
    assert.equal(basicInits, 1);
    assert.equal(extendedInits, 1);
    assert.equal([...h.timers.values()].filter(t => t.ms === 200 && !t.once).length, 1);
    assert.deepEqual(plain(h.m.tempoRanges), [0.08, 0.16, 0.32, 0.64, 1]);
    assert.equal(h.get(unit, "loaded_chain_preset"), 3);
    assert.equal(h.get("[EffectRack1_EffectUnit2]", "loaded_chain_preset"), 3);
    assert.ok(h.connections.some(c => c.control === "stem_count"));
    assert.ok(h.messages.some(([s, n, v]) => s === 0x90 && n === 0x17 && v === 0));
});

test("Extended Keyboard keeps Stem owner safety and matching restore", () => {
    const h = mapping(true);
    const group = decks[0];
    h.seed(group, "stem_count", 4);
    [0, 1, 0, 1].forEach((mute, i) => h.seed(`[Channel1_Stem${i + 1}]`, "mute", mute));
    h.press("padModeKeyPressed", "[PadMode]", 0x69);
    h.press("keyboardPadPressed", group, 0x44, 0x97);
    assert.deepEqual([1, 2, 3, 4].map(i => h.get(`[Channel1_Stem${i}]`, "mute")), [0, 1, 1, 1]);
    h.press("padModeKeyPressed", "[PadMode]", 0x69);
    assert.equal(h.m._stemMomentary[group].active, true, "Repeated entry keeps Extended's Stem mode");
    assert.deepEqual([1, 2, 3, 4].map(i => h.get(`[Channel1_Stem${i}]`, "mute")), [0, 1, 1, 1]);
    h.press("keyboardPadPressed", group, 0x45, 0x97);
    h.press("keyboardPadPressed", group, 0x45, 0x97, 0);
    assert.equal(h.m._stemMomentary[group].active, true);
    h.press("keyboardPadPressed", group, 0x44, 0x97, 0);
    assert.deepEqual([1, 2, 3, 4].map(i => h.get(`[Channel1_Stem${i}]`, "mute")), [0, 1, 0, 1]);
    h.press("keyboardPadShiftPressed", group, 0x45, 0x98);
    assert.deepEqual([1, 2, 3, 4].map(i => h.get(`[Channel1_Stem${i}]`, "mute")), [0, 1, 0, 0]);
    h.press("keyboardPadShiftPressed", group, 0x45, 0x98, 0);
    h.press("keyboardPadPressed", group, 0x40, 0x97);
    assert.equal(h.get("[Channel1_Stem1]", "mute"), 1);
    h.press("keyboardPadShiftPressed", group, 0x41, 0x98);
    assert.deepEqual([1, 2, 3, 4].map(i => h.get(`[Channel1_Stem${i}]`, "mute")), [1, 0, 1, 1]);
    assert.ok(!h.writes.some(([, c]) => c === "pitch_adjust"));
});

test("Extended Stem FX variant and engine LED synchronization survive", () => {
    const h = mapping(true);
    h.seed(decks[1], "stem_count", 4);
    h.m.STEMS_PAD5_8_MODE = "fx";
    h.press("keyboardPadPressed", decks[1], 0x44, 0x99);
    assert.equal(h.get("[QuickEffectRack1_[Channel2_Stem1]]", "enabled"), 1);
    h.press("keyboardPadShiftPressed", decks[1], 0x44, 0x9A);
    assert.equal(h.get("[QuickEffectRack1_[Channel2_Stem1]]", "next_chain_preset"), 1);
    assert.ok(h.messages.some(([s, n, v]) => s === 0x99 && n === 0x44 && v === 0x7F));
});

test("Extended SHIFT + EQ keeps Stem routing, pickup and deck-local SHIFT", () => {
    const h = mapping(true);
    const group = decks[0];
    h.seed(group, "stem_count", 4);
    h.seed("[Channel1_Stem4]", "volume", 8192 / 16383);
    h.m._shiftDeck1 = true;
    h.press("eqHighMsb", group, 0x07, 0xB0, 127);
    h.press("eqHighLsb", group, 0x27, 0xB0, 127);
    assert.equal(h.get("[Channel1_Stem4]", "volume"), 8192 / 16383);
    h.press("eqHighMsb", group, 0x07, 0xB0, 64);
    h.press("eqHighLsb", group, 0x27, 0xB0, 0);
    h.press("eqHighMsb", group, 0x07, 0xB0, 100);
    h.press("eqHighLsb", group, 0x27, 0xB0, 0);
    assert.equal(h.get("[Channel1_Stem4]", "volume"), 12800 / 16383);
    h.seed("[EqualizerRack1_[Channel2]_Effect1]", "parameter3", 8192 / 16383);
    h.press("eqHighMsb", decks[1], 0x07, 0xB1, 64);
    h.press("eqHighLsb", decks[1], 0x27, 0xB1, 0);
    assert.equal(h.m.eqStemLastMode[decks[1]], "eq");
});

test("Extended SHIFT + 4BEAT uses only reloop_toggle, never Vinyl or a new 4-beat loop", () => {
    decks.forEach(group => {
        ["none", "stored", "active"].forEach(state => {
            const h = mapping(true);
            h.seed(group, "track_loaded", 1);
            h.seed(group, "loop_enabled", state === "active" ? 1 : 0);
            h.seed(group, "loop_start_position", state === "none" ? -1 : 100);
            h.seed(group, "loop_end_position", state === "none" ? -1 : 200);
            h.writes.length = 0;
            h.messages.length = 0;
            h.press("shiftReloopExitPressed", group);
            assert.deepEqual(h.writes, [[group, "reloop_toggle", 1]]);
            h.press("shiftReloopExitPressed", group, 0, 0x90, 0);
            assert.deepEqual(h.writes, [[group, "reloop_toggle", 1]], "Release does nothing");
            assert.deepEqual(plain(h.m._vinylWanted), [false, false]);
            assert.equal(h.messages.length, 0, "No hardware Vinyl command");
        });
    });
});

test("Extended Vinyl helper still sets each deck's hardware vinyl state", () => {
    const h = mapping(true);
    h.m._applyVinylState(1, true);
    assert.deepEqual(plain(h.m._vinylWanted), [false, true]);
    assert.ok(h.messages.some(([s, n, v]) => s === 0x91 && n === 0x17 && v === 0x7F));
    assert.equal(h.m.jogVinylEnabled(decks[0]), false);
    assert.equal(h.m.jogVinylEnabled(decks[1]), true);
});

test("Extended PLAY uses Basic by default, optional softstart/brake can cancel", () => {
    const h = mapping(true);
    h.press("playPressed");
    assert.equal(h.get(decks[0], "play"), 1);
    h.seed(decks[0], "play", 0);
    h.m.PLAY_BRAKE_ON_VINYL = true;
    h.m._applyVinylState(0, true);
    h.press("playPressed");
    assert.ok(h.softStarts.has(1));
    h.press("playPressed");
    assert.ok(h.brakes.has(1));
    h.press("playPressed");
    assert.ok(!h.brakes.has(1));
    assert.equal(h.get(decks[0], "play"), 1);
    assert.equal(h.m._brakeWatchTimer[0], -1);
});

test("Extended PLAY commits preview even with vinyl brake enabled", () => {
    const h = mapping(true);
    h.m.PLAY_BRAKE_ON_VINYL = true;
    h.m._applyVinylState(0, true);
    h.seed(decks[0], "play", 1);
    h.m._hotcuePreview[decks[0]] = 1;
    h.press("playPressed");
    assert.equal(h.m._hotcuePreview[decks[0]], 0);
    assert.equal(h.get(decks[0], "play"), 1);
    assert.equal(h.brakes.size, 0);
});

test("Extended SHIFT + CUE short/350ms-long presses separate Quantize/Keylock", () => {
    const h = mapping(true);
    h.press("shiftChannelCuePressed");
    assert.equal(h.timers.get(h.m._quantizeLP.timer[decks[0]]).ms, 350);
    h.press("shiftChannelCuePressed", decks[0], 0, 0x90, 0);
    assert.equal(h.get(decks[0], "quantize"), 1);
    h.press("shiftChannelCuePressed");
    h.fire(h.m._quantizeLP.timer[decks[0]]);
    assert.equal(h.get(decks[0], "keylock"), 1);
    h.press("shiftChannelCuePressed", decks[0], 0, 0x90, 0);
    assert.equal(h.get(decks[0], "quantize"), 1);
    assert.ok(!h.writes.some(([, c]) => c === "bpm_tap"));
});

test("Custom Beat FX keeps groups, direct slots, bounds and dual routing", () => {
    const h = mapping(true);
    h.press("beatFxSelectPressed");
    assert.equal(h.get(unit, "loaded_chain_preset"), 6);
    h.press("beatFxRightPressed");
    assert.equal(h.get(unit, "loaded_chain_preset"), 7);
    h.press("beatFxLeftPressed");
    assert.equal(h.get(unit, "loaded_chain_preset"), 6);
    h.press("beatFxSelectShiftPressed");
    assert.equal(h.get(unit, "loaded_chain_preset"), 3);
    assert.equal(h.get(unit, "group_[Channel1]_enable"), 1);
    assert.equal(h.get(unit, "group_[Channel2]_enable"), 0);
    assert.equal(h.get("[EffectRack1_EffectUnit2]", "group_[Channel2]_enable"), 1);
    h.press("beatFxOnOffPressed");
    assert.equal(h.get(slot, "enabled"), 1);
    h.press("beatFxOnOffShiftPressed");
    assert.equal(h.get(slot, "enabled"), 0);
    const before = h.m._beatFxPresetState.absoluteIndex;
    h.seed(unit, "num_chain_presets", 2);
    h.seed("[EffectRack1_EffectUnit2]", "num_chain_presets", 2);
    h.press("beatFxSelectPressed");
    assert.equal(h.m._beatFxPresetState.absoluteIndex, before);
});

test("Extended Pad FX toggle preserves manually disabled unit/routing on OFF", () => {
    const h = mapping(true);
    h.press("padModeKeyPressed", "[PadMode]", 0x1E);
    h.press("padFxPadPressed", decks[0], 0x10);
    assert.equal(h.get(slot, "enabled"), 1);
    assert.equal(h.get(unit, "enabled"), 1);
    h.seed(unit, "enabled", 0);
    h.seed(unit, "group_[Channel1]_enable", 0);
    h.press("padFxPadPressed", decks[0], 0x10);
    assert.equal(h.get(slot, "enabled"), 0);
    assert.equal(h.get(unit, "enabled"), 0);
    assert.equal(h.get(unit, "group_[Channel1]_enable"), 0);
    h.press("padModeKeyPressed", "[PadMode]", 0x6B);
    h.press("padFxPadPressed", decks[0], 0x57);
    assert.equal(h.get("[EffectRack1_EffectUnit3]", "enabled"), 1);
    assert.equal(h.get("[EffectRack1_EffectUnit3_Effect1]", "enabled"), 1);
});

test("Extended shutdown restores held Stems, stops FX/timers, disconnects overlay", () => {
    const h = mapping(true);
    h.seed(decks[0], "stem_count", 4);
    h.seed("[Channel1_Stem2]", "mute", 1);
    h.press("keyboardPadPressed", decks[0], 0x44);
    h.press("shiftChannelCuePressed", decks[1]);
    h.m.PLAY_BRAKE_ON_VINYL = true;
    h.m._applyVinylState(0, true);
    h.seed(decks[0], "play", 1);
    h.press("playPressed");
    h.press("loadPressed", decks[1]);
    h.m._latchPeak(1, 1);
    const owned = h.m._extendedConnections.slice();
    let shutdowns = 0;
    const basic = h.m._basicShutdown;
    h.m._basicShutdown = () => { shutdowns++; basic(); };
    h.m.shutdown();
    assert.equal(shutdowns, 1);
    assert.equal(h.m._stemMomentary[decks[0]].active, false);
    assert.deepEqual([1, 2, 3, 4].map(i => h.get(`[Channel1_Stem${i}]`, "mute")), [0, 1, 0, 0]);
    assert.equal(h.timers.size, 0);
    assert.equal(h.brakes.size, 0);
    assert.equal(h.softStarts.size, 0);
    assert.ok(owned.every(c => !c.connected));
    assert.equal(h.m._extendedConnections.length, 0);
});

console.log(`${passed} regression tests passed; ${bindings.length} distinct XML Script-Bindings checked per variant.`);
