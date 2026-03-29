#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIXXX_DIR="${HOME}/.mixxx-test"

link_dir() {
    local name="$1"
    local src="${SCRIPT_DIR}/${name}"
    local dst="${MIXXX_DIR}/${name}"

    [ -d "$src" ] || return

    mkdir -p "$dst"

    for file in "$src"/*; do
        [ -e "$file" ] || continue

        local target="${dst}/$(basename "$file")"

        if [ -L "$target" ] || [ -f "$target" ]; then
            rm -f "$target"
        elif [ -d "$target" ]; then
            rm -rf "$target"
        fi

        ln -s "$file" "$target"
        echo "Linked: $target -> $file"
    done
}

link_dir "controllers"
link_dir "effects"

echo "Fertig."