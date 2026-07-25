#!/bin/bash
# rotateImage.sh - Shell wrapper for rotating images using convert_to_webp.py
# Usage: ./rotateImage.sh <image_path> <degrees>
# Example: ./rotateImage.sh v2/assets/pics/spritz.webp -90  (90° clockwise)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

# Create venv if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi

# Activate venv
source "$VENV_DIR/bin/activate"

# Install Pillow if not already installed
pip install --quiet --upgrade Pillow

# Run the Python script with rotation arguments
python3 "$SCRIPT_DIR/convert_to_webp.py" --rotate "$@"
