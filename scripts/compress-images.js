import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "frontend", "src", "assets", "images");

const targets = [
  { src: "photo-menu/Photoroom_20250704_124732.JPG", width: 1200, quality: 75 },
  { src: "restaurants/photo_londre.jpg", width: 1200, quality: 75 },
  { src: "restaurants/photo_Ecuries.jpg", width: 1200, quality: 75 },
  { src: "back.png", width: 1200, quality: 80 },
];

for (const { src, width, quality } of targets) {
  const inputPath = path.join(ASSETS, src);
  if (!fs.existsSync(inputPath)) {
    console.log(`SKIP (not found): ${src}`);
    continue;
  }
  const sizeBefore = fs.statSync(inputPath).size;
  const tmpPath = inputPath + ".tmp";

  const ext = path.extname(src).toLowerCase();
  let pipeline = sharp(inputPath).resize({ width, withoutEnlargement: true });

  if (ext === ".png") {
    pipeline = pipeline.png({ quality, effort: 10 });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  await pipeline.toFile(tmpPath);
  const sizeAfter = fs.statSync(tmpPath).size;

  if (sizeAfter < sizeBefore) {
    fs.renameSync(tmpPath, inputPath);
    const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
    console.log(`OK ${src}: ${(sizeBefore / 1024).toFixed(0)}KB -> ${(sizeAfter / 1024).toFixed(0)}KB (-${pct}%)`);
  } else {
    fs.unlinkSync(tmpPath);
    console.log(`SKIP (already optimal): ${src}`);
  }
}

console.log("\nDone. Video compression requires ffmpeg (not available).");
console.log("Manual: ffmpeg -i Video_accueil.MP4 -vcodec libx264 -crf 28 -preset slow -vf scale=1280:-2 -an Video_accueil_opt.mp4");
