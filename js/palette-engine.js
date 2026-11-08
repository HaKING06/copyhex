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
  const locked = colors.filter((c, i) => locks[i]);
  const base = locked[0] || seed,
    [h, s, l] = hsl(base);
  const chosenMode =
    mode === "smart"
      ? ["analogous", "complementary", "split", "triadic"][
          Math.floor(random() * 4)
        ]
      : mode;
  const offsets = {
    analogous: [-30, -15, 0, 15, 30, 45, -45, 60],
    complementary: [0, 180, 0, 180, 15, 195, -15, 165],
    split: [0, 150, 210, 0, 150, 210, 15, 195],
    triadic: [0, 120, 240, 0, 120, 240, 15, 135],
    monochromatic: [0, 0, 0, 0, 0, 0, 0, 0],
  }[chosenMode] || [0, 30, 180, 210];
  const anchorJitter = mode === "monochromatic" ? 0 : (random() - 0.5) * 18;
  const result = Array.from({ length: count }, (_, i) => {
    if (
      colors[i] &&
      (locks[i] || (replaceIndex !== null && i !== replaceIndex))
    )
      return colors[i];
    if (i === 0 && !colors.length) return seed;
    let best = null,
      bestScore = -Infinity;
    for (let attempt = 0; attempt < 18; attempt++) {
      let hue =
        h +
        offsets[(i + Math.floor(random() * 3)) % offsets.length] +
        anchorJitter +
        (random() - 0.5) * 12;
      let saturation = clamp(s * 0.7 + 20 + (random() - 0.5) * 25, 20, 90),
        lightness = 20 + (i / (count - 1)) * 65 + (random() - 0.5) * 14;
      if (style === "pastel") {
        saturation = 30 + random() * 38;
        lightness = 72 + random() * 19;
      }
      if (style === "vibrant") {
        saturation = 70 + random() * 25;
        lightness = 35 + random() * 32;
      }
      if (style === "earthy") {
        saturation = 20 + random() * 28;
        lightness = 25 + (i / (count - 1)) * 60;
        hue = h + offsets[i % offsets.length] * 0.7 + (random() - 0.5) * 10;
      }
      if (style === "dark") {
        saturation = 20 + random() * 50;
        lightness = i === count - 1 ? 72 + random() * 12 : 12 + random() * 34;
      }
      if (chosenMode === "monochromatic") hue = h;
      const hex = asHex(hue, saturation, lightness);
      const others = [
        ...locked,
        ...colors.filter((_, j) => replaceIndex !== null && j !== replaceIndex),
      ];
      let score = others.length
        ? Math.min(...others.map((c) => rgbDistance(c, hex)))
        : Math.abs(lightness - l) * 0.1;
      score +=
        Math.max(contrast(hex, "#FFFFFF"), contrast(hex, "#000000")) * 0.3;
      if (others.includes(hex)) score -= 1000;
      if (score > bestScore) {
        bestScore = score;
        best = hex;
      }
    }
    return best;
  });
  // Keep unlocked columns distinct without ever changing a locked color.
  const seen = new Set(
    result.filter(
      (_, i) => locks[i] || (replaceIndex !== null && i !== replaceIndex),
    ),
  );
  for (let i = 0; i < result.length; i++) {
    if (locks[i] || (replaceIndex !== null && i !== replaceIndex)) continue;
    let n = 0;
    while (seen.has(result[i]) && n++ < 24) {
      const [hh, ss, ll] = hsl(result[i]);
      result[i] = asHex(hh + n * 3, ss, clamp(ll + n, 5, 95));
    }
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
