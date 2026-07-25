import sys
import os
from pathlib import Path
from PIL import Image

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".webp", ".ico", ".svg"}


def inspect_image(path: str) -> None:
    p = Path(path).resolve()

    if not p.exists():
        print(f"[FAIL] '{p}' does not exist.", file=sys.stderr)
        sys.exit(1)

    if not p.is_file():
        print(f"[FAIL] '{p}' is not a file.", file=sys.stderr)
        sys.exit(1)

    if p.suffix.lower() not in SUPPORTED_EXTENSIONS:
        print(f"[SKIP] '{p.name}' — unsupported format.", file=sys.stderr)
        sys.exit(1)

    size_bytes = os.path.getsize(p)
    size_kib = size_bytes / 1024

    try:
        with Image.open(p) as img:
            width, height = img.size
            mode = img.mode
            fmt = img.format or p.suffix.lstrip(".").upper()

        print(f"File   : {p}")
        print(f"Format : {fmt}  |  Mode: {mode}")
        print(f"Size   : {width}x{height} px")
        print(f"Weight : {size_kib:.1f} KiB  ({size_bytes:,} bytes)")

    except Exception as e:
        print(f"[FAIL] Could not open '{p}': {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Inspect an image file: dimensions, format, mode, and file size.",
        epilog="Example: inspect_image.py v2/assets/pics/logo.webp",
    )
    parser.add_argument(
        "image",
        metavar="IMAGE",
        help="Path to the image file to inspect",
    )
    args = parser.parse_args()
    inspect_image(args.image)
