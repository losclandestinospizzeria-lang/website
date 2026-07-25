#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
PYTHON_SCRIPT="$SCRIPT_DIR/upscale_image.py"

usage() {
  echo "Usage:"
  echo "  $0 <image> [options]"
  echo ""
  echo "Options:"
  echo "  --scale <factor>     Scale factor (default: 2.0)"
  echo "  --width <px>         Target width in pixels (maintains aspect ratio)"
  echo "  --height <px>        Target height in pixels (maintains aspect ratio)"
  echo "  -o <output>          Output path (default: <name>-upscaled.<ext>)"
  echo "  --no-sharpen         Disable post-upscale sharpening"
  echo "  --quality <1-100>    Output quality for WebP/JPEG (default: 90)"
  echo ""
  echo "Examples:"
  echo "  $0 photo.webp"
  echo "  $0 photo.webp --scale 3"
  echo "  $0 photo.webp --width 2400 -o big.webp"
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

python "$PYTHON_SCRIPT" "$@"
