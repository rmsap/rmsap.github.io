import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(__dirname, "../public");

const jobs = [
  ["benefit-of-the-doubt-thumbnail.svg", "benefit-of-the-doubt-thumbnail.png"],
  ["push_notifications_thumbnail.svg", "push_notifications_thumbnail.png"],
  ["all-tests-passed-thumbnail.svg", "all-tests-passed-thumbnail.png"],
];

for (const [srcName, dstName] of jobs) {
  const src = path.join(pub, srcName);
  const dst = path.join(pub, dstName);
  const svg = fs.readFileSync(src);
  await sharp(svg, { density: 300 })
    .resize({ width: 1200 })
    .png({ compressionLevel: 9 })
    .toFile(dst);
  const { size } = fs.statSync(dst);
  console.log(`${dstName}  ${(size / 1024).toFixed(1)} KB`);
}
