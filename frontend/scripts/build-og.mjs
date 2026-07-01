import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");

const W = 1200;
const H = 630;
const CX = W / 2;

// Brand palette
const GOLD = "#C8A24A";
const GOLD_HI = "#E8D49A";
const GOLD_DEEP = "#9A7B33";

// ---------------------------------------------------------------------------
// 1. Background: darkened, richer sunset resort with cinematic gradient + vignette
// ---------------------------------------------------------------------------
const bg = await sharp(path.join(pub, "hero-ventis.jpg"))
  .resize(W, H, { fit: "cover", position: "centre" })
  .modulate({ saturation: 1.06, brightness: 0.96 })
  .toBuffer();

const gradientSvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#062019" stop-opacity="0.62"/>
      <stop offset="0.5" stop-color="#0A2A20" stop-opacity="0.42"/>
      <stop offset="1"   stop-color="#04130E" stop-opacity="0.74"/>
    </linearGradient>
    <radialGradient id="v" cx="0.5" cy="0.46" r="0.75">
      <stop offset="0"    stop-color="#000000" stop-opacity="0"/>
      <stop offset="0.62" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#01100B" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
</svg>`;

// ---------------------------------------------------------------------------
// 2. Logo lockup, trimmed, sized to sit inside the centered panel
// ---------------------------------------------------------------------------
const PANEL_W = 660;
const PANEL_H = 348;
const PANEL_X = Math.round(CX - PANEL_W / 2);
const PANEL_Y = 132;
const PANEL_R = 18;

const logoTargetW = 520;
// Trim, then knock out the near-white lockup background so the green/gold
// mark floats directly on the cream panel (no visible white sticker box).
const trimmed = await sharp(path.join(pub, "ventis-logo-lockup.png"))
  .trim({ threshold: 20 })
  .resize({ width: logoTargetW })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { data, info } = trimmed;
for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  // near-white & near-neutral => background -> transparent (soft ramp)
  if (mn > 228 && mx - mn < 16) {
    const a = Math.max(0, 255 - (mn - 228) * (255 / 27));
    data[i + 3] = Math.round(a);
  }
}
const logo = await sharp(data, { raw: info }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();
const logoX = PANEL_X + Math.round((PANEL_W - logoMeta.width) / 2);
const logoY = PANEL_Y + Math.round((PANEL_H - logoMeta.height) / 2);

// ---------------------------------------------------------------------------
// 3. Soft drop shadow for the panel (rendered black rect, blurred)
// ---------------------------------------------------------------------------
const shadowSvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${PANEL_X}" y="${PANEL_Y + 14}" width="${PANEL_W}" height="${PANEL_H}"
        rx="${PANEL_R}" ry="${PANEL_R}" fill="#000000" fill-opacity="0.55"/>
</svg>`;
const shadow = await sharp(Buffer.from(shadowSvg)).blur(26).toBuffer();

// ---------------------------------------------------------------------------
// 4. Cream panel with gold inset double-border (logo composited later on top)
// ---------------------------------------------------------------------------
const panelSvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FCFAF5"/>
      <stop offset="1" stop-color="#F3ECDD"/>
    </linearGradient>
  </defs>
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}"
        rx="${PANEL_R}" ry="${PANEL_R}" fill="url(#cream)"/>
  <rect x="${PANEL_X + 11}" y="${PANEL_Y + 11}" width="${PANEL_W - 22}" height="${PANEL_H - 22}"
        rx="${PANEL_R - 6}" ry="${PANEL_R - 6}" fill="none"
        stroke="${GOLD}" stroke-width="1.6" stroke-opacity="0.9"/>
</svg>`;

// ---------------------------------------------------------------------------
// 5. Top layer: outer gold frame, tagline, ornamental divider, brand mark
// ---------------------------------------------------------------------------
const taglineY = PANEL_Y + PANEL_H + 78;
const ruleY = taglineY - 40;
const halfRule = 150;
const overlaySvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="${GOLD_DEEP}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${GOLD_HI}"   stop-opacity="1"/>
      <stop offset="1"   stop-color="${GOLD_DEEP}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- outer luxury frame -->
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="6" ry="6"
        fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-opacity="0.85"/>
  <rect x="33" y="33" width="${W - 66}" height="${H - 66}" rx="4" ry="4"
        fill="none" stroke="${GOLD_HI}" stroke-width="0.8" stroke-opacity="0.35"/>

  <!-- ornamental divider with center diamond -->
  <rect x="${CX - halfRule}" y="${ruleY}" width="${halfRule * 2}" height="2" fill="url(#goldline)"/>
  <g transform="translate(${CX} ${ruleY + 1}) rotate(45)">
    <rect x="-5" y="-5" width="10" height="10" fill="${GOLD_HI}"/>
    <rect x="-2.5" y="-2.5" width="5" height="5" fill="${GOLD_DEEP}"/>
  </g>

  <!-- tagline -->
  <text x="${CX}" y="${taglineY}" text-anchor="middle"
        font-family="Liberation Serif, DejaVu Serif, serif"
        font-size="29" letter-spacing="7" fill="#F7F2E6"
        style="text-transform:uppercase">BUILDING STRATEGIC ECOSYSTEMS</text>

  <!-- eyebrow above panel -->
  <text x="${CX}" y="${PANEL_Y - 26}" text-anchor="middle"
        font-family="Liberation Serif, DejaVu Serif, serif"
        font-size="18" letter-spacing="11" fill="${GOLD_HI}" fill-opacity="0.95"
        style="text-transform:uppercase">VENTIS GROUP</text>
</svg>`;

// ---------------------------------------------------------------------------
// Compose
// ---------------------------------------------------------------------------
const written = await sharp(bg)
  .composite([
    { input: Buffer.from(gradientSvg), top: 0, left: 0 },
    { input: shadow, top: 0, left: 0 },
    { input: Buffer.from(panelSvg), top: 0, left: 0 },
    { input: logo, top: logoY, left: logoX },
    { input: Buffer.from(overlaySvg), top: 0, left: 0 },
  ])
  // Write straight to disk at high quality — no second re-encode pass.
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
  .toFile(path.join(pub, "og-ventis.jpg"));

console.log("og-ventis.jpg written:", written.size, "bytes", written.width + "x" + written.height);
