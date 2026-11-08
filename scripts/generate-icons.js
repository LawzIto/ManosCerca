/**
 * Generates PWA icons for ManosCerca.
 *
 * Uses the isotipo_negativo.svg (white pin + #5AA2FF key) rendered on
 * a full-bleed #062244 navy background — no margins, no borders, no rounded corners.
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SVG_PATH = path.join(PROJECT_ROOT, "public/brand/logos_SVG/isotipo_negativo.svg");
const OUT_DIR = path.join(PROJECT_ROOT, "public/icons");

const svgBuffer = fs.readFileSync(SVG_PATH);

const NAVY = { r: 6, g: 34, b: 68 }; // #062244

async function generateIcon(size, isotipoPercent, outputName) {
  const isotipoHeight = Math.round(size * isotipoPercent);
  const isotipoWidth = Math.round(isotipoHeight * (721 / 884));

  const isotipoPng = await sharp(svgBuffer)
    .resize(isotipoWidth, isotipoHeight, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...NAVY, alpha: 255 },
    },
  })
    .composite([{ input: isotipoPng, gravity: "centre" }])
    .png()
    .toFile(path.join(OUT_DIR, outputName));

  console.log(`  OK ${outputName} (${size}x${size}, isotipo ${Math.round(isotipoPercent * 100)}%)`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Generating PWA icons...\n");

  // Standard icons (purpose: "any") — isotipo at 70%
  await generateIcon(192, 0.70, "icon-192.png");
  await generateIcon(512, 0.70, "icon-512.png");

  // Maskable icon — isotipo at 60% (within 80% safe zone)
  await generateIcon(512, 0.60, "icon-maskable-512.png");

  // Favicon 48px
  await generateIcon(48, 0.70, "favicon-48.png");

  // Apple Touch Icon 180x180
  await generateIcon(180, 0.70, "apple-touch-icon.png");

  // Generate multi-size favicon.ico (16, 32, 48)
  console.log("Generating favicon.ico...");
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of icoSizes) {
    const isotipoH = Math.round(s * 0.70);
    const isotipoW = Math.round(isotipoH * (721 / 884));
    const isotipoPng = await sharp(svgBuffer)
      .resize(isotipoW, isotipoH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const buf = await sharp({
      create: { width: s, height: s, channels: 4, background: { ...NAVY, alpha: 255 } },
    })
      .composite([{ input: isotipoPng, gravity: "centre" }])
      .png()
      .toBuffer();
    pngBuffers.push({ size: s, buf });
  }

  const headerLen = 6 + 16 * pngBuffers.length;
  let offset = headerLen;
  const entries = [];
  for (const p of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(p.size === 256 ? 0 : p.size, 0);
    entry.writeUInt8(p.size === 256 ? 0 : p.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(p.buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += p.buf.length;
    entries.push(entry);
  }
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(pngBuffers.length, 4);
  const icoBuffer = Buffer.concat([dir, ...entries, ...pngBuffers.map((p) => p.buf)]);

  fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(PROJECT_ROOT, "src/app/favicon.ico"), icoBuffer);
  console.log("  OK favicon.ico (16, 32, 48)");

  // Sync apple-icon.png in src/app
  fs.copyFileSync(
    path.join(OUT_DIR, "apple-touch-icon.png"),
    path.join(PROJECT_ROOT, "src/app/apple-icon.png")
  );
  console.log("  OK src/app/apple-icon.png updated");

  console.log("\nAll icons generated successfully!");
}

main().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
