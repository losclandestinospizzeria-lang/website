#!/usr/bin/env python3
"""Recompress all .webp files in docs/images/web/ with optional rollback.

Usage:
    python3 utils/imageChanger/recompress_webp.py --dry-run
    python3 utils/imageChanger/recompress_webp.py --quality 70
    python3 utils/imageChanger/recompress_webp.py --rollback pizza2-480.webp
    python3 utils/imageChanger/recompress_webp.py --rollback all
"""

import argparse
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow is required: pip install Pillow") from exc

ROOT = Path(__file__).resolve().parent.parent.parent
IMAGES_DIR = ROOT / "docs" / "images" / "web"
BACKUP_DIR = Path(__file__).resolve().parent / "backups"


def backup_path(src: Path) -> Path:
    return BACKUP_DIR / src.name


def do_backup(src: Path) -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    bkp = backup_path(src)
    if not bkp.exists():
        shutil.copy2(src, bkp)


def bytes_to_kib(n: int) -> float:
    return n / 1024


def recompress_file(src: Path, quality: int, dry_run: bool) -> tuple[int, int]:
    with Image.open(src) as img:
        # Preserve alpha when present
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")

        original_size = src.stat().st_size

        tmp = src.with_suffix(".tmp.webp")
        img.save(tmp, "WEBP", quality=quality, method=6)

        new_size = tmp.stat().st_size

        if dry_run:
            tmp.unlink()
            return original_size, new_size

        if new_size < original_size:
            do_backup(src)
            tmp.replace(src)
            return original_size, new_size

        # If recompressed is larger, keep original and discard tmp
        tmp.unlink()
        return original_size, original_size


def recompress_all(quality: int, dry_run: bool) -> None:
    files = sorted(IMAGES_DIR.glob("*.webp"))
    if not files:
        print("No .webp files found.")
        return

    total_old = 0
    total_new = 0
    skipped = 0

    for src in files:
        old_size, new_size = recompress_file(src, quality, dry_run)
        total_old += old_size
        total_new += new_size

        if new_size < old_size:
            action = "would replace" if dry_run else "replaced"
            print(
                f"{action:12} {src.name:40} "
                f"{bytes_to_kib(old_size):7.1f} KiB -> {bytes_to_kib(new_size):7.1f} KiB "
                f"(-{bytes_to_kib(old_size - new_size):6.1f} KiB, "
                f"-{100 * (old_size - new_size) / old_size:.1f}%)"
            )
        else:
            skipped += 1
            print(f"kept        {src.name:40} {bytes_to_kib(old_size):7.1f} KiB (no savings)")

    print("-" * 80)
    print(
        f"Total: {bytes_to_kib(total_old):.1f} KiB -> {bytes_to_kib(total_new):.1f} KiB "
        f"(-{bytes_to_kib(total_old - total_new):.1f} KiB)"
    )
    if dry_run:
        print("(dry-run: no files were changed)")
    else:
        print(f"Skipped {skipped} file(s) because recompression was not smaller.")


def rollback(target: str) -> None:
    if target == "all":
        files = sorted(BACKUP_DIR.glob("*.webp"))
        if not files:
            print("No backups found.")
            return
        for bkp in files:
            shutil.copy2(bkp, IMAGES_DIR / bkp.name)
            print(f"restored {bkp.name}")
        return

    bkp = BACKUP_DIR / target
    if not bkp.exists():
        print(f"No backup found for {target}. Try git checkout instead.", file=sys.stderr)
        return
    shutil.copy2(bkp, IMAGES_DIR / target)
    print(f"restored {target}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Recompress webp images with rollback support.")
    parser.add_argument("--quality", type=int, default=70, help="WebP quality 1-100 (default: 70)")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing files.")
    parser.add_argument("--rollback", metavar="FILE|all", help="Restore one file or all files from backup.")
    args = parser.parse_args()

    if args.rollback:
        rollback(args.rollback)
        return 0

    recompress_all(args.quality, args.dry_run)
    return 0


if __name__ == "__main__":
    sys.exit(main())
