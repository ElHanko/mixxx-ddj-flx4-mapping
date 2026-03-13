# Mixxx Pioneer DDJ-FLX4 Mapping

Custom Mixxx controller mapping for the Pioneer DDJ-FLX4.

This mapping started as the official FLX4 mapping but has been heavily modified
and partially rewritten. Some components originate from my previous
Hercules Inpulse 300 Mk2 mapping.

The goal is a workflow that feels closer to standalone Pioneer players
while still taking advantage of Mixxx features.

## Features

- Improved Beat FX behaviour
- PAD FX1 / PAD FX2 implementation
- Sampler LED state machine
- Keyshift pad mode
- Instant doubles
- Browser focus toggle
- Quantize / Keylock shortcuts
- Vinyl mode toggle via SHIFT + 4BEAT/EXIT
- Optional vinyl brake / soft start behaviour on the PLAY button
- Configurable controller behaviour for selected features

## Configuration

Some optional behaviours can be adjusted directly in the script.

### Optional vinyl brake on PLAY

The mapping can optionally apply vinyl-style transport behaviour to the normal
PLAY button when Vinyl Mode is active.

This feature is disabled by default.

When enabled:

- pressing PLAY on a playing deck applies a brake
- pressing PLAY on a stopped deck starts playback with a soft start
- pressing PLAY during an active brake cancels the brake and resumes playback

To enable it, set the following option in the script:

    PioneerDDJFLX4.PLAY_BRAKE_ON_VINYL = true;

If disabled, the PLAY button keeps the normal Mixxx Play/Pause behaviour.

## Status

Work in progress.  
I will continue improving the mapping as I discover issues or new ideas.

## Author

ElHanko

## License
MIT
