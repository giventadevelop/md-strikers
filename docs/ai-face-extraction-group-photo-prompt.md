# AI face extraction: prompt for group / team photos

Use this with AI image editing or batch extraction tools when you need **one passport-style portrait per distinct person** from a **single group photograph** (team photo, crowded rows, people wearing glasses, or faces partially visible between others).

## Main prompt (copy as one block)

```
TASK: Face extraction from ONE group photograph (team / crowd / layered rows).

GOAL: Produce exactly ONE portrait crop per DISTINCT person visible in the source image. Every person who has a recognizable face (full or partial) must appear exactly once. No person may appear twice.

INCLUSION — extract a portrait for each individual who meets ANY of these:
- Face is fully visible OR partially visible (e.g. between two heads, only eyes/nose/mouth visible).
- Wearing glasses, sunglasses, hats, or face masks (still extract if identity is one distinct person).
- In back row, side edges, or "sandwiched" between others — do not skip because of tight spacing.
- Different clothing or position = different person; do not merge two people into one crop.

EXCLUSION / DEDUPLICATION:
- If the same person appears only once in the photo, output them only once.
- Do not duplicate the same individual across multiple crops (no twin tiles of the same face).
- Do not invent faces or copy a face into a slot where a different person stood.

CROP STYLE (match across all outputs):
- Passport / ID style: head and upper shoulders, centered, neutral gray or off-white seamless background (replace original background behind the head).
- Consistent scale: faces roughly similar size across all crops.
- Even lighting; reduce harsh shadows if needed without changing facial identity.

OUTPUT:
- One file per person, sequential naming ONLY: person_01, person_02, … person_N with NO gaps and NO duplicate numbers (fix: if N people, filenames run 01 through N exactly once each).
- If presenting as a grid, arrange in row-major order (left-to-right, top-to-bottom) matching the order people appear in the source (e.g. left-to-right in front row first, then next row, OR clearly state your ordering rule and follow it).

QUALITY CHECK BEFORE FINALIZING:
- Count distinct people in the source; count output crops; the two counts must match.
- Scan for duplicate faces; remove duplicates.
- Scan for anyone clearly in the photo but missing from outputs; add them.

The source image is a single frame; treat overlapping bodies as separate individuals when their faces are distinguishable.
```

## Negative / avoid (optional separate field)

```
Avoid: duplicate filenames, repeated numbering, skipping sequence numbers, exporting the same person twice with different numbers, tiny inconsistent crops, or mixing two faces in one crop. Avoid fantasy faces not present in the source.
```

## Why outputs sometimes fail

| Problem | Mitigation (built into prompt above) |
|--------|--------------------------------------|
| Same person exported twice | Dedup + “exactly one crop per distinct person” |
| Duplicate or messy filenames (`person_09` twice, gaps in numbering) | Sequential `person_01`…`person_N`, no gaps, no duplicate numbers |
| Missing people in back row or between heads | Explicit inclusion for partial / sandwiched faces |
| Hallucinated faces | “Do not invent”; optional tool flag: only source pixels |

## Hybrid workflow (recommended for production)

Pure generative tools may still duplicate or miss faces. For best results:

1. Run **face detection** (OpenCV, MediaPipe, RetinaFace, etc.) + **manual review** for partial faces.
2. Crop and **background-replace** per face in an editor, **or** use the prompt above for the first pass then **human QA** (delete duplicates, rename to `person_01`…`person_N`).

## Related (this repo)

- Squad collage split (grid crops from a single collage): `scripts/split-squad-collage.mjs`, Cursor rule `.cursor/rules/squad_collage_split.mdc`.
