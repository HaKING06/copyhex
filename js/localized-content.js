import { collectionNames } from "./collection-names.js";
import { messages } from "./i18n.js";
const articleKeys = {
  "color-harmonies": ["harmonyArticle", "harmonyLearning"],
  "build-a-brand-color-palette": ["brandArticle", "generatorGuideText"],
  "accessible-color-palettes": ["accessibilityArticle", "contrastLearning"],
  "extract-colors-from-an-image": ["imageArticle", "imageExtractInfo"],
  "export-css-color-palettes": ["exportArticle", "exportLearning"],
};
export function collectionDetails(p, lang) {
  if (lang === "en") return p;
  if (lang === "tr") return { ...p, name: p.tr, description: p.descriptionTr };
  const t = (k) => messages[lang][k];
  return {
    ...p,
    name: collectionNames[lang]?.[p.id] || p.name,
    description: `${t(p.category === "dark" ? "darkTheme" : p.category)} · ${p.colors.length} ${t("results")}. ${t("collectionUseText")}`,
  };
}
export function articleDetails(a, lang) {
  if (lang === "en") return a;
  if (lang === "tr")
    return {
      ...a,
      title: a.tr,
      description: a.descriptionTr,
      sections: a.sections.map(([h, tr, p, pt]) => [tr, tr, pt, pt]),
    };
  const t = (k) => messages[lang][k],
    keys = articleKeys[a.id];
  return {
    ...a,
    title: t(keys[0]),
    description: t(keys[1]),
    sections: [
      [t(keys[0]), t(keys[0]), t(keys[1]), t(keys[1])],
      [
        t("collectionUse"),
        t("collectionUse"),
        t("collectionUseText"),
        t("collectionUseText"),
      ],
      [
        t("exportFormat"),
        t("exportFormat"),
        t("exportLearning"),
        t("exportLearning"),
      ],
    ],
  };
}
