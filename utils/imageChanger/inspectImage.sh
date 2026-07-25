#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
PYTHON_SCRIPT="$SCRIPT_DIR/inspect_image.py"

usage() {
  echo "Usage:"
  echo "  $0 <image_file>   Inspect dimensions, format, mode and file size of an image"
  echo ""
  echo "Supported formats: JPEG, PNG, WebP, GIF, BMP, TIFF, ICO"
  echo ""
  echo "Example:"
  echo "  $0 v2/assets/pics/logo.webp"
  exit 1
}

if [ "$#" -ne 1 ]; then
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

python "$PYTHON_SCRIPT" "$1"
