import { parseColor } from "./color-utils.js";
import { mixColors } from "./color-spaces.js";
export const defaultGradient = {
  type: "linear",
  angle: 120,
  space: "oklab",
  stops: [
    { hex: "#8B7CF8", pos: 0 },
    { hex: "#75C9B4", pos: 54 },
    { hex: "#F2D38B", pos: 100 },
  ],
};
export function normalizeGradient(input) {
  if (
    !input ||
    !["linear", "radial"].includes(input.type) ||
    !["srgb", "oklab"].includes(input.space) ||
    !Number.isFinite(+input.angle) ||
    !Array.isArray(input.stops) ||
    input.stops.length < 2 ||
    input.stops.length > 8
  )
    return null;
  const stops = input.stops.map((s) => ({
    hex: parseColor(String(s.hex || "")),
    pos: +s.pos,
  }));
  if (
    stops.some(
      (s) => !s.hex || !Number.isFinite(s.pos) || s.pos < 0 || s.pos > 100,
    )
  )
    return null;
  return {
    type: input.type,
    angle: ((+input.angle % 360) + 360) % 360,
    space: input.space,
    stops: stops.sort((a, b) => a.pos - b.pos),
  };
}
export function gradientValue(g, { fallback = false } = {}) {
  const interpolation = !fallback && g.space === "oklab" ? " in oklab" : "";
  return `${g.type}-gradient(${g.type === "linear" ? g.angle + "deg" + interpolation : "circle" + interpolation}, ${g.stops.map((s) => s.hex + " " + s.pos + "%").join(", ")})`;
}
export function gradientCss(g) {
  const first = `background: ${gradientValue(g, { fallback: true })};`;
  return g.space === "oklab"
    ? first + "\nbackground: " + gradientValue(g) + ";"
    : first;
}
export function gradientAt(g, t) {
  const pos = t * 100,
    stops = g.stops;
  if (pos < stops[0].pos) return stops[0].hex;
  for (let i = 1; i < stops.length; i++)
    if (pos < stops[i].pos) {
      const a = stops[i - 1],
        b = stops[i];
      return mixColors(a.hex, b.hex, (pos - a.pos) / (b.pos - a.pos), g.space);
    }
  return stops.at(-1).hex;
}
export function gradientGeometry(g, width = 1200, height = 720) {
  const a = (g.angle * Math.PI) / 180,
    dx = Math.sin(a),
    dy = -Math.cos(a),
    length = Math.abs(width * dx) + Math.abs(height * dy);
  return {
    dx,
    dy,
    length,
    x1: width / 2 - (dx * length) / 2,
    y1: height / 2 - (dy * length) / 2,
    x2: width / 2 + (dx * length) / 2,
    y2: height / 2 + (dy * length) / 2,
    r: Math.hypot(width / 2, height / 2),
  };
}
export function gradientSvg(g) {
  const geo = gradientGeometry(g),
    stops = [
      ...Array.from({ length: 129 }, (_, i) => ({
        pos: i / 128,
        hex: gradientAt(g, i / 128),
      })),
      ...g.stops.map((s) => ({ pos: s.pos / 100, hex: s.hex })),
    ]
      .sort((a, b) => a.pos - b.pos)
      .map((s) => `<stop offset="${s.pos}" stop-color="${s.hex}"/>`)
      .join(""),
    def =
      g.type === "linear"
        ? `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${geo.x1}" y1="${geo.y1}" x2="${geo.x2}" y2="${geo.y2}">${stops}</linearGradient>`
        : `<radialGradient id="g" gradientUnits="userSpaceOnUse" cx="600" cy="360" r="${geo.r}">${stops}</radialGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><defs>${def}</defs><rect width="1200" height="720" fill="url(#g)"/></svg>`;
}
export function paintGradient(canvas, g) {
  const ctx = canvas.getContext("2d"),
    w = canvas.width,
    h = canvas.height,
    geo = gradientGeometry(g, w, h),
    lookup = Array.from({ length: 1025 }, (_, i) =>
      gradientAt(g, i / 1024)
        .slice(1)
        .match(/../g)
        .map((v) => parseInt(v, 16)),
    ),
    image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const t =
          g.type === "radial"
            ? Math.hypot(x + 0.5 - w / 2, y + 0.5 - h / 2) / geo.r
            : ((x + 0.5 - w / 2) * geo.dx + (y + 0.5 - h / 2) * geo.dy) /
                geo.length +
              0.5,
        values = lookup[Math.round(Math.max(0, Math.min(1, t)) * 1024)],
        i = (y * w + x) * 4;
      image.data[i] = values[0];
      image.data[i + 1] = values[1];
      image.data[i + 2] = values[2];
      image.data[i + 3] = 255;
    }
  ctx.putImageData(image, 0, 0);
}
