// Oklab: Björn Ottosson, https://bottosson.github.io/posts/oklab/.
// sRGB transfer functions follow CSS Color 4. Output is gamut-mapped 8-bit sRGB.
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const linearize = (v) =>
  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
export const encode = (v) =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
const channels = (hex) =>
  hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255);
export const linearToHex = (values) =>
  "#" +
  values
    .map((v) =>
      Math.round(clamp(encode(v)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase();
export function hexToLab(hex) {
  const [r, g, b] = channels(hex).map(linearize),
    l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b),
    m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
    s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function labToLinear([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
export function hexToOklch(hex) {
  const [L, a, b] = hexToLab(hex),
    C = Math.hypot(a, b);
  return [
    L,
    C,
    C < 1e-7 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
  ];
}
export function oklchToHex(L, C, H) {
  if (![L, C, H].every(Number.isFinite)) throw new TypeError("Invalid OKLCH");
  L = clamp(L);
  C = clamp(C, 0, 0.5);
  H = ((H % 360) + 360) % 360;
  const radians = (H * Math.PI) / 180,
    toLinear = (c) =>
      labToLinear([L, c * Math.cos(radians), c * Math.sin(radians)]),
    inside = (v) => v.every((n) => n >= -1e-7 && n <= 1 + 1e-7);
  let linear = toLinear(C);
  if (!inside(linear)) {
    let lo = 0,
      hi = C;
    for (let n = 0; n < 24; n++) {
      const mid = (lo + hi) / 2;
      if (inside(toLinear(mid))) lo = mid;
      else hi = mid;
    }
    linear = toLinear(lo);
  }
  return linearToHex(linear);
}
export function parseOklch(value) {
  const m = value
    .trim()
    .match(
      /^oklch\(\s*(\d*\.?\d+)(%)?\s+(\d*\.?\d+)\s+(-?\d*\.?\d+)(?:deg)?\s*\)$/i,
    );
  if (!m) return null;
  const L = +m[1] / (m[2] ? 100 : 1),
    C = +m[3],
    H = +m[4];
  return L >= 0 && L <= 1 && C >= 0 && C <= 0.5 && Number.isFinite(H)
    ? oklchToHex(L, C, H)
    : null;
}
export function formatOklch(hex) {
  const [l, c, h] = hexToOklch(hex);
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`;
}
export function mixColors(a, b, t, space = "oklab") {
  t = clamp(t);
  if (space === "srgb") {
    const x = channels(a),
      y = channels(b);
    return (
      "#" +
      x
        .map((v, i) =>
          Math.round((v + (y[i] - v) * t) * 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
        .toUpperCase()
    );
  }
  const x = hexToLab(a),
    y = hexToLab(b),
    lab = x.map((v, i) => v + (y[i] - v) * t),
    C = Math.hypot(lab[1], lab[2]);
  return oklchToHex(lab[0], C, (Math.atan2(lab[2], lab[1]) * 180) / Math.PI);
}
export const shadeSteps = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];
export function toneScale(seed, { neutral = false } = {}) {
  const [, c, h] = hexToOklch(seed),
    levels = [0.98, 0.95, 0.89, 0.81, 0.72, 0.63, 0.54, 0.45, 0.36, 0.27, 0.19];
  return Object.fromEntries(
    shadeSteps.map((step, i) => {
      const L = levels[i],
        chroma = neutral
          ? Math.min(c * 0.1, 0.014)
          : c * Math.min(1, Math.sin(L * Math.PI) * 1.16);
      return [step, oklchToHex(L, chroma, h)];
    }),
  );
}
// Machado, Oliveira & Fernandes (2009), full-severity linear-sRGB matrices.
const matrices = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};
export const visionModes = [
  "normal",
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "grayscale",
];
export function simulateVision(hex, mode = "normal") {
  if (mode === "normal") return hex.toUpperCase();
  const linear = channels(hex).map(linearize);
  if (mode === "grayscale") {
    const y = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    return linearToHex([y, y, y]);
  }
  const matrix = matrices[mode];
  return matrix
    ? linearToHex(
        matrix.map((row) => row.reduce((sum, v, i) => sum + v * linear[i], 0)),
      )
    : hex.toUpperCase();
}
