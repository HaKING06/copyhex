import { hsl, parseColor, contrast, rgb } from "./color-utils.js";
export const modes = [
  "smart",
  "analogous",
  "complementary",
  "split",
  "triadic",
  "monochromatic",
];
export const styles = ["balanced", "pastel", "vibrant", "earthy", "dark"];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const asHex = (h, s, l) =>
  parseColor(
    `hsl(${((h % 360) + 360) % 360}, ${clamp(Math.round(s), 0, 100)}%, ${clamp(Math.round(l), 0, 100)}%)`,
  );
export function generatePalette(
  {
    colors = [],
    locks = [],
    count = 5,
    mode = "smart",
    style = "balanced",
    seed = "#8B7CF8",
    replaceIndex = null,
  },
  random = Math.random,
) {
  count = clamp(Math.round(count), 3, 8);
  const protectedColors = colors.filter(
    (_, i) => locks[i] || (replaceIndex !== null && i !== replaceIndex),
  );
  const anchor = colors.find((_, i) => locks[i]) || seed,
    [h, s, l] = hsl(anchor);
  const chosenMode =
    mode === "smart"
      ? ["analogous", "analogous", "complementary", "split", "triadic"][
          Math.floor(random() * 5)
        ]
      : mode;
  const offsets = {
    analogous: [0, -22, 22, -10, 10, 32, -32, 16],
    complementary: [0, 0, 180, 180, 0, 180, 0, 180],
    split: [0, 0, 150, 210, 0, 150, 210, 0],
    triadic: [0, 0, 120, 240, 0, 120, 240, 0],
    monochromatic: [0, 0, 0, 0, 0, 0, 0, 0],
  }[chosenMode] || [0, 0, 22, -22, 0, 30, -30, 15];
  const plannedLight = [l, 20, 93, 68, 44, 81, 32, 74],
    variation = (random() - 0.5) * 8;
  const result = [];
  const deltaHue = (a, b) =>
    Math.min(Math.abs(a - b) % 360, 360 - (Math.abs(a - b) % 360));
  for (let i = 0; i < count; i++) {
    if (
      colors[i] &&
      (locks[i] || (replaceIndex !== null && i !== replaceIndex))
    ) {
      result.push(colors[i]);
      continue;
    }
    if (i === 0 && !colors.length) {
      result.push(seed);
      continue;
    }
    let targetHue = h + offsets[i],
      targetS = clamp(s * 0.72 + 12, 24, 76),
      targetL = plannedLight[i] + variation;
    if (style === "pastel") {
      targetS = clamp(s * 0.55 + 18, 30, 62);
      targetL = [l, 75, 94, 83, 88, 79, 91, 85][i];
    }
    if (style === "vibrant") {
      targetS = clamp(s + 12, 72, 92);
      targetL = [l, 25, 91, 62, 48, 74, 36, 83][i];
    }
    if (style === "earthy") {
      targetS = clamp(s * 0.48 + 9, 19, 43);
      targetL = [l, 24, 91, 66, 43, 80, 34, 73][i];
    }
    if (style === "dark") {
      targetS = clamp(s * 0.65 + 8, 20, 65);
      targetL = [l, 13, 23, 38, 77, 53, 18, 86][i];
    }
    if (chosenMode === "monochromatic") targetHue = h;
    let best = null,
      bestScore = -Infinity;
    const references = [...protectedColors, ...result];
    for (let attempt = 0; attempt < 24; attempt++) {
      const hh =
        chosenMode === "monochromatic" ? h : targetHue + (random() - 0.5) * 10;
      const hex = asHex(
        hh,
        targetS + (random() - 0.5) * 14,
        targetL + (random() - 0.5) * 12,
      );
      const [actualH, actualS, actualL] = hsl(hex);
      const separation = references.length
        ? Math.min(...references.map((c) => rgbDistance(c, hex)))
        : 60;
      let score =
        -Math.abs(actualL - targetL) * 1.4 -
        Math.abs(actualS - targetS) * 0.16 -
        deltaHue(actualH, ((targetHue % 360) + 360) % 360) * 0.28 +
        Math.min(separation, 72) * 0.09;
      if (separation < 28) score -= (28 - separation) * 1.5;
      if (references.includes(hex)) score -= 1000;
      if (score > bestScore) {
        bestScore = score;
        best = hex;
      }
    }
    result.push(best);
  }
  const seen = new Set(
    result.filter(
      (_, i) => locks[i] || (replaceIndex !== null && i !== replaceIndex),
    ),
  );
  for (let i = 0; i < result.length; i++) {
    if (locks[i] || (replaceIndex !== null && i !== replaceIndex)) continue;
    const [hh, ss, ll] = hsl(result[i]);
    let n = 0;
    while (seen.has(result[i]) && n++ < 50)
      result[i] = asHex(
        hh,
        ss,
        clamp(ll + (n % 2 ? 1 : -1) * Math.ceil(n / 2), 2, 98),
      );
    seen.add(result[i]);
  }
  return result;
}
export function rgbDistance(a, b) {
  const x = rgb(a),
    y = rgb(b);
  return Math.sqrt(x.reduce((sum, v, i) => sum + (v - y[i]) ** 2, 0));
}
export function extractPalette(data, count = 5) {
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 180) continue;
    const key = [data[i] >> 4, data[i + 1] >> 4, data[i + 2] >> 4].join(",");
    let b = buckets.get(key);
    if (!b) {
      b = { sum: [0, 0, 0], count: 0 };
      buckets.set(key, b);
    }
    b.count++;
    for (let j = 0; j < 3; j++) b.sum[j] += data[i + j];
  }
  const candidates = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map((b) => ({
      hex:
        "#" +
        b.sum
          .map((v) =>
            Math.round(v / b.count)
              .toString(16)
              .padStart(2, "0"),
          )
          .join("")
          .toUpperCase(),
      weight: b.count,
    }));
  const chosen = [];
  for (const c of candidates) {
    if (chosen.every((x) => rgbDistance(x, c.hex) > 45)) {
      chosen.push(c.hex);
      if (chosen.length === count) break;
    }
  }
  for (const c of candidates) {
    if (chosen.length >= count) break;
    if (!chosen.includes(c.hex)) chosen.push(c.hex);
  }
  return chosen;
}
export function paletteCss(colors) {
  return (
    ":root {\n" +
    colors.map((h, i) => `  --color-${i + 1}: ${h};`).join("\n") +
    "\n}\n"
  );
}
export function paletteSvg(colors, title = "CopyHex palette") {
  const safe = title.replace(/[<>&"']/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#151722"/><text x="54" y="70" fill="#f7f5ff" font-family="Arial,sans-serif" font-size="32" font-weight="700">CopyHex</text><text x="54" y="115" fill="#b8b6c9" font-family="Arial,sans-serif" font-size="22">${safe}</text>${colors
    .map((hex, i) => {
      const x = 54 + (i * 1092) / colors.length,
        w = 1092 / colors.length;
      return `<rect x="${x}" y="155" width="${w + 1}" height="440" fill="${hex}"/><text x="${x + 14}" y="635" fill="#f7f5ff" font-family="monospace" font-size="${colors.length > 6 ? 17 : 21}">${hex}</text>`;
    })
    .join(
      "",
    )}<text x="54" y="685" fill="#a5a2b7" font-family="Arial,sans-serif" font-size="17">copyhex.haking.tr</text></svg>`;
}
