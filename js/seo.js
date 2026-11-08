import { collections } from "./collections.js";
import { articles } from "./resources.js";
export const siteUrl = "https://copyhex.haking.tr";
export function localizedPath(view, lang = "en", id = "") {
  return (
    `/${lang}/` +
    (view === "explore"
      ? ""
      : view === "generator"
        ? "palette-generator/"
        : view === "collection"
          ? `collections/${id}/`
          : view === "article"
            ? `learn/${id}/`
            : `${view}/`)
  );
}
export const corePages = [
  "explore",
  "discover",
  "generator",
  "studio",
  "resources",
  "guide",
  "about",
  "favorites",
  "palettes",
];
export function pageMetadata(view, lang = "en", id = "") {
  const tr = lang === "tr",
    prefix = tr ? "CopyHex — " : "CopyHex — ";
  const titles = {
    explore: tr
      ? "Renk Kodları, HEX ve RGB Renk Seçici"
      : "Color Codes, HEX & RGB Color Picker",
    discover: tr
      ? "Uyumlu Renk Paletlerini Keşfet"
      : "Discover Color Palettes & Color Combinations",
    generator: tr
      ? "Akıllı Renk Paleti Oluşturucu"
      : "Smart Color Palette Generator",
    studio: tr
      ? "Canlı HEX, RGB ve HSL Renk Stüdyosu"
      : "Live Color Picker & HEX, RGB, HSL Converter",
    resources: tr
      ? "Renk Paleti Rehberleri ve Kaynaklar"
      : "Color Palette Guides & Design Resources",
    guide: tr ? "CopyHex Nasıl Kullanılır?" : "How to Use CopyHex",
    about: tr
      ? "Hakkında, Gizlilik ve Açık Kaynak"
      : "About, Privacy & Open Source",
    favorites: tr ? "Favori Renklerim" : "My Favorite Colors",
    palettes: tr ? "Kişisel Renk Paletlerim" : "My Color Palettes",
  };
  const descriptions = {
    explore: tr
      ? "6.000 özgün rengi keşfet, HEX ve RGB renk kodlarını kopyala. Renk seçici, gelişmiş filtreler ve projeye özel paletler."
      : "Explore 6,000 unique named colors. Find HEX and RGB color codes, copy HSL values and save favorites or project palettes.",
    discover: tr
      ? "24 uyumlu renk paletini keşfet. Pastel, doğa, koyu ve canlı renk birleşimlerini düzenle, indir veya kendi paletlerine kaydet."
      : "Discover 24 curated color palettes for websites, branding and creative projects. Customize pastel, earthy, dark and vibrant color combinations.",
    generator: tr
      ? "Bir renkle başla; sevdiğin tonları kilitle, diğerlerini yeniden üret. Tek rengi değiştir, seçenekleri karşılaştır, SVG, PNG ve CSS indir."
      : "Start with one color. Lock swatches, regenerate the rest, compare alternatives and export CSS, JSON, SVG or PNG with this free color palette generator.",
    studio: tr
      ? "16,7 milyon RGB olasılığı için canlı renk seçici. HEX, RGB, HSL ve CMYK kodlarını kopyala; kontrastı kontrol et ve paletine kaydet."
      : "Fine-tune any 8-bit RGB color with live RGB and HSL sliders. Copy HEX, RGB, HSL and CMYK values, check contrast and save colors.",
    resources: tr
      ? "Uyumlu renk seçimi, erişilebilir paletler, görselden renk çıkarma ve CSS/SVG/PNG çıktılarını anlatan pratik rehberler."
      : "Practical guides to color harmonies, brand palettes, accessible color combinations, image color extraction and CSS/SVG/PNG palette export.",
    guide: tr
      ? "Renk arama, palet keşfi, akıllı oluşturucu, yedekleme ve uygulama kurulumu için CopyHex rehberi."
      : "Learn to search color codes, discover palettes, generate color schemes, back up your collection and install the CopyHex app.",
    about: tr
      ? "CopyHex renk çalışma alanı, açık renk verisi, gizlilik, MIT lisansı ve sürüm 1.0.1 hakkında bilgi."
      : "Learn about the CopyHex color workspace, open color data, privacy, MIT licensing and version 1.0.1.",
    favorites: tr
      ? "Bu tarayıcıda saklanan favori renk koleksiyonun."
      : "Your favorite colors, stored privately in this browser.",
    palettes: tr
      ? "Proje adları ve notlarıyla bu tarayıcıda saklanan renk paletlerin."
      : "Your project color palettes, stored privately in this browser.",
  };
  let title = prefix + (titles[view] || titles.explore),
    description = descriptions[view] || descriptions.explore,
    image = "/assets/copyhex-palette-discovery.png",
    imageAlt = "CopyHex — Colors that work together.",
    width = 1536,
    height = 1024;
  if (view === "generator") {
    image = "/assets/copyhex-smart-palette-generator.png";
    imageAlt = "CopyHex — One color. Endless palettes.";
  }
  if (view === "collection") {
    const p = collections.find((p) => p.id === id);
    if (p) {
      title =
        (tr ? p.tr : p.name) +
        (tr ? " Renk Paleti | CopyHex" : " Color Palette | CopyHex");
      description = tr ? p.descriptionTr : p.description;
      image = `/assets/palettes/${p.id}.png`;
      imageAlt = `${p.name}: ${p.colors.join(", ")}`;
      width = 1200;
      height = 720;
    }
  }
  if (view === "article") {
    const a = articles.find((a) => a.id === id);
    if (a) {
      title = (tr ? a.tr : a.title) + " | CopyHex";
      description = tr ? a.descriptionTr : a.description;
      image = a.image;
      imageAlt = tr ? a.tr : a.title;
      width = 1200;
      height = 720;
    }
  }
  return {
    view,
    lang,
    id,
    title,
    description,
    image,
    imageAlt,
    width,
    height,
    path: localizedPath(view, lang, id),
    noindex: ["favorites", "palettes"].includes(view),
  };
}
