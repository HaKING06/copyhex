import { brandPage } from "../js/brand-studio.js";
import { gradientPage } from "../js/gradient-studio.js";
import { projectPage } from "../js/project-palette.js";
import { VERSION } from "../js/version.js";
import { collectionDetails } from "../js/localized-content.js";
import { locales, localeCodes } from "../js/locales.js";
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
const publicCore = corePages.filter((v) => !pageMetadata(v, "en").noindex);
const records = [];
function initialContent(view, lang, id) {
  const t = (k) => messages[lang][k];
  if (view === "brand") return brandPage(t);
  if (view === "gradient") return gradientPage(t);
  if (view === "project") return projectPage(t, lang);
  if (view === "discover") return discoveryPage(t, lang);
  if (view === "collection") return collectionPage(id, t, lang);
  if (view === "article") return articlePage(id, t, lang);
  if (view === "resources") return resourcesPage(t, lang);
  if (view === "generator")
    return (
      generatorPage(t) +
      `<article class="prose"><h2>${t("generatorGuide")}</h2><p>${t("generatorGuideText")}</p><img src="/assets/graphics/locked-palette-workflow.svg" width="1200" height="650" alt="${t("lockedHint")}"><h2>${t("exportFormat")}</h2><p>${t("exportLearning")}</p></article>`
    );
  if (["guide", "about"].includes(view)) return infoPage(view, lang, 6000);
  const meta = pageMetadata(view, lang);
  return `<section class="page-head"><p class="eyebrow">CopyHex</p><h1>${view === "explore" ? t("title") : esc(meta.title)}</h1><p>${esc(meta.description)}</p><div class="article-links"><a href="/${lang}/discover/">${t("discover")}</a><a href="/${lang}/palette-generator/">${t("generator")}</a><a href="/${lang}/studio/">${t("studio")}</a></div></section><article class="prose"><h2>${t("workspace")}</h2><p>${t("seoSummary")}</p><h2>${t("generator")}</h2><p>${t("generatorGuideText")}</p><h2>${t("privacyLabel")}</h2><p>${t("privacyNotice")}</p></article>`;
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
          name: collectionDetails(p, meta.lang).name,
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
    softwareVersion: VERSION,
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
    localeCodes
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
              inLanguage: localeCodes,
            },
          ],
        }
      : schema;
  const nav = `<header><a class="brand" href="/${lang}/"><img src="/assets/logo.svg" width="38" height="38" alt="">CopyHex</a><nav>${["explore", "discover", "generator", "studio", "resources", "about"].map((v) => `<a href="${localizedPath(v, lang)}">${t(v === "explore" ? "colorsNav" : v)}</a>`).join("")}</nav><details class="static-languages"><summary>${t("language")}</summary>${locales.map((l) => `<a href="${localizedPath(view, l.code, id)}" lang="${l.code}">${l.name}</a>`).join(" · ")}</details></header>`;
  const html = `<!doctype html><html lang="${lang}" dir="${locales.find((l) => l.code === lang).dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f9fc"><meta name="color-scheme" content="light dark"><title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}"><meta name="robots" content="${meta.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}"><meta name="author" content="CopyHex"><link rel="canonical" href="${canonical}">${alternates}<meta property="og:type" content="${view === "article" ? "article" : "website"}"><meta property="og:site_name" content="CopyHex"><meta property="og:locale" content="${locales.find((l) => l.code === lang).og}"><meta property="og:locale:alternate" content="en_US"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl + og}"><meta property="og:image:width" content="${meta.image.endsWith(".svg") ? 1536 : meta.width}"><meta property="og:image:height" content="${meta.image.endsWith(".svg") ? 1024 : meta.height}"><meta property="og:image:alt" content="${esc(meta.imageAlt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(meta.title)}"><meta name="twitter:description" content="${esc(meta.description)}"><meta name="twitter:image" content="${siteUrl + og}"><link rel="icon" href="/assets/logo.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/icon-180.png"><link rel="manifest" href="/manifest.webmanifest"><script src="/js/theme-init.js"></script><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/workspace.css"><link rel="stylesheet" href="/css/global.css"><link rel="stylesheet" href="/css/tools.css"><script type="application/ld+json">${JSON.stringify(structured)}</script><script type="module" src="/js/app.js"></script></head><body><div id="app">${nav}<main>${initialContent(view, lang, id)}</main><footer><a class="brand" href="/${lang}/">CopyHex</a><a href="mailto:copyhex@haking.tr">copyhex@haking.tr</a></footer></div><div id="toast" role="status" aria-live="polite"></div><dialog id="dialog"></dialog><noscript>CopyHex · ${t("guide")}</noscript></body></html>`;
  const file = path === "/" ? "index.html" : path.slice(1) + "index.html";
  const parent = file.slice(0, file.lastIndexOf("/"));
  if (parent) await mkdir(parent, { recursive: true });
  await writeFile(file, html);
  if (alias === null) records.push({ ...meta, file });
}
for (const lang of localeCodes) {
  for (const view of corePages) await page(view, lang);
  for (const p of collections) await page("collection", lang, p.id);
  for (const a of articles) await page("article", lang, a.id);
}
// Existing URLs remain usable; their canonical points to the explicit English URL.
await page("explore", "en", "", "/");
for (const view of corePages.filter((v) => v !== "explore"))
  await page(view, "en", "", localizedPath(view, "en").replace("/en/", "/"));
await mkdir("sitemaps", { recursive: true });
const alternateXml = (r) =>
  localeCodes
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
