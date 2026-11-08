import test from "node:test";
import assert from "node:assert/strict";
import {
  generatePalette,
  extractPalette,
  paletteCss,
  paletteSvg,
} from "../js/palette-engine.js";
import { parseColor, hsl } from "../js/color-utils.js";
const original = ["#663399", "#24576A", "#AACCAA", "#F3EEDD", "#D48772"];
function random(seed = 42) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("regeneration preserves every locked color across modes, sizes and moods", () => {
  for (const mode of [
    "smart",
    "analogous",
    "complementary",
    "split",
    "triadic",
    "monochromatic",
  ])
    for (const style of ["balanced", "pastel", "vibrant", "earthy", "dark"]) {
      const output = generatePalette(
        {
          colors: original,
          locks: [true, false, true, false, false],
          count: 5,
          mode,
          style,
        },
        random(),
      );
      assert.equal(output[0], original[0]);
      assert.equal(output[2], original[2]);
      assert.ok(output.some((h, i) => h !== original[i]));
      for (const hex of output) assert.equal(parseColor(hex), hex);
    }
});
test("single-color regeneration cannot change neighboring columns", () => {
  const output = generatePalette(
    {
      colors: original,
      locks: [true, false, false, false, true],
      count: 5,
      replaceIndex: 2,
    },
    random(7),
  );
  for (let i = 0; i < 5; i++) if (i !== 2) assert.equal(output[i], original[i]);
  assert.notEqual(output[2], original[2]);
});
test("all-locked palettes remain byte-for-byte identical", () => {
  assert.deepEqual(
    generatePalette(
      { colors: original, locks: original.map(() => true), count: 5 },
      random(),
    ),
    original,
  );
});
test("fresh palettes have requested size and distinct valid color codes", () => {
  for (let count = 3; count <= 8; count++) {
    const palette = generatePalette({ seed: "#8B7CF8", count }, random(count));
    assert.equal(palette.length, count);
    assert.equal(new Set(palette).size, count);
    assert.equal(palette[0], "#8B7CF8");
  }
});
test("monochromatic generation keeps the seed hue within rounding tolerance", () => {
  const palette = generatePalette(
    { seed: "#663399", mode: "monochromatic" },
    random(),
  );
  const hue = hsl("#663399")[0];
  assert.ok(palette.every((h) => Math.abs(hsl(h)[0] - hue) <= 2));
});
test("local image extraction ignores transparent pixels and finds dominant colors", () => {
  const data = new Uint8ClampedArray([
    255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 255, 0, 0,
  ]);
  assert.deepEqual(extractPalette(data, 3), ["#FF0000", "#0000FF"]);
});
test("palette exports retain exact HEX values and escape unsafe SVG title text", () => {
  assert.match(paletteCss(original), /--color-1: #663399/);
  const svg = paletteSvg(original, "<script>alert(1)</script>");
  assert.ok(!svg.includes("<script>"));
  for (const hex of original) assert.ok(svg.includes(hex));
});
