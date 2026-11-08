import { colorWords } from "./locales.js";
import { hsl, rgb, luminance, parseColor } from "./color-utils.js";
export const groups = {
  Kırmızı: "red",
  Pembe: "pink",
  Turuncu: "orange",
  Sarı: "yellow",
  Mor: "purple",
  Yeşil: "green",
  Mavi: "blue",
  Nötr: "neutral",
  Kahverengi: "brown",
};
const words = {
  red: "kırmızı",
  blue: "mavi",
  green: "yeşil",
  white: "beyaz",
  black: "siyah",
  yellow: "sarı",
  pink: "pembe",
  purple: "mor",
  orange: "turuncu",
  brown: "kahverengi",
  gray: "gri",
  grey: "gri",
  gold: "altın",
  silver: "gümüş",
  navy: "lacivert",
  cyan: "camgöbeği",
  turquoise: "turkuaz",
  violet: "menekşe",
  coral: "mercan",
  salmon: "somon",
  olive: "zeytin",
  beige: "bej",
  lavender: "lavanta",
  ivory: "fildişi",
  crimson: "kızıl",
  maroon: "bordo",
  teal: "deniz mavisi",
  light: "açık",
  dark: "koyu",
  medium: "orta",
  pale: "soluk",
  deep: "derin",
};
export const normalize = (s) =>
  s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s/g, "");
export function indexColors(colors) {
  return colors.map((c) => {
    const aliases = [c.name, ...(c.aliases || [])]
      .join(" ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");
    const translations = aliases
      .toLowerCase()
      .split(/\s+/)
      .map((w) => words[w] || "")
      .join(" ");
    const family = [
      "red",
      "pink",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "brown",
      "neutral",
      "white",
      "black",
      "gray",
      "light",
      "dark",
    ];
    const translated = Object.values(colorWords)
      .map((list) => {
        const category = family.indexOf(groups[c.cat]);
        return (
          (category >= 0 ? list[category] : "") +
          " " +
          aliases
            .toLowerCase()
            .split(/\s+/)
            .map((word) => {
              const i = family.indexOf(word === "grey" ? "gray" : word);
              return i >= 0 ? list[i] : "";
            })
            .join(" ")
        );
      })
      .join(" ");
    return {
      ...c,
      hsl: hsl(c.hex),
      rgb: rgb(c.hex),
      luminance: luminance(c.hex),
      search: normalize(
        aliases +
          " " +
          translations +
          " " +
          translated +
          " " +
          c.cat +
          " " +
          c.hex +
          " rgb(" +
          rgb(c.hex).join(", ") +
          ")",
      ),
    };
  });
}
export function filterColors(
  index,
  {
    query = "",
    category = "all",
    brightness = "any",
    saturation = "any",
    source = "any",
    sort = "curated",
  } = {},
) {
  const q = normalize(query),
    parsed = parseColor(query),
    target = parsed ? rgb(parsed) : null;
  let list = index.filter((c) => {
    const [h, s, l] = c.hsl;
    return (
      (!q || (sort === "nearest" && target) || c.search.includes(q)) &&
      (category === "all" || groups[c.cat] === category) &&
      (source !== "css" || c.aliases.includes("css-keyword")) &&
      (brightness === "any" ||
        (brightness === "lightColors"
          ? l >= 70
          : brightness === "darkColors"
            ? l < 35
            : l >= 35 && l < 70)) &&
      (saturation === "any" ||
        (saturation === "pastel"
          ? s >= 20 && s <= 75 && l >= 70
          : saturation === "vivid"
            ? s >= 70
            : s < 30))
    );
  });
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "light" || sort === "dark")
    list.sort(
      (a, b) => (b.luminance - a.luminance) * (sort === "dark" ? -1 : 1),
    );
  if (sort === "hue") list.sort((a, b) => a.hsl[0] - b.hsl[0]);
  if (sort === "nearest" && target)
    list.sort((a, b) => distance(a.rgb, target) - distance(b.rgb, target));
  return list;
}
function distance(a, b) {
  return a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0);
}
