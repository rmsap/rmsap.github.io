// Build-time video optimizer — the moving-image counterpart to
// scripts/optimizeImages.mjs. Reads masters (gif/mp4/mov/m4v/webm) from src/videos/ and
// emits MP4 (H.264) + WebM (VP9) + a poster frame into public/video/, plus a
// manifest that the <Video> component reads at runtime.
//
// Masters in src/videos/ are gitignored. Workflow: drop a master into
// src/videos/, run `npm run optimize-videos`, then commit public/video/* and
// src/data/videoManifest.json.
//
// Mirrors the image optimizer's behavior: additive merge (re-running with one
// new master won't drop already-committed entries), content-hashed filenames
// (safe to cache immutably), and orphan pruning. To remove a video, delete its
// entry from src/data/videoManifest.json and re-run to prune its files.
//
// Like the image optimizer, this is NOT part of `npm run build`: CI doesn't
// have the gitignored masters, so the committed output is what ships. ffmpeg is
// supplied by the ffmpeg-static / ffprobe-static devDependencies (no system
// install needed), matching how sharp backs the image optimizer.
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const ffprobePath = ffprobeStatic.path;
// ffmpeg-static's default export is null on unsupported platforms, and
// ffprobe-static's .path can likewise be undefined. Bail with a legible message
// rather than letting execFileSync(null, …) throw a bare "path must be a string".
if (!ffmpegPath || !ffprobePath) {
  console.error(
    "ffmpeg/ffprobe binary unavailable for this platform " +
      "(ffmpeg-static / ffprobe-static returned no path).",
  );
  process.exit(1);
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src/videos");
const outDir = path.join(root, "public/video");
const manifestPath = path.join(root, "src/data/videoManifest.json");
// Images and videos share one flat key namespace (see `toManifestKey` in
// src/utils/imageManifest.ts), and <Media> resolves the video manifest first —
// so a key in both manifests silently masks the image. The image optimizer
// can't see videos, so this is the only place that can catch the overlap.
const imageManifestPath = path.join(root, "src/data/imageManifest.json");

// Keep this extension set in lockstep with the video branch of `toManifestKey`
// in src/utils/imageManifest.ts: any master extension we accept here must also
// be stripped there, or a `/clip.<ext>` reference won't resolve to its key.
const SOURCE_EXT = /\.(gif|mp4|mov|m4v|webm)$/i;
// Human-readable extension list for log messages, kept in sync with SOURCE_EXT.
const SOURCE_EXT_LABEL = "gif/mp4/mov/m4v/webm";
// Don't upscale past this width; GIF/screen-capture masters are usually small.
const MAX_WIDTH = 1280;
const H264_CRF = 23; // visually lossless-ish for screen content
const VP9_CRF = 33;

const KB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return {};
  }
}

// Image manifest keys, for cross-namespace collision detection. Missing/unreadable
// (e.g. before the image optimizer has ever run) is treated as "no images".
function loadImageKeys() {
  try {
    return new Set(
      Object.keys(JSON.parse(fs.readFileSync(imageManifestPath, "utf8"))),
    );
  } catch {
    return new Set();
  }
}

function run(bin, args) {
  execFileSync(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
}

// Encode to a temp file, hash its bytes, then rename to a content-addressed
// name — the same immutable-caching trick the image optimizer uses.
function encodeHashed(base, fmt, encode) {
  const tmp = path.join(outDir, `.tmp-${base}.${fmt}`);
  encode(tmp);
  const buf = fs.readFileSync(tmp);
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 8);
  const name = `${base}.${hash}.${fmt}`;
  fs.renameSync(tmp, path.join(outDir, name));
  return { url: `/video/${name}`, bytes: buf.length };
}

function probeDimensions(srcPath) {
  // Capture stderr (don't inherit it) so a probe failure surfaces its
  // diagnostics on `err.stderr` for the top-level handler, matching run().
  const out = execFileSync(
    ffprobePath,
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      srcPath,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  ).toString();
  // Take the first stream's row before splitting on comma — some inputs make
  // ffprobe emit extra lines, which would otherwise pollute the height parse.
  const [w, h] = out.trim().split("\n")[0].split(",").map(Number);
  return { width: w, height: h };
}

function processVideo(file, seenKeys) {
  const base = file.replace(SOURCE_EXT, "");
  // Collision guard scoped to this run's masters: two src/videos/ files that
  // collapse to the same key (e.g. clip.gif + clip.mp4) would clobber each
  // other's manifest entry. Re-optimizing one already-committed key across runs
  // is intentional (the additive merge overwrites it), so we deliberately don't
  // diff against the existing manifest here.
  if (seenKeys.has(base)) {
    throw new Error(
      `Manifest key collision: "${base}" is produced by both ` +
        `${seenKeys.get(base)} and ${file}. Rename one — keys are filename-only.`,
    );
  }
  seenKeys.set(base, file);

  const srcPath = path.join(srcDir, file);
  const origBytes = fs.statSync(srcPath).size;
  const { width, height } = probeDimensions(srcPath);
  if (!width || !height) {
    throw new Error(`Could not read dimensions for ${file}; aborting.`);
  }

  // Scale down to MAX_WIDTH at most, and force even dimensions (H.264/VP9
  // require them). -2 keeps the aspect ratio while snapping height to an even
  // number; snap the target width down to even ourselves.
  const targetW = Math.min(width, MAX_WIDTH);
  const evenW = targetW % 2 ? targetW - 1 : targetW;
  const scale = `scale=${evenW}:-2`;

  const mp4 = encodeHashed(base, "mp4", (dst) =>
    run(ffmpegPath, [
      "-y",
      "-i",
      srcPath,
      "-an",
      "-vf",
      scale,
      "-c:v",
      "libx264",
      "-crf",
      String(H264_CRF),
      "-preset",
      "slow",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      dst,
    ]),
  );

  const webm = encodeHashed(base, "webm", (dst) =>
    run(ffmpegPath, [
      "-y",
      "-i",
      srcPath,
      "-an",
      "-vf",
      scale,
      "-c:v",
      "libvpx-vp9",
      "-crf",
      String(VP9_CRF),
      "-b:v",
      "0",
      "-row-mt",
      "1",
      // libvpx-vp9 defaults to the `best` deadline, which is an order of
      // magnitude slower for negligible quality gain on screen-capture content.
      // `good` + cpu-used 2 keeps quality while making the hand-run script bearable.
      "-deadline",
      "good",
      "-cpu-used",
      "2",
      dst,
    ]),
  );

  // Poster: first frame, as WebP, for the <video poster> / reduced-motion view.
  const poster = encodeHashed(base, "webp", (dst) =>
    run(ffmpegPath, [
      "-y",
      "-i",
      srcPath,
      "-frames:v",
      "1",
      "-vf",
      scale,
      "-c:v",
      "libwebp",
      "-quality",
      "80",
      dst,
    ]),
  );

  // Read dimensions back from the encoded output rather than recomputing them:
  // ffmpeg's `-2` rounds height to the nearest even, which our arithmetic can't
  // mirror exactly, so the manifest matches what actually ships (no layout shift).
  // Probing the MP4 alone is enough because the WebM is encoded from the same
  // source through the same `scale` filter, so its dimensions are identical — if
  // the two encode paths ever diverge, probe both and reconcile here.
  const out = probeDimensions(path.join(outDir, path.basename(mp4.url)));

  const entry = {
    width: out.width,
    height: out.height,
    mp4: mp4.url,
    webm: webm.url,
    poster: poster.url,
  };

  console.log(
    `${base}  ${width}x${height}  ${KB(origBytes)} -> mp4 ${KB(mp4.bytes)} + webm ${KB(webm.bytes)} + poster ${KB(poster.bytes)}`,
  );
  return [base, entry];
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.error(`No source dir at ${srcDir}. Create it and add videos.`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  // Clear temp encodes left by a previously crashed run. They aren't
  // content-hashed, so the orphan pruner below won't catch them.
  for (const f of fs.readdirSync(outDir)) {
    if (f.startsWith(".tmp-")) fs.unlinkSync(path.join(outDir, f));
  }

  const files = fs.readdirSync(srcDir).filter((f) => SOURCE_EXT.test(f));
  if (files.length === 0) {
    console.log(
      `No video masters (${SOURCE_EXT_LABEL}) found in ${srcDir}. Nothing to do.`,
    );
    return;
  }

  const manifest = loadManifest();
  const seenKeys = new Map();
  for (const file of files) {
    const [key, entry] = processVideo(file, seenKeys);
    manifest[key] = entry;
  }

  const sorted = Object.fromEntries(
    Object.keys(manifest)
      .sort()
      .map((k) => [k, manifest[k]]),
  );

  // Fatal cross-namespace collision check, BEFORE writing: a key in both
  // manifests means <Media> (which resolves videos first) silently renders the
  // video and masks the image. processVideo() already hard-fails video↔video
  // clashes; treat this cross-namespace case — the one the image optimizer can't
  // see — just as hard, and bail before persisting a known-bad manifest so it
  // can't slip past in a long log.
  const imageKeys = loadImageKeys();
  const collisions = Object.keys(sorted).filter((k) => imageKeys.has(k));
  if (collisions.length > 0) {
    console.error(
      `\nError: ${collisions.length} key(s) exist in both video and image manifests; ` +
        `<Media> would render the video and mask the image:\n  ` +
        collisions.join("\n  ") +
        `\nRename one side — keys are filename-only (extension dropped).`,
    );
    process.exit(1);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + "\n");

  // Prune any file in public/video/ the manifest no longer references, so stale
  // encodes don't accumulate toward Cloudflare's 20,000-file deployment cap.
  const referenced = new Set();
  for (const entry of Object.values(sorted)) {
    for (const url of [entry.mp4, entry.webm, entry.poster]) {
      referenced.add(path.basename(url));
    }
  }
  // Only prune our own output (`<base>.<hash>.<ext>`) so a stray file isn't
  // silently deleted. Lowercase-hex only by design: the hashes come solely from
  // `createHash(...).digest("hex")` in encodeHashed(), which always emits lowercase.
  const VARIANT = /\.[0-9a-f]{8}\.(mp4|webm|webp)$/;
  let pruned = 0;
  for (const f of fs.readdirSync(outDir)) {
    if (VARIANT.test(f) && !referenced.has(f)) {
      fs.unlinkSync(path.join(outDir, f));
      pruned++;
    }
  }

  // Surface manifest entries whose output files are missing (e.g. deleted by
  // hand). They won't be regenerated unless their master is re-optimized, so the
  // site would ship a broken <source> — warn rather than fail silently.
  const missing = [];
  for (const [key, entry] of Object.entries(sorted)) {
    for (const url of [entry.mp4, entry.webm, entry.poster]) {
      if (!fs.existsSync(path.join(outDir, path.basename(url)))) {
        missing.push(`${key} -> ${url}`);
      }
    }
  }
  if (missing.length > 0) {
    console.warn(
      `\nWarning: ${missing.length} manifest reference(s) point to missing files:\n  ` +
        missing.join("\n  ") +
        `\nRe-add the master(s) to ${path.relative(root, srcDir)} and re-run, or remove the entries.`,
    );
  }

  console.log(
    `\nWrote ${files.length} video(s) to public/video/ and updated videoManifest.json (${Object.keys(sorted).length} total)` +
      (pruned > 0 ? `; pruned ${pruned} orphaned file(s).` : "."),
  );
}

try {
  main();
} catch (err) {
  // ffmpeg/ffprobe failures throw with their diagnostics on `.stderr` (captured,
  // not inherited); surface it so the cause is legible instead of a bare stack.
  if (err?.stderr) process.stderr.write(err.stderr);
  console.error(`\noptimize-videos failed: ${err.message}`);
  process.exit(1);
}
