import {
  toneScale,
  hexToOklch,
  oklchToHex,
  formatOklch,
} from "./color-spaces.js";
import { contrast, rgb } from "./color-utils.js";
export const roleKeys = [
  "background",
  "surface",
  "surfaceRaised",
  "textPrimary",
  "textMuted",
  "primary",
  "onPrimary",
  "border",
  "success",
  "warning",
  "danger",
  "info",
];
export function readableColor(hex, bg, min = 4.5) {
  if (contrast(hex, bg) >= min) return hex;
  const [L, C, H] = hexToOklch(hex),
    toward = contrast("#000000", bg) > contrast("#FFFFFF", bg) ? 0 : 1;
  for (let n = 1; n <= 100; n++) {
    const candidate = oklchToHex(L + ((toward - L) * n) / 100, C, H);
    if (contrast(candidate, bg) >= min) return candidate;
  }
  return toward ? "#FFFFFF" : "#000000";
}
export function themeFromSeed(
  seed,
  { intensity = 1, tint = 1, overrides = {} } = {},
) {
  const [l, c, h] = hexToOklch(seed);
  intensity = Number.isFinite(+intensity)
    ? Math.max(0.5, Math.min(1.5, +intensity))
    : 1;
  tint = Number.isFinite(+tint) ? Math.max(0, Math.min(2, +tint)) : 1;
  const adjusted = oklchToHex(l, c * intensity, h),
    brand = toneScale(adjusted),
    neutral = toneScale(oklchToHex(l, c * tint, h), { neutral: true });
  const make = (dark) => {
    const background = dark ? neutral[950] : neutral[50],
      surface = dark ? neutral[900] : "#FFFFFF",
      surfaceRaised = dark ? neutral[800] : neutral[100];
    const primary = readableColor(adjusted, background, 3),
      onPrimary =
        contrast(primary, "#000000") >= contrast(primary, "#FFFFFF")
          ? "#000000"
          : "#FFFFFF";
    const status = (hue, chroma) =>
      readableColor(
        oklchToHex(dark ? 0.78 : 0.53, chroma, hue),
        background,
        4.5,
      );
    return {
      background,
      surface,
      surfaceRaised,
      textPrimary: readableColor(dark ? neutral[50] : neutral[950], surface, 7),
      textMuted: readableColor(
        dark ? neutral[300] : neutral[600],
        surface,
        4.5,
      ),
      primary,
      onPrimary,
      border: readableColor(dark ? neutral[600] : neutral[400], surface, 3),
      success: status(150, 0.15),
      warning: status(82, 0.14),
      danger: status(25, 0.19),
      info: status(240, 0.14),
    };
  };
  const theme = { seed, brand, neutral, light: make(false), dark: make(true) };
  for (const mode of ["light", "dark"])
    for (const key of roleKeys) {
      const value = overrides?.[mode]?.[key];
      if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value))
        theme[mode][key] = value.toUpperCase();
    }
  return theme;
}
export function themeCss(theme, space = "HEX") {
  const value = (hex) => (space === "OKLCH" ? formatOklch(hex) : hex),
    lines = (obj) =>
      Object.entries(obj)
        .map(
          ([key, hex]) =>
            `  --color-${key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${value(hex)};`,
        )
        .join("\n");
  const scales = Object.entries(theme.brand)
    .map(([step, hex]) => `  --color-brand-${step}: ${value(hex)};`)
    .join("\n");
  return `/* CopyHex — ${theme.seed} */\n:root {\n${Number.isFinite(theme.radius) ? `  --radius: ${theme.radius}px;\n` : ""}${scales}\n${lines(theme.light)}\n}\n[data-theme="dark"], .dark {\n${lines(theme.dark)}\n}\n`;
}
const token = (hex) => ({
  $type: "color",
  $value: {
    colorSpace: "srgb",
    components: rgb(hex).map((v) => +(v / 255).toFixed(6)),
    alpha: 1,
  },
});
export function themeTokens(theme) {
  const group = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, token(v)]));
  return {
    $description: "CopyHex color system",
    color: {
      seed: token(theme.seed),
      brand: group(theme.brand),
      neutral: group(theme.neutral),
    },
    theme: { light: group(theme.light), dark: group(theme.dark) },
    ...(Number.isFinite(theme.radius)
      ? {
          radius: {
            $type: "dimension",
            $value: { value: theme.radius, unit: "px" },
          },
        }
      : {}),
  };
}
