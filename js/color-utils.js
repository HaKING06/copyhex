export function rgb(hex) {
  return hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16));
}
export function hsl(hex) {
  let [r, g, b] = rgb(hex).map((v) => v / 255),
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2,
    h = 0,
    s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h =
      max === r
        ? ((g - b) / d) % 6
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
export function format(hex, type = "HEX") {
  const [r, g, b] = rgb(hex),
    [h, s, l] = hsl(hex);
  if (type === "RGB") return `rgb(${r}, ${g}, ${b})`;
  if (type === "HSL") return `hsl(${h}, ${s}%, ${l}%)`;
  if (type === "CMYK") {
    let k = 1 - Math.max(r, g, b) / 255;
    return `cmyk(${[r, g, b].map((v) => Math.round(k === 1 ? 0 : ((1 - v / 255 - k) / (1 - k)) * 100)).join("%, ")}%, ${Math.round(k * 100)}%)`;
  }
  return hex.toUpperCase();
}
export function parseColor(value) {
  let s = value.trim();
  if (/^#?[\da-f]{3}([\da-f]{3})?$/i.test(s)) {
    s = s.replace("#", "");
    return (
      "#" +
      (s.length === 3
        ? s
            .split("")
            .map((c) => c + c)
            .join("")
        : s
      ).toUpperCase()
    );
  }
  let m = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (m && m.slice(1).every((v) => +v <= 255))
    return (
      "#" +
      m
        .slice(1)
        .map((v) => (+v).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  m = s.match(
    /^hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$/i,
  );
  if (m && +m[2] <= 100 && +m[3] <= 100) {
    let h = +m[1] % 360,
      s = +m[2] / 100,
      l = +m[3] / 100;
    let a = s * Math.min(l, 1 - l);
    return (
      "#" +
      [0, 8, 4]
        .map((n) => {
          let k = (n + h / 30) % 12;
          return Math.round(
            255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))),
          )
            .toString(16)
            .padStart(2, "0");
        })
        .join("")
        .toUpperCase()
    );
  }
  return null;
}
export function luminance(hex) {
  return rgb(hex)
    .map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) {
  return (
    (Math.max(luminance(a), luminance(b)) + 0.05) /
    (Math.min(luminance(a), luminance(b)) + 0.05)
  );
}
