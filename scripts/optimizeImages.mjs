// Build-time image optimizer. Reads full-res masters from src/images/ and emits
// responsive AVIF + WebP variants into public/img/, plus a manifest that the
// <Image> component reads at runtime.
//
// Masters in src/images/ are gitignored.
// Workflow: drop exports into src/images/, run `npm run optimize-images`,
// then commit public/img/* and src/data/imageManifest.json.
//
// Runs are additive (see main()): re-running with one new master won't drop
// already-committed entries whose masters aren't currently in src/images/. So
// deleting a master alone does NOT remove its image — to remove one, delete its
// entry from src/data/imageManifest.json, then re-run to prune the now-orphaned
// variants from public/img/.
//
// This is intentionally NOT part of `npm run build`: the deploy/CI step doesn't
// have the gitignored masters, so the committed output is what ships.
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src/images");
const outDir = path.join(root, "public/img");
const manifestPath = path.join(root, "src/data/imageManifest.json");

// Target widths. A variant is emitted for each width <= the master's width, so
// we never upscale. Keep this list modest: Cloudflare Pages (free) caps a
// deployment at 20,000 files, and each photo costs widths x formats files.
const WIDTHS = [400, 800, 1200, 1600];
const AVIF_QUALITY = 50;
const WEBP_QUALITY = 78;
const SOURCE_EXT = /\.(jpe?g|png)$/i;

const KB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return {};
  }
}

async function processImage(file, seenKeys) {
  const base = file.replace(SOURCE_EXT, "");
  // Only guards collisions within this run. Re-running with a master whose key
  // already exists in the committed manifest (e.g. swapping photo.png for
  // photo.jpg) intentionally overwrites that entry — see the additive merge in
  // main().
  if (seenKeys.has(base)) {
    throw new Error(
      `Manifest key collision: "${base}" is produced by more than one master ` +
        `(e.g. ${base}.jpg and ${base}.png). Rename one — keys are filename-only.`,
    );
  }
  seenKeys.set(base, file);

  const srcPath = path.join(srcDir, file);
  // Read the master into memory once and resize from the buffer, so each width
  // doesn't re-read the file from disk.
  const inputBuf = fs.readFileSync(srcPath);
  const meta = await sharp(inputBuf).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read dimensions for ${file}; aborting.`);
  }
  const origBytes = inputBuf.length;

  // Widths that don't upscale; fall back to the master's own width if it's
  // smaller than our smallest target.
  let widths = WIDTHS.filter((w) => w <= meta.width);
  if (widths.length === 0) widths = [meta.width];

  // The largest emitted width determines the manifest's intrinsic dimensions
  // (used for width/height attrs to prevent layout shift).
  const largest = Math.max(...widths);
  const scale = largest / meta.width;

  const entry = {
    width: largest,
    height: Math.round(meta.height * scale),
    widths,
    avif: {},
    webp: {},
  };

  let totalOut = 0;
  for (const w of widths) {
    const resized = sharp(inputBuf).resize({ width: w });
    for (const [fmt, dict, opts] of [
      ["avif", entry.avif, { quality: AVIF_QUALITY }],
      ["webp", entry.webp, { quality: WEBP_QUALITY }],
    ]) {
      const buf = await resized.clone()[fmt](opts).toBuffer();
      const hash = createHash("sha256").update(buf).digest("hex").slice(0, 8);
      const name = `${base}-${w}.${hash}.${fmt}`;
      fs.writeFileSync(path.join(outDir, name), buf);
      dict[w] = `/img/${name}`;
      totalOut += buf.length;
    }
  }

  console.log(
    `${base}  ${meta.width}x${meta.height}  ${KB(origBytes)} -> ${widths.length} widths, AVIF+WebP, ${KB(totalOut)} total`,
  );
  return [base, entry];
}

async function main() {
  if (!fs.existsSync(srcDir)) {
    console.error(`No source dir at ${srcDir}. Create it and add photos.`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((f) => SOURCE_EXT.test(f));
  if (files.length === 0) {
    console.log(
      `No images (.jpg/.jpeg/.png) found in ${srcDir}. Nothing to do.`,
    );
    return;
  }

  // Additive: merge new/changed photos into the existing manifest so dropping a
  // single new export and re-running doesn't drop already-committed variants
  // whose masters aren't currently staged in src/images/.
  const manifest = loadManifest();
  const seenKeys = new Map();
  for (const file of files) {
    const [key, entry] = await processImage(file, seenKeys);
    manifest[key] = entry;
  }

  const sorted = Object.fromEntries(
    Object.keys(manifest)
      .sort()
      .map((k) => [k, manifest[k]]),
  );
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + "\n");

  // Re-running with a changed master writes a new content-hashed file and
  // leaves the old one orphaned. Prune any file in public/img/ the manifest no
  // longer references so stale variants don't accumulate toward Cloudflare's
  // 20,000-file deployment cap.
  const referenced = new Set();
  for (const entry of Object.values(sorted)) {
    for (const dict of [entry.avif, entry.webp]) {
      for (const url of Object.values(dict)) {
        referenced.add(path.basename(url));
      }
    }
  }
  // Only prune files that look like our own output (`<base>-<width>.<hash>.<fmt>`)
  // so a stray file dropped into public/img/ isn't silently deleted.
  const VARIANT = /-\d+\.[0-9a-f]{8}\.(avif|webp)$/;
  let pruned = 0;
  for (const f of fs.readdirSync(outDir)) {
    if (VARIANT.test(f) && !referenced.has(f)) {
      fs.unlinkSync(path.join(outDir, f));
      pruned++;
    }
  }

  console.log(
    `\nWrote ${files.length} image(s) to public/img/ and updated imageManifest.json (${Object.keys(sorted).length} total)` +
      (pruned > 0 ? `; pruned ${pruned} orphaned variant(s).` : "."),
  );
}

main();
