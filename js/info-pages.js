import { messages } from "./i18n.js";
export function infoPage(kind, lang, count) {
  const t = (k) => messages[lang][k];
  if (kind === "about")
    return `<section class="page-head"><p class="eyebrow">CopyHex</p><h1>${t("about")}</h1><p>${t("aboutIntro")}</p></section><div class="info-stats"><div><b>${count.toLocaleString(lang)}</b><span>${t("results")}</span></div><div><b>24</b><span>${t("allPalettes")}</span></div><div><b>12</b><span>${t("language")}</span></div></div><article class="prose"><h2>${t("workspace")}</h2><p>${t("seoSummary")}</p><h2>${t("generator")}</h2><p>${t("generatorGuideText")}</p><h2 id="privacy">${t("privacyLabel")}</h2><p>${t("privacyNotice")}</p><h2>${t("source")}</h2><p>${t("dataNotice")}</p><p><a href="https://github.com/meodai/color-names" target="_blank" rel="noopener">Color Names ↗</a> · <a href="/licenses/color-names-MIT.txt">MIT</a></p><h2>${t("contact")}</h2><p><a href="mailto:copyhex@haking.tr">copyhex@haking.tr</a></p><p class="muted">${t("version")} 1.0.1 · <a href="/LICENSE">MIT</a></p><a class="button-link primary" href="/${lang}/guide/">${t("readGuide")} →</a></article>`;
  const items = [
    ["colorsNav", "tip"],
    ["discover", "discoverIntro"],
    ["generator", "generatorGuideText"],
    ["studio", "studioIntro"],
    ["contrast", "contrastLearning"],
    ["imageExtract", "imageExtractInfo"],
    ["exportFormat", "exportLearning"],
    ["backup", "privacyNotice"],
  ];
  return `<section class="page-head"><p class="eyebrow">CopyHex</p><h1>${t("guide")}</h1><p>${t("aboutIntro")}</p></section><div class="guide-grid">${items.map(([h, p], i) => `<article><span>${String(i + 1).padStart(2, "0")}</span><h2>${t(h)}</h2><p>${t(p)}</p></article>`).join("")}</div><section class="support-panel"><h2>${t("support")}</h2><p>${t("contact")}</p><a class="button-link primary" href="mailto:copyhex@haking.tr">copyhex@haking.tr ↗</a><a class="button-link" href="/${lang}/resources/">${t("resources")}</a></section>`;
}
