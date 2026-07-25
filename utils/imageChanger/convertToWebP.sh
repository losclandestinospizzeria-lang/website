#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
PYTHON_SCRIPT="$SCRIPT_DIR/convert_to_webp.py"

# Paths relative to repo root (two levels up from utils/imageChanger/)
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PICS_DIR="$REPO_ROOT/v2/assets/pics"

usage() {
  echo "Usage:"
  echo "  $0 <folder>                  Convert all images in <folder> to WebP"
  echo "  $0 --responsive-hero <file>  Generate hero srcset variants (480w, 960w)"
  echo "  $0 --favicons <file>         Generate favicon.ico and favicon-32.png"
  echo "  $0 --gallery-thumbs          Generate -thumb.webp (600px) for all gallery images"
  echo "  $0 --generate-assets         Generate ALL assets (hero variants + favicons + gallery thumbs)"
  exit 1
}

if [ "$#" -lt 1 ]; then
  usage
fi

# --- create venv if it doesn't exist ---
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment at $VENV_DIR ..."
  python3 -m venv "$VENV_DIR"
fi

# --- activate venv ---
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

# --- install Pillow if not already installed ---
if ! python -c "import PIL" 2>/dev/null; then
  echo "Installing Pillow ..."
  pip install --quiet --upgrade Pillow
fi

# --- dispatch ---
case "$1" in
  --responsive-hero)
    if [ "$#" -ne 2 ]; then usage; fi
    python "$PYTHON_SCRIPT" --responsive-hero "$2"
    ;;
  --favicons)
    if [ "$#" -ne 2 ]; then usage; fi
    python "$PYTHON_SCRIPT" --favicons "$2"
    ;;
  --gallery-thumbs)
    echo "=== Generating gallery thumbnails in $PICS_DIR ==="
    python "$PYTHON_SCRIPT" --gallery-thumbs "$PICS_DIR"
    ;;
  --generate-assets)
    HERO="$PICS_DIR/external.webp"
    LOGO="$PICS_DIR/logo.webp"
    echo "=== Generating hero responsive variants from $HERO ==="
    python "$PYTHON_SCRIPT" --responsive-hero "$HERO"
    echo ""
    echo "=== Generating favicons from $LOGO ==="
    python "$PYTHON_SCRIPT" --favicons "$LOGO"
    echo ""
    echo "=== Generating gallery thumbnails in $PICS_DIR ==="
    python "$PYTHON_SCRIPT" --gallery-thumbs "$PICS_DIR"
    echo ""
    echo "All assets generated in: $PICS_DIR"
    ;;
  *)
    python "$PYTHON_SCRIPT" "$1"
    ;;
esac
