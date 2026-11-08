import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { hsl } from "../js/color-utils.js";
const source = await readFile(
  new URL("../data/source-colors.csv", import.meta.url),
  "utf8",
);
const css = JSON.parse(
  await readFile(new URL("../data/css-colors.json", import.meta.url), "utf8"),
);
const rows = source
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const cells = line
      .match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)
      .map((s) =>
        s.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'),
      );
    return { name: cells[0], hex: cells[1]?.toUpperCase() };
  })
  .filter((c) => /^#[\dA-F]{6}$/.test(c.hex));
const unique = new Map();
for (const c of css) {
  if (unique.has(c.hex)) unique.get(c.hex).aliases.push(c.name);
  else unique.set(c.hex, { ...c, aliases: [] });
}
const sorted = rows.toSorted((a, b) => {
  const x = hsl(a.hex),
    y = hsl(b.hex);
  return x[0] - y[0] || x[2] - y[2] || a.hex.localeCompare(b.hex);
});
const allNames = new Map(rows.map((c) => [c.hex, c.name]));
for (const c of unique.values())
  if (allNames.has(c.hex)) c.aliases.push(allNames.get(c.hex));
function category([h, s, l]) {
  if (s < 12 || l < 7 || l > 96) return "Nötr";
  if (h >= 15 && h < 55 && l < 48) return "Kahverengi";
  if (h < 15 || h >= 345) return "Kırmızı";
  if (h < 45) return "Turuncu";
  if (h < 70) return "Sarı";
  if (h < 165) return "Yeşil";
  if (h < 260) return "Mavi";
  if (h < 295) return "Mor";
  return "Pembe";
}
const target = 6000,
  needed = target - unique.size;
for (let i = 0; i < needed; i++) {
  let idx = Math.floor((i * sorted.length) / needed);
  while (idx < sorted.length && unique.has(sorted[idx].hex)) idx++;
  if (idx < sorted.length) {
    const c = sorted[idx];
    unique.set(c.hex, { ...c, aliases: [], cat: category(hsl(c.hex)) });
  }
}
for (const c of sorted) {
  if (unique.size >= target) break;
  if (!unique.has(c.hex))
    unique.set(c.hex, { ...c, aliases: [], cat: category(hsl(c.hex)) });
}
const cssHexes = new Set(
  css.filter((c) => c.name !== "Amethyst").map((c) => c.hex),
);
for (const c of unique.values())
  if (cssHexes.has(c.hex)) c.aliases.push("css-keyword");
const usedNames = new Set();
for (const c of unique.values()) {
  if (usedNames.has(c.name)) {
    c.aliases.push(c.name);
    c.name += " (Community)";
  }
  usedNames.add(c.name);
  c.aliases = [...new Set(c.aliases)];
}
const colors = [...unique.values()];
if (colors.length !== target) throw Error("Expected 6000 unique colors");
await writeFile(
  new URL("../js/colors.js", import.meta.url),
  "// Dataset attribution: /licenses/color-names-MIT.txt\nexport const colors = " +
    JSON.stringify(colors) +
    ";\n",
);
await writeFile(
  new URL("../data/source.json", import.meta.url),
  JSON.stringify(
    {
      repository: "https://github.com/meodai/color-names",
      source:
        "https://raw.githubusercontent.com/meodai/color-names/main/src/colornames.csv",
      retrieved: "2026-11-08",
      sha256: createHash("sha256").update(source).digest("hex"),
      license: "MIT",
      sourceRows: rows.length,
      uniqueColors: colors.length,
      selection:
        "Original colors deduplicated by HEX; deterministic evenly spaced sampling ordered by HSL hue and lightness. CSS aliases retained.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Generated ${colors.length} unique colors from ${rows.length} source records.`,
);
