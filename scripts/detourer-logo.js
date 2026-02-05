/**
 * Détourage du logo : supprime les bords blancs en rendant les pixels
 * blancs et quasi-blancs transparents.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOGO_IN = path.join(__dirname, "../frontend/src/assets/images/logo vert.png");
const LOGO_OUT = path.join(__dirname, "../frontend/src/assets/images/logo vert.png");
// Seuil : au-dessus de cette valeur (0-255), le pixel est considéré comme blanc et rendu transparent
const WHITE_THRESHOLD = 248;

async function detourerLogo() {
  const { data, info } = await sharp(LOGO_IN)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Pixels blancs ou quasi-blancs → transparent
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(LOGO_OUT);

  console.log("Logo détouré : bords blancs rendus transparents →", LOGO_OUT);
}

detourerLogo().catch((err) => {
  console.error(err);
  process.exit(1);
});
