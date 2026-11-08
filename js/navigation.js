import { localizedPath } from "./seo.js";
import { icon } from "./icons.js";
export const toolLinks = [
  ["generator", "generator", "palette"],
  ["studio", "studio", "picker"],
  ["brand", "brandBuilder", "layers"],
  ["gradient", "gradientStudio", "gradient"],
];
export function navigation(t, lang, view) {
  const activeTool = toolLinks.some(([v]) => v === view);
  const link = (v, key) =>
    `<a href="${localizedPath(v, lang)}" class="${view === v || (v === "discover" && view === "collection") ? "current" : ""}" ${view === v ? 'aria-current="page"' : ""}>${t(key)}</a>`;
  return `<nav class="main-navigation" aria-label="CopyHex">${link("explore", "colorsNav")}${link("discover", "discover")}<details class="tools-menu" id="tools-navigation"><summary class="${activeTool ? "current" : ""}">${t("toolsMenu")}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="tools-popover"><p>${t("workspace")}</p><div>${toolLinks.map(([v, key, glyph]) => `<a href="${localizedPath(v, lang)}" class="${view === v ? "current" : ""}" ${view === v ? 'aria-current="page"' : ""}><span class="tool-icon">${icon(glyph)}</span><span>${t(key)}</span><span aria-hidden="true">↗</span></a>`).join("")}</div><a class="tools-guide" href="${localizedPath("guide", lang)}">${t("readGuide")} →</a></div></details>${link("palettes", "palettes")}</nav>`;
}
