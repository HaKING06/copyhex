import { writeFile, mkdir, readFile } from "node:fs/promises";
import { infoPage } from "../js/info-pages.js";
import { messages } from "../js/i18n.js";
import { collections } from "../js/collections.js";
import { discoveryPage, collectionPage } from "../js/discovery.js";
import { generatorPage } from "../js/generator.js";
import { articles, articlePage, resourcesPage } from "../js/resources.js";
import { pageMetadata, localizedPath, siteUrl, corePages } from "../js/seo.js";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const publicCore = corePages.filter(
  (v) => !["favorites", "palettes"].includes(v),
);
const records = [];
function initialContent(view, lang, id) {
  const t = (k) => messages[lang][k] || k,
    tr = lang === "tr";
  let html;
  if (view === "discover") html = discoveryPage(t, lang);
  else if (view === "collection") html = collectionPage(id, t, lang);
  else if (view === "article") html = articlePage(id, t, lang);
  else if (view === "resources") html = resourcesPage(t, lang);
  else if (view === "generator")
    html =
      generatorPage(t) +
      `<section class="prose"><h2>${t("generatorGuide")}</h2><p>${t("generatorGuideText")}</p><figure class="article-figure"><img src="/assets/graphics/locked-palette-workflow.svg" width="1200" height="650" alt="${tr ? "Bir rengi kilitle, diğer renkleri yeniden oluştur" : "Lock one color and generate new palette alternatives"}"></figure><h2>${tr ? "Bir başlangıçtan birden fazla seçenek" : "Multiple alternatives from one starting color"}</h2><p>${tr ? "3–8 renkli bir palet oluştur. RGB ve HEX değerlerini düzenle; kilitli tonları koruyarak kalanları üret. Geri al, tek renk değiştirme, tasarım önizlemesi ve görselden renk çıkarma aynı çalışma alanındadır." : "Build a palette of 3–8 colors. Edit HEX values, lock any swatch and regenerate the rest. Undo, single-color regeneration, design preview and local image color extraction share one workspace."}</p><p>${tr ? "CSS, JSON, SVG ve PNG olarak indir veya kendi proje paletine kaydet." : "Export CSS, JSON, SVG or PNG, or save a personal project palette."}</p></section>`;
  else if (["guide", "about"].includes(view))
    html =
      infoPage(view, lang, 6000) +
      `<section class="support-panel"><h2>${t("generator")}</h2><p>${t("generatorGuideText")}</p><a class="button-link primary" href="/${lang}/palette-generator/">${t("generator")} →</a><a class="button-link" href="/${lang}/resources/">${t("resources")} →</a></section>`;
  else {
    const meta = pageMetadata(view, lang);
    html = `<section class="page-head"><p class="eyebrow">COPYHEX / COLOR WORKSPACE</p><h1>${view === "explore" ? (tr ? "Rengini bul.<br>Fikrine dönüştür." : "Find your color.<br>Build your next idea.") : esc(meta.title)}</h1><p>${esc(meta.description)}</p><div class="article-links"><a href="/${lang}/discover/">${t("discover")}</a><a href="/${lang}/palette-generator/">${t("generator")}</a><a href="/${lang}/studio/">${t("studio")}</a></div></section><article class="prose"><h2>${tr ? "HEX, RGB ve HSL renk kodları" : "HEX, RGB and HSL color codes"}</h2><p>${tr ? "CopyHex; 6.000 özgün isimli renk, arama, gelişmiş filtreler ve canlı renk seçiciyi birleştirir. Kodu tek dokunuşla kopyala, rengi favorilerine veya proje paletine ekle." : "CopyHex brings 6,000 unique named colors, searchable filters and a live color picker into one workspace. Copy a code, save a favorite or organize colors into a project palette."}</p><h2>${tr ? "Uyumlu renk paletleri oluştur" : "Create harmonious color palettes"}</h2><p>${tr ? "Hazır renk birleşimlerini keşfet veya bir başlangıç renginden kendi paletini oluştur. Sevdiğin tonları kilitle, diğerlerini yeniden üret; farklı yönleri karşılaştır ve CSS, SVG, PNG veya JSON olarak indir." : "Discover ready-made color combinations or start from one color. Lock the shades you like, regenerate the rest, compare directions and export CSS, SVG, PNG or JSON."}</p><h2>${tr ? "Özel, ücretsiz ve cihazında" : "Private, free and on your device"}</h2><p>${tr ? "Dil, tema ve paletler bu tarayıcıda saklanır. Üyelik ve takip betiği yoktur. Cihaz değiştirmeden koleksiyonunu JSON olarak yedekle." : "Language, theme and palettes stay in this browser. No account or analytics script is required. Export a JSON backup before moving to another device."}</p></article>`;
  }
  return html.replace(
    /href="\/(studio|guide|about|discover|palette-generator|resources)\//g,
    `href="/${lang}/$1/`,
  );
}
function schemaFor(meta) {
  const common = {
    "@context": "https://schema.org",
    name: meta.title,
    url: siteUrl + meta.path,
    description: meta.description,
    inLanguage: meta.lang,
  };
  if (meta.view === "article")
    return {
      ...common,
      "@type": "Article",
      headline: meta.title,
      image: siteUrl + meta.image,
      datePublished: "2026-11-08",
      dateModified: "2026-11-08",
      author: {
        "@type": "Organization",
        name: "CopyHex",
        url: siteUrl + "/en/",
      },
    };
  if (meta.view === "discover")
    return {
      ...common,
      "@type": "CollectionPage",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: collections.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: meta.lang === "tr" ? p.tr : p.name,
          url: siteUrl + localizedPath("collection", meta.lang, p.id),
        })),
      },
    };
  if (meta.view === "collection")
    return { ...common, "@type": "CreativeWork", image: siteUrl + meta.image };
  if (["guide", "resources", "about"].includes(meta.view))
    return {
      ...common,
      "@type": meta.view === "about" ? "AboutPage" : "WebPage",
    };
  return {
    ...common,
    "@type": "WebApplication",
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    softwareVersion: "1.0.1",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
async function page(view, lang, id = "", alias = null) {
  const meta = pageMetadata(view, lang, id),
    t = (k) => messages[lang][k] || k,
    path = alias === null ? meta.path : alias,
    canonical = siteUrl + meta.path;
  const og = meta.image.endsWith(".svg")
    ? "/assets/copyhex-palette-discovery.png"
    : meta.image;
  const alternates =
    ["en", "tr"]
      .map(
        (locale) =>
          `<link rel="alternate" hreflang="${locale}" href="${siteUrl + localizedPath(view, locale, id)}">`,
      )
      .join("") +
    `<link rel="alternate" hreflang="x-default" href="${view === "explore" ? siteUrl + "/" : siteUrl + localizedPath(view, "en", id)}">`;
  const schema = schemaFor(meta);
  const structured =
    view === "explore"
      ? {
          "@context": "https://schema.org",
          "@graph": [
            schema,
            {
              "@type": "WebSite",
              name: "CopyHex",
              url: siteUrl + "/en/",
              inLanguage: ["en", "tr"],
            },
          ],
        }
      : schema;
  const nav = `<header><a class="brand" href="/${lang}/"><img src="/assets/logo.svg" width="38" height="38" alt="">CopyHex</a><nav>${["explore", "discover", "generator", "studio", "resources", "about"].map((v) => `<a href="${localizedPath(v, lang)}">${t(v === "explore" ? "colorsNav" : v)}</a>`).join("")}</nav><div><a href="${localizedPath(view, "en", id)}" lang="en">English</a> / <a href="${localizedPath(view, "tr", id)}" lang="tr">Türkçe</a></div></header>`;
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f9fc"><meta name="color-scheme" content="light dark"><title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}"><meta name="robots" content="${meta.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}"><meta name="author" content="CopyHex"><link rel="canonical" href="${canonical}">${alternates}<meta property="og:type" content="${view === "article" ? "article" : "website"}"><meta property="og:site_name" content="CopyHex"><meta property="og:locale" content="${lang === "tr" ? "tr_TR" : "en_US"}"><meta property="og:locale:alternate" content="${lang === "tr" ? "en_US" : "tr_TR"}"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl + og}"><meta property="og:image:width" content="${meta.image.endsWith(".svg") ? 1536 : meta.width}"><meta property="og:image:height" content="${meta.image.endsWith(".svg") ? 1024 : meta.height}"><meta property="og:image:alt" content="${esc(meta.imageAlt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(meta.title)}"><meta name="twitter:description" content="${esc(meta.description)}"><meta name="twitter:image" content="${siteUrl + og}"><link rel="icon" href="/assets/logo.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/icon-180.png"><link rel="manifest" href="/manifest.webmanifest"><script src="/js/theme-init.js"></script><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/workspace.css"><script type="application/ld+json">${JSON.stringify(structured)}</script><script type="module" src="/js/app.js"></script></head><body><div id="app">${nav}<main>${initialContent(view, lang, id)}</main><footer><a class="brand" href="/${lang}/">CopyHex</a><a href="mailto:copyhex@haking.tr">copyhex@haking.tr</a></footer></div><div id="toast" role="status" aria-live="polite"></div><dialog id="dialog"></dialog><noscript>${lang === "tr" ? "Etkileşimli araçlar için JavaScript gerekir. Rehberler ve palet açıklamaları okunabilir." : "Enable JavaScript for interactive tools. The guides and palette descriptions remain readable."}</noscript></body></html>`;
  const file = path === "/" ? "index.html" : path.slice(1) + "index.html";
  const parent = file.slice(0, file.lastIndexOf("/"));
  if (parent) await mkdir(parent, { recursive: true });
  await writeFile(file, html);
  if (alias === null) records.push({ ...meta, file });
}
for (const lang of ["en", "tr"]) {
  for (const view of corePages) await page(view, lang);
  for (const p of collections) await page("collection", lang, p.id);
  for (const a of articles) await page("article", lang, a.id);
}
// Existing URLs remain usable; their canonical points to the explicit English URL.
await page("explore", "en", "", "/");
for (const view of corePages.filter((v) => v !== "explore"))
  await page(
    view,
    "en",
    "",
    view === "generator" ? "/palette-generator/" : `/${view}/`,
  );
await mkdir("sitemaps", { recursive: true });
const alternateXml = (r) =>
  ["en", "tr"]
    .map(
      (lang) =>
        `<xhtml:link rel="alternate" hreflang="${lang}" href="${siteUrl + localizedPath(r.view, lang, r.id)}"/>`,
    )
    .join("") +
  `<xhtml:link rel="alternate" hreflang="x-default" href="${r.view === "explore" ? siteUrl + "/" : siteUrl + localizedPath(r.view, "en", r.id)}"/>`;
const urlset = (rows) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${rows.map((r) => `<url><loc>${siteUrl + r.path}</loc><lastmod>2026-11-08</lastmod>${alternateXml(r)}</url>`).join("")}</urlset>\n`;
await writeFile(
  "sitemaps/pages.xml",
  urlset(records.filter((r) => publicCore.includes(r.view))),
);
await writeFile(
  "sitemaps/palettes.xml",
  urlset(records.filter((r) => r.view === "collection")),
);
await writeFile(
  "sitemaps/guides.xml",
  urlset(records.filter((r) => r.view === "article")),
);
const imageRows = [];
for (const r of records.filter((r) => !r.noindex)) {
  const html = await readFile(r.file, "utf8");
  const images = [
    ...new Set(
      [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)]
        .map((m) => m[1])
        .filter(
          (src) => src.startsWith("/assets/") && !src.includes("logo.svg"),
        ),
    ),
  ];
  if (images.length)
    imageRows.push(
      `<url><loc>${siteUrl + r.path}</loc>${images.map((image) => `<image:image><image:loc>${siteUrl + image}</image:loc></image:image>`).join("")}</url>`,
    );
}
await writeFile(
  "sitemaps/images.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${imageRows.join("")}</urlset>\n`,
);
await writeFile(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["pages", "palettes", "guides", "images"].map((name) => `<sitemap><loc>${siteUrl}/sitemaps/${name}.xml</loc></sitemap>`).join("")}</sitemapindex>\n`,
);
await writeFile(
  "robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
);
await writeFile("data/page-manifest.json", JSON.stringify(records, null, 2));
console.log(
  `Generated ${records.length} localized pages, ${collections.length} palette pages per language and 4 sitemaps.`,
);
