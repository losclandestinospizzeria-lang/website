import sys
import os
from pathlib import Path
from PIL import Image, ImageFilter

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".webp"}


def upscale_image(
    src_path: str,
    scale: float = 2.0,
    target_width: int | None = None,
    target_height: int | None = None,
    out_path: str | None = None,
    sharpen: bool = True,
    quality: int = 90,
) -> None:
    """Upscale an image using LANCZOS resampling with optional sharpening.

    Args:
        src_path:      Path to the source image.
        scale:         Scale factor (e.g. 2.0 for 2x). Ignored if target_width
                       or target_height is given.
        target_width:  Target width in pixels. If set, scale is ignored.
        target_height: Target height in pixels. If set together with target_width,
                       aspect ratio may change. If set alone, width is computed
                       proportionally.
        out_path:      Output path. If None, saves alongside source with
                       '-upscaled' suffix.
        sharpen:       Apply a light unsharp mask after upscaling to recover
                       perceived detail.
        quality:       Output quality for WebP/JPEG (1-100).
    """
    src = Path(src_path).resolve()
    if not src.exists():
        print(f"[FAIL] Image '{src}' not found.", file=sys.stderr)
        return

    try:
        with Image.open(src) as img:
            img = img.convert("RGBA") if img.mode in ("RGBA", "P") else img.convert("RGB")
            orig_w, orig_h = img.width, img.height

            if target_width and target_height:
                new_w, new_h = target_width, target_height
            elif target_width:
                ratio = target_width / orig_w
                new_w, new_h = target_width, int(orig_h * ratio)
            elif target_height:
                ratio = target_height / orig_h
                new_w, new_h = int(orig_w * ratio), target_height
            else:
                new_w = int(orig_w * scale)
                new_h = int(orig_h * scale)

            if new_w <= orig_w and new_h <= orig_h:
                print(f"[SKIP] Target size ({new_w}x{new_h}) is not larger than "
                      f"source ({orig_w}x{orig_h}). No upscaling needed.")
                return

            upscaled = img.resize((new_w, new_h), Image.LANCZOS)

            if sharpen:
                upscaled = upscaled.filter(
                    ImageFilter.UnsharpMask(radius=1, percent=80, threshold=2)
                )

            if out_path:
                out = Path(out_path).resolve()
            else:
                out = src.parent / f"{src.stem}-upscaled{src.suffix}"

            out.parent.mkdir(parents=True, exist_ok=True)

            fmt = "WEBP" if out.suffix.lower() == ".webp" else None
            if out.suffix.lower() in (".jpg", ".jpeg"):
                upscaled = upscaled.convert("RGB")
                upscaled.save(out, "JPEG", quality=quality)
            elif out.suffix.lower() == ".webp":
                upscaled.save(out, "WEBP", quality=quality, method=6)
            else:
                upscaled.save(out)

            print(f"[OK]  {src.name}  ->  {out.name}")
            print(f"      {orig_w}x{orig_h}  ->  {new_w}x{new_h}  "
                  f"({new_w / orig_w:.1f}x)")

    except Exception as e:
        print(f"[FAIL] {src}: {e}", file=sys.stderr)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Upscale an image (improve resolution) using LANCZOS resampling "
                    "with optional sharpening.",
        epilog="Example:\n"
               "  upscale_image.py photo.webp\n"
               "  upscale_image.py photo.webp --scale 3\n"
               "  upscale_image.py photo.webp --width 2400\n"
               "  upscale_image.py photo.webp --width 2400 --height 1600 -o big.webp",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "image",
        metavar="IMAGE",
        help="Path to the image file to upscale",
    )
    parser.add_argument(
        "--scale",
        type=float,
        default=2.0,
        help="Scale factor (default: 2.0). Ignored if --width or --height is given.",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=None,
        help="Target width in pixels. Maintains aspect ratio unless --height is also set.",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=None,
        help="Target height in pixels. Maintains aspect ratio unless --width is also set.",
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output path (default: <name>-upscaled.<ext> alongside source)",
    )
    parser.add_argument(
        "--no-sharpen",
        action="store_true",
        help="Disable post-upscale sharpening",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=90,
        help="Output quality for WebP/JPEG (1-100, default: 90)",
    )
    args = parser.parse_args()

    upscale_image(
        args.image,
        scale=args.scale,
        target_width=args.width,
        target_height=args.height,
        out_path=args.output,
        sharpen=not args.no_sharpen,
        quality=args.quality,
    )
