#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MIXXX_DIRS=(
    "${HOME}/.mixxx"
    "${HOME}/.mixxx-test"
)

link_file() {
    local src="$1"
    local target="$2"

    if [ -L "$target" ]; then
        rm -f "$target"
    elif [ -e "$target" ]; then
        echo "[WARN] Existing file or directory left unchanged: $target" >&2
        return
    fi

    ln -s "$src" "$target"
    echo "Linked: $target -> $src"
}

link_tree() {
    local src="$1"
    local dst="$2"

    mkdir -p "$dst"

    for entry in "$src"/*; do
        [ -e "$entry" ] || continue

        local target="${dst}/$(basename "$entry")"

        if [ -d "$entry" ]; then
            if [ -e "$target" ] && [ ! -d "$target" ]; then
                echo "[WARN] Existing file blocks directory; left unchanged: $target" >&2
                continue
            fi
            link_tree "$entry" "$target"
        else
            link_file "$entry" "$target"
        fi
    done
}

link_into_mixxx_dirs() {
    local name="$1"
    local src="${SCRIPT_DIR}/${name}"

    [ -d "$src" ] || return

    for base in "${MIXXX_DIRS[@]}"; do
        local dst="${base}/${name}"
        link_tree "$src" "$dst"
    done
}

link_into_mixxx_dirs "controllers"
link_into_mixxx_dirs "effects"

echo "Fertig."
