import { writeFile, mkdir } from "node:fs/promises";
import { infoPage } from "../js/info-pages.js";
const base = "https://copyhex.haking.tr";
const pages = [
  [
    "",
    "CopyHex — Color Picker, HEX & RGB Codes, Color Palettes",
    "Explore 6,000 unique named colors. Copy HEX, RGB, HSL and CMYK codes, create color palettes, and use a live color picker. English and Turkish.",
  ],
  [
    "studio",
    "Color Picker & Live HEX, RGB, HSL Converter | CopyHex",
    "Create any 8-bit RGB color with live sliders, copy HEX/RGB/HSL values, check contrast and save palettes in the CopyHex color studio.",
  ],
  [
    "about",
    "About CopyHex — Free Color Workspace 1.0.1",
    "Learn about CopyHex, its 6,000 unique color catalog, privacy, MIT license, open color data and version 1.0.1.",
  ],
  [
    "guide",
    "How to Use CopyHex — Color Codes & Palette Guide",
    "Learn to find HEX and RGB colors, use the color picker, save project palettes, back up your collection and install CopyHex.",
  ],
  [
    "palettes",
    "My Color Palettes | CopyHex",
    "Organize your project color palettes locally in your browser.",
  ],
  [
    "favorites",
    "Favorite Colors | CopyHex",
    "Your personal collection of favorite color codes.",
  ],
];
const nav =
  '<nav><a href="/">Colors & HEX codes</a><a href="/studio/">Color picker</a><a href="/guide/">How to use</a><a href="/about/">About CopyHex</a></nav>';
for (const [slug, title, description] of pages) {
  const canonical = base + "/" + (slug ? slug + "/" : "");
  const info = ["about", "guide"].includes(slug)
    ? infoPage(slug, "en", 6000)
    : `<h1>${slug === "studio" ? "Color picker & HEX / RGB converter" : slug ? "Your color workspace" : "Find colors. Copy HEX codes. Build color palettes."}</h1><p>${description}</p><p>CopyHex is a free color tool for developers and designers. Explore 6,000 distinct HEX colors and 16,777,216 opaque RGB possibilities. Search by name, color family or code. Save favorites and project palettes locally, then export CSS variables or JSON backups.</p><h2>HEX, RGB, HSL and CMYK color codes</h2><p>Open the color studio to adjust red, green and blue channels or hue, saturation and lightness. Preview the result, copy any format and check text contrast. CMYK conversion is approximate and depends on print profiles.</p><h2>Renk kodu bul, renk paleti oluştur</h2><p>CopyHex ile renkleri keşfet, HEX ve RGB renk kodlarını kopyala. Türkçe arayüz, gelişmiş filtreler, koyu tema, favoriler ve projeye özel renk paletleri. Menüden Türkçe seçebilirsin.</p><p><a href="/studio/">Open the color picker</a> · <a href="/guide/">Read the guide</a></p>`;
  const schema = {
    "@context": "https://schema.org",
    "@type":
      slug === "about"
        ? "AboutPage"
        : slug === "guide"
          ? "WebPage"
          : "WebApplication",
    name: slug ? title : "CopyHex",
    url: canonical,
    description,
    ...(!["about", "guide"].includes(slug)
      ? {
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          softwareVersion: "1.0.1",
          inLanguage: ["en", "tr"],
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }
      : {}),
  };
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f9fc"><meta name="color-scheme" content="light dark"><meta name="description" content="${description}"><meta name="robots" content="${["favorites", "palettes"].includes(slug) ? "noindex,follow" : "index,follow"}"><meta name="author" content="CopyHex"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="CopyHex"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}/assets/copyhex-poster.png"><meta property="og:image:width" content="1536"><meta property="og:image:height" content="1024"><meta property="og:image:alt" content="CopyHex — Find your color. Build your palette."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${base}/assets/copyhex-poster.png"><link rel="icon" href="/assets/logo.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/icon-180.png"><link rel="manifest" href="/manifest.webmanifest"><script src="/js/theme-init.js"></script><link rel="stylesheet" href="/css/style.css"><title>${title}</title><script type="application/ld+json">${JSON.stringify(slug ? schema : { "@context": "https://schema.org", "@graph": [schema, { "@type": "WebSite", name: "CopyHex", alternateName: "CopyHex Color Workspace", url: base + "/", inLanguage: ["en", "tr"] }] })}</script><script type="module" src="/js/app.js"></script></head><body><div id="app"><div class="seo-fallback"><a href="/">CopyHex</a>${nav}<main>${info}</main><p>Support: <a href="mailto:copyhex@haking.tr">copyhex@haking.tr</a> · Version 1.0.1</p></div></div><div id="toast" role="status" aria-live="polite"></div><dialog id="dialog"></dialog><noscript>Enable JavaScript to use the interactive color tools. The guide and about information above remain readable.</noscript></body></html>`;
  if (slug) await mkdir(slug, { recursive: true });
  await writeFile(slug ? `${slug}/index.html` : "index.html", html);
}
await writeFile(
  "robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,
);
await writeFile(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", "studio/", "about/", "guide/"].map((p) => `<url><loc>${base}/${p}</loc></url>`).join("")}</urlset>\n`,
);
console.log("Generated crawlable pages and SEO metadata.");
