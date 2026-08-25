#!/usr/bin/env python3
"""Create compressed snapshots of the large local experiment dataset.

This script keeps the original dataset folders on disk and writes .tar.zst
archives in dataset/archives/ so their raw contents are not sent as large
uncompressed files to the Git repository.

Example:
    python compress_dataset.py
    python compress_dataset.py --compressor gzip
    python compress_dataset.py --folders zero_shot few_shot
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

DEFAULT_FOLDERS = ("zero_shot", "few_shot", "chain_of_thought")


def ensure_archive_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def resolve_compressor(name: str) -> str:
    name = name.lower()
    if name in {"zstd", "zst"}:
        if shutil.which("tar") and shutil.which("zstd"):
            return "zstd"
        raise RuntimeError("zstd is required but not installed.")
    if name in {"gzip", "gz"}:
        return "gzip"
    raise ValueError(f"Unsupported compressor: {name}")


def archive_folder(dataset_root: Path, folder_name: str, archive_dir: Path, compressor: str) -> Path:
    archive_name = f"{folder_name}.tar.{'zst' if compressor == 'zstd' else 'gz'}"
    archive_path = archive_dir / archive_name

    if archive_path.exists():
        print(f"[skip] {archive_path} already exists")
        return archive_path

    source_path = dataset_root / folder_name
    if not source_path.exists():
        print(f"[missing] {source_path} not found, skipping")
        return archive_path

    if compressor == "zstd":
        cmd = ["tar", "--zstd", "-cf", str(archive_path), "-C", str(dataset_root), folder_name]
    else:
        cmd = ["tar", "-czf", str(archive_path), "-C", str(dataset_root), folder_name]

    print(f"[compressing] {source_path} -> {archive_path}")
    subprocess.run(cmd, check=True)
    return archive_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compress local dataset folders without deleting them.")
    parser.add_argument("--dataset-root", type=Path, default=Path("dataset"), help="Path to the dataset root directory.")
    parser.add_argument("--archive-dir", type=Path, default=None, help="Where to store compressed archives. Defaults to dataset/archives.")
    parser.add_argument("--folders", nargs="*", default=list(DEFAULT_FOLDERS), help="Folders to compress. Defaults to zero_shot few_shot chain_of_thought.")
    parser.add_argument("--compressor", default="zstd", choices=["zstd", "gzip"], help="Compression algorithm to use.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    dataset_root = args.dataset_root.resolve()
    archive_dir = (args.archive_dir or dataset_root / "archives").resolve()

    try:
        compressor = resolve_compressor(args.compressor)
    except (RuntimeError, ValueError) as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 2

    ensure_archive_dir(archive_dir)

    created = []
    for folder_name in args.folders:
        path = archive_folder(dataset_root, folder_name, archive_dir, compressor)
        if path.exists() and path.name not in {p.name for p in created}:
            created.append(path)

    if not created:
        print("No archives were created.")
        return 0

    print("\nCompressed archives:")
    for arch in created:
        print(f"- {arch}")
    print("\nRaw dataset folders were preserved locally and can be removed later with your own retention policy.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
