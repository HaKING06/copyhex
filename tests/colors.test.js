import test from "node:test";
import assert from "node:assert/strict";
import { parseColor, format, contrast, hsl } from "../js/color-utils.js";
import { colors } from "../js/colors.js";
import { indexColors, filterColors } from "../js/catalog.js";
const index = indexColors(colors);
test("HEX, RGB and HSL parsing including invalid input", () => {
  assert.equal(parseColor("#abc"), "#AABBCC");
  assert.equal(parseColor("rgb(255, 0, 128)"), "#FF0080");
  assert.equal(parseColor("hsl(120, 100%, 50%)"), "#00FF00");
  for (const v of ["rgb(256,0,0)", "#xyz", "hsl(0,101%,50%)", "<script>"])
    assert.equal(parseColor(v), null);
});
test("conversion boundaries and contrast", () => {
  assert.equal(format("#000000", "CMYK"), "cmyk(0%, 0%, 0%, 100%)");
  assert.equal(format("#FFFFFF", "RGB"), "rgb(255, 255, 255)");
  assert.deepEqual(hsl("#FF0000"), [0, 100, 50]);
  assert.equal(contrast("#000000", "#FFFFFF"), 21);
  assert.equal(contrast("#777777", "#777777"), 1);
});
test("exactly 6000 distinct HEX values, valid names and CSS aliases", () => {
  assert.equal(colors.length, 6000);
  assert.equal(new Set(colors.map((c) => c.hex)).size, 6000);
  assert.equal(new Set(colors.map((c) => c.name)).size, 6000);
  for (const c of colors) assert.equal(parseColor(c.hex), c.hex);
  assert.ok(colors.find((c) => c.hex === "#808080").aliases.includes("Grey"));
});
test("cross-language search and CSS alias search", () => {
  for (const query of [
    "kırmızı",
    "kirmizi",
    "blue",
    "mavi",
    "açık mavi",
    "grey",
  ])
    assert.ok(filterColors(index, { query }).length > 0, query);
  const css = filterColors(index, { source: "css" });
  assert.equal(css.length, 139);
  assert.ok(css.some((c) => c.name === "RebeccaPurple"));
});
test("combined filters preserve their constraints", () => {
  const list = filterColors(index, {
    category: "blue",
    brightness: "lightColors",
    saturation: "pastel",
  });
  assert.ok(list.length > 10);
  assert.ok(
    list.every(
      (c) =>
        c.cat === "Mavi" && c.hsl[2] >= 70 && c.hsl[1] >= 20 && c.hsl[1] <= 75,
    ),
  );
  assert.equal(filterColors(index, { query: "no-such-color-qzx" }).length, 0);
});
test("nearest color sorting puts exact RGB match first", () => {
  const list = filterColors(index, { query: "#663399", sort: "nearest" });
  assert.equal(list[0].hex, "#663399");
  assert.equal(list.length, 6000);
});
