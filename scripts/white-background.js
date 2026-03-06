#!/usr/bin/env node
/**
 * Remplace le fond noir par du blanc dans les images PNG.
 * Usage: node scripts/white-background.js <fichier1> [fichier2] ...
 */

import sharp from "sharp";
import { readFileSync } from "fs";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const THRESHOLD = 90; // Pixels avec R,G,B < 90 sont considérés comme fond noir

async function processImage(inputPath, outputPath) {
  const img = sharp(inputPath);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      if (channels === 4) data[i + 3] = 255;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);
  console.log("OK:", outputPath);
}

const productsDir = join(__dirname, "../frontend/public/images/products");
const files = ["75.png", "75_2.png", "75_3.png", "75_4.png", "75_5.png"];

for (const f of files) {
  const p = join(productsDir, f);
  if (existsSync(p)) {
    await processImage(p, p);
  } else {
    console.warn("Fichier non trouvé:", p);
  }
}
