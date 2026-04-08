#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# alle Zielverzeichnisse
MIXXX_DIRS=(
    "${HOME}/.mixxx"
    "${HOME}/.mixxx-test"
)

link_dir() {
    local name="$1"

    for base in "${MIXXX_DIRS[@]}"; do
        local src="${SCRIPT_DIR}/${name}"
        local dst="${base}/${name}"

        [ -d "$src" ] || continue

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
            echo "[$base] Linked: $target -> $file"
        done
    done
}

link_dir "controllers"
link_dir "effects"

echo "Fertig."