#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIXXX_DIR="${HOME}/.mixxx-test"

for name in controllers effects; do
    src="${SCRIPT_DIR}/${name}"
    dst="${MIXXX_DIR}/${name}"

    [ -d "$src" ] || continue
    mkdir -p "$dst"

    for file in "$src"/*; do
        [ -e "$file" ] || continue
        target="${dst}/$(basename "$file")"
        rm -f "$target"
        ln -s "$file" "$target"
        echo "Linked: $target -> $file"
    done
done

echo "Fertig."