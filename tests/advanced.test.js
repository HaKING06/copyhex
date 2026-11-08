import test from "node:test";
import assert from "node:assert/strict";
import {
  hexToLab,
  hexToOklch,
  oklchToHex,
  parseOklch,
  toneScale,
  shadeSteps,
  simulateVision,
  visionModes,
} from "../js/color-spaces.js";
import { themeFromSeed, themeTokens, themeCss } from "../js/theme-engine.js";
import { contrast, parseColor } from "../js/color-utils.js";
import {
  normalizeGradient,
  defaultGradient,
  gradientAt,
  gradientGeometry,
  gradientSvg,
  gradientCss,
} from "../js/gradient-engine.js";
import {
  updatePalette,
  sharePayload,
  encodePalette,
  decodePalette,
  paletteDifference,
} from "../js/palette-versions.js";
test("Oklab reference values, sRGB round trips and strict OKLCH parsing", () => {
  const red = hexToLab("#FF0000");
  assert.ok(Math.abs(red[0] - 0.627955) < 0.000001);
  assert.ok(Math.abs(red[1] - 0.224863) < 0.000001);
  for (let i = 0; i < 256; i++) {
    const hex =
      "#" +
      [i, (i * 73) % 256, (i * 151) % 256]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
    assert.equal(oklchToHex(...hexToOklch(hex)), hex);
  }
  assert.equal(parseOklch("oklch(100% 0 0)"), "#FFFFFF");
  assert.equal(parseColor("oklch(0 0 0)"), "#000000");
  for (const v of [
    "oklch(101% 0 0)",
    "oklch(.5 -1 0)",
    "oklch(NaN 0 0)",
    "oklch(.5 .1 2) trailing",
  ])
    assert.equal(parseOklch(v), null);
});
test("50–950 scales descend perceptually and simulations preserve endpoints", () => {
  for (const seed of [
    "#000000",
    "#FFFFFF",
    "#808080",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#8B7CF8",
  ]) {
    const scale = toneScale(seed);
    assert.equal(Object.keys(scale).length, 11);
    let previous = 2;
    for (const step of shadeSteps) {
      const l = hexToLab(scale[step])[0];
      assert.ok(l < previous);
      previous = l;
    }
    assert.equal(simulateVision(seed), seed);
    for (const mode of visionModes) {
      assert.equal(simulateVision("#FFFFFF", mode), "#FFFFFF");
      assert.equal(simulateVision("#000000", mode), "#000000");
    }
  }
  const gray = simulateVision("#B347F2", "grayscale");
  assert.equal(gray.slice(1, 3), gray.slice(3, 5));
  assert.equal(gray.slice(3, 5), gray.slice(5, 7));
});
test("semantic themes meet declared contrast and export typed DTCG tokens", () => {
  for (const seed of [
    "#000000",
    "#FFFFFF",
    "#808080",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#8B7CF8",
    "#FFFF00",
  ]) {
    const theme = themeFromSeed(seed);
    for (const mode of ["light", "dark"]) {
      const r = theme[mode];
      assert.ok(contrast(r.textPrimary, r.surface) >= 7);
      assert.ok(contrast(r.textMuted, r.surface) >= 4.5);
      assert.ok(contrast(r.primary, r.background) >= 3);
      assert.ok(contrast(r.primary, r.onPrimary) >= 4.5);
      assert.ok(contrast(r.border, r.surface) >= 3);
      for (const status of ["success", "warning", "danger", "info"])
        assert.ok(contrast(r[status], r.background) >= 4.5);
    }
    const tokens = themeTokens(theme);
    assert.equal(tokens.color.seed.$type, "color");
    assert.equal(tokens.color.seed.$value.colorSpace, "srgb");
    assert.equal(tokens.color.seed.$value.components.length, 3);
    assert.match(themeCss(theme, "OKLCH"), /oklch\(/);
    assert.match(themeCss(theme), /--color-brand-950/);
  }
});
test("gradient validation, hard stops, export geometry and interpolation", () => {
  assert.equal(normalizeGradient({ ...defaultGradient, stops: [] }), null);
  assert.equal(
    normalizeGradient({ ...defaultGradient, angle: Infinity }),
    null,
  );
  assert.equal(
    normalizeGradient({
      ...defaultGradient,
      stops: [
        { hex: "invalid-color", pos: 0 },
        { hex: "#FFFFFF", pos: 100 },
      ],
    }),
    null,
  );
  const g = normalizeGradient({
    type: "linear",
    space: "srgb",
    angle: 90,
    stops: [
      { hex: "#000000", pos: 0 },
      { hex: "#000000", pos: 50 },
      { hex: "#FFFFFF", pos: 50 },
      { hex: "#FFFFFF", pos: 100 },
    ],
  });
  assert.equal(gradientAt(g, 0.5), "#FFFFFF");
  assert.equal(gradientAt(g, 0), "#000000");
  assert.equal(gradientAt(g, 1), "#FFFFFF");
  assert.ok(Math.abs(gradientGeometry(g).x1) < 0.001);
  assert.match(gradientSvg(g), /<svg/);
  assert.match(gradientCss(defaultGradient), /in oklab/);
});
test("palette versions retain baseline, restore as a new version and exclude private notes", () => {
  const p = {
    name: "İstanbul / 東京 🎨",
    colors: ["#123456", "#ABCDEF"],
    note: "private secret",
  };
  updatePalette(p);
  updatePalette(p, { colors: ["#FF0000", "#ABCDEF"] });
  assert.equal(p.versions.length, 2);
  const payload = sharePayload(p, p.versions[0]),
    decoded = decodePalette(encodePalette(payload));
  assert.deepEqual(decoded.colors, ["#123456", "#ABCDEF"]);
  assert.equal(decoded.name, p.name);
  assert.equal(decoded.note, undefined);
  assert.equal(JSON.stringify(payload).includes("private"), false);
  updatePalette(p, { colors: [...p.versions[0].colors] });
  assert.equal(p.versions.at(-1).number, 3);
  for (let i = 0; i < 30; i++) updatePalette(p, { name: "Palette " + i });
  assert.equal(p.versions.length, 20);
  assert.equal(p.versions.at(-1).number, 33);
  assert.equal(
    paletteDifference(["#123456"], ["#FFFFFF", "#000000"]).filter(
      (d) => d.changed,
    ).length,
    2,
  );
  for (const value of ["bad!", "a".repeat(12001), "e30"])
    assert.equal(decodePalette(value), null);
  assert.throws(() => encodePalette({ ...payload, colors: [] }));
});

test("custom theme settings preserve overrides in CSS and DTCG exports", () => {
  const original = themeFromSeed("#8B7CF8");
  const theme = themeFromSeed("#8B7CF8", {
    intensity: 0.6,
    tint: 0,
    overrides: {
      light: { primary: "#123456", textPrimary: "#FFFFFF", madeUp: "bad" },
      dark: { surface: "not-a-color" },
    },
  });
  assert.equal(theme.light.primary, "#123456");
  assert.equal(theme.light.textPrimary, "#FFFFFF");
  assert.equal(theme.light.madeUp, undefined);
  assert.match(theme.dark.surface, /^#[0-9A-F]{6}$/);
  assert.notDeepEqual(theme.brand, original.brand);
  assert.ok(contrast(theme.light.textPrimary, theme.light.surface) < 4.5);
  theme.radius = 18;
  assert.match(themeCss(theme), /--radius: 18px/);
  assert.match(themeCss(theme), /--color-primary: #123456/);
  assert.deepEqual(themeTokens(theme).radius.$value, { value: 18, unit: "px" });
});
