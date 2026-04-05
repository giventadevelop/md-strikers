/**
 * Split squad collage sheets into per-cell JPEGs.
 *
 * Layouts:
 *   4x4 — 16 cells, skip bottom-right (index 15) → 15 files (squad-1.jpg, portrait sheet).
 *   5x3 — 15 cells, no skip → 15 files (landscape contact sheets).
 *   3x1 — 3 cells in one row → 3 files (squad-4.jpg when it shows only three people).
 *
 * **Gutter / cutoff fix:** Grids are split on the full pixel dimensions; contact sheets often have
 * white borders, outer padding, and gutters between cells. Without inset, crops can slice through
 * faces or include divider lines. Each layout uses `outerPct` (crop the sheet edges) and
 * `cellInsetRatio` (shrink each cell inward from computed lines).
 *
 * Tune: `node scripts/split-squad-collage.mjs --outer-pct 0.03 --cell-inset-ratio 0.04 4`
 *
 * Usage:
 *   node scripts/split-squad-collage.mjs
 *   node scripts/split-squad-collage.mjs 2 3 4
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SQUAD_DIR = path.join(root, 'public/images/md_strikers_media/squad');
const OUT_DIR = path.join(SQUAD_DIR, 'members');

/**
 * @type {Record<string, { cols: number; rows: number; skip: Set<number>; outerPct: number; cellInsetRatio: number }>}
 *
 * outerPct: fraction [0,0.15) trimmed from each edge of the source before dividing (removes outer frame).
 * cellInsetRatio: fraction of min(cellW,cellH) applied on each side inside the cell (avoids gutter lines).
 */
const LAYOUTS = {
  '4x4': { cols: 4, rows: 4, skip: new Set([15]), outerPct: 0.012, cellInsetRatio: 0.02 },
  '5x3': { cols: 5, rows: 3, skip: new Set(), outerPct: 0.022, cellInsetRatio: 0.038 },
  /** Three portraits in one horizontal row (landscape). */
  '3x1': { cols: 3, rows: 1, skip: new Set(), outerPct: 0.02, cellInsetRatio: 0.04 },
};

/** @param {{ left: number; top: number; width: number; height: number }} r */
function insetRect(r, insetPx) {
  const i = Math.max(0, Math.round(insetPx));
  const w = Math.max(1, r.width - 2 * i);
  const h = Math.max(1, r.height - 2 * i);
  return { left: r.left + i, top: r.top + i, width: w, height: h };
}

function cellBounds(col, row, ox, oy, innerW, innerH, cols, rows) {
  const left = ox + Math.round((col * innerW) / cols);
  const top = oy + Math.round((row * innerH) / rows);
  const right = ox + Math.round(((col + 1) * innerW) / cols);
  const bottom = oy + Math.round(((row + 1) * innerH) / rows);
  return { left, top, width: right - left, height: bottom - top };
}

function squadJob(squadNum) {
  const input = path.join(SQUAD_DIR, `squad-${squadNum}.jpg`);
  const namePrefix = squadNum === 1 ? 'member' : `member-${squadNum}`;
  return { input, namePrefix };
}

function layoutForInputFilename(basename) {
  if (basename === 'squad-1.jpg') return '4x4';
  if (basename === 'squad-4.jpg') return '3x1';
  if (basename === 'squad-2.jpg' || basename === 'squad-3.jpg') return '5x3';
  return '4x4';
}

/**
 * @returns {{
 *   layoutOverride: string | null,
 *   outerPctOverride: number | null,
 *   cellInsetRatioOverride: number | null,
 *   jobs: { input: string; namePrefix: string }[],
 * }}
 */
function parseArgs(argv) {
  const rest = argv.slice(2);
  let layoutOverride = null;
  let outerPctOverride = null;
  let cellInsetRatioOverride = null;
  let nums = rest;

  let i = 0;
  while (i < nums.length) {
    if (nums[i] === '--grid') {
      layoutOverride = nums[i + 1] || null;
      i += 2;
      continue;
    }
    if (nums[i] === '--outer-pct') {
      outerPctOverride = Number(nums[i + 1]);
      i += 2;
      continue;
    }
    if (nums[i] === '--cell-inset-ratio') {
      cellInsetRatioOverride = Number(nums[i + 1]);
      i += 2;
      continue;
    }
    break;
  }
  nums = nums.slice(i);

  if (layoutOverride && !LAYOUTS[layoutOverride]) {
    console.error('[split-squad-collage] Unknown --grid:', layoutOverride, '(use 4x4, 5x3, or 3x1)');
    process.exit(1);
  }

  if (nums.length === 0) {
    return { layoutOverride, outerPctOverride, cellInsetRatioOverride, jobs: [squadJob(1)] };
  }

  const jobs = [];
  for (const a of nums) {
    if (/^\d+$/.test(a)) {
      jobs.push(squadJob(Number(a, 10)));
    } else {
      console.error('[split-squad-collage] Unknown arg:', a, '(use squad numbers: 1, 2, 3, …)');
      process.exit(1);
    }
  }
  return { layoutOverride, outerPctOverride, cellInsetRatioOverride, jobs };
}

async function splitOne(inputPath, namePrefix, layoutKey, outerPctOverride, cellInsetRatioOverride) {
  const layout = LAYOUTS[layoutKey];
  const { cols, rows, skip } = layout;
  const outerPct = outerPctOverride ?? layout.outerPct;
  const cellInsetRatio = cellInsetRatioOverride ?? layout.cellInsetRatio;

  if (!existsSync(inputPath)) {
    console.error('[split-squad-collage] Input not found:', inputPath);
    return 0;
  }

  const meta = await sharp(inputPath).metadata();
  const w = meta.width;
  const h = meta.height;
  if (!w || !h) {
    throw new Error('Could not read image dimensions: ' + inputPath);
  }

  const ox = Math.round(w * outerPct);
  const oy = Math.round(h * outerPct);
  const innerW = Math.max(1, w - 2 * ox);
  const innerH = Math.max(1, h - 2 * oy);

  await mkdir(OUT_DIR, { recursive: true });

  let n = 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      if (skip.has(idx)) continue;

      let rect = cellBounds(col, row, ox, oy, innerW, innerH, cols, rows);
      const insetPx = Math.min(rect.width, rect.height) * cellInsetRatio;
      rect = insetRect(rect, insetPx);

      const base = `${namePrefix}-${String(n).padStart(2, '0')}.jpg`;
      const outPath = path.join(OUT_DIR, base);

      await sharp(inputPath).extract(rect).jpeg({ quality: 92, mozjpeg: true }).toFile(outPath);

      console.log(
        `[${path.basename(inputPath)}] [${layoutKey}] [${String(n).padStart(2, '0')}] ${rect.width}×${rect.height} (outer ${(outerPct * 100).toFixed(1)}%, inset ${(cellInsetRatio * 100).toFixed(1)}%) → ${path.relative(root, outPath)}`,
      );
      n++;
    }
  }

  if (layoutKey === '3x1' && namePrefix === 'member-4') {
    for (let i = 4; i <= 15; i++) {
      const stale = path.join(OUT_DIR, `member-4-${String(i).padStart(2, '0')}.jpg`);
      if (existsSync(stale)) {
        await unlink(stale);
        console.log(`  (removed stale) ${path.relative(root, stale)}`);
      }
    }
  }

  return n - 1;
}

async function main() {
  const { layoutOverride, outerPctOverride, cellInsetRatioOverride, jobs } = parseArgs(process.argv);

  console.log('[split-squad-collage] outer margin + cell inset reduce gutter/cutoff artifacts\n');

  let total = 0;
  for (const { input, namePrefix } of jobs) {
    const layoutKey = layoutOverride ?? layoutForInputFilename(path.basename(input));
    const lo = LAYOUTS[layoutKey];
    console.log(
      `→ ${path.basename(input)} using ${layoutKey} (${lo.cols}×${lo.rows}) outerPct=${outerPctOverride ?? lo.outerPct} cellInsetRatio=${cellInsetRatioOverride ?? lo.cellInsetRatio}\n`,
    );
    const count = await splitOne(input, namePrefix, layoutKey, outerPctOverride, cellInsetRatioOverride);
    total += count;
    if (count === 0 && !existsSync(input)) {
      process.exitCode = 1;
    }
  }
  console.log(`\nDone: ${total} image(s) total → ${path.relative(root, OUT_DIR)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
