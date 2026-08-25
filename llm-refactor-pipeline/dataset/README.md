# Dataset storage policy

This repository stores large experiment outputs in `dataset/` as local raw folders.
To prevent huge uncompressed data from being pushed to the Git repository, use the
compression helper below and keep compressed archives locally under `dataset/archives/`.

## Create compressed snapshots

```bash
cd llm-refactor-pipeline
python compress_dataset.py
```

This keeps the original raw folders such as `zero_shot/`, `few_shot/` and
`chain_of_thought/` on disk, while creating tar.zst files in:

```text
dataset/archives/
```

Examples:

```text
dataset/archives/zero_shot.tar.zst
dataset/archives/few_shot.tar.zst
dataset/archives/chain_of_thought.tar.zst
```

## Extract a snapshot later

```bash
tar --zstd -xf dataset/archives/zero_shot.tar.zst -C /tmp
```

The raw dataset directories and generated archives are local-only by default.
The Git repo is configured to ignore them to keep pushes small and within hosting limits.
