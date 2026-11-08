import { navigation } from "./navigation.js";
import { brandPage, bindBrand } from "./brand-studio.js";
import { gradientPage, bindGradient } from "./gradient-studio.js";
import {
  projectPage,
  bindProject,
  historyMarkup,
  bindHistory,
} from "./project-palette.js";
import {
  cleanVersions,
  updatePalette,
  encodePalette,
  sharePayload,
} from "./palette-versions.js";
import { colors } from "./colors.js";
import { format, parseColor, hsl, luminance, contrast } from "./color-utils.js";
import { messages } from "./i18n.js";
import { locales, localeCodes, isLocale, resolveLocale } from "./locales.js";
import { icon } from "./icons.js";
import { collectionDetails } from "./localized-content.js";
import { groups, indexColors, filterColors } from "./catalog.js";
import { studioPage, bindStudio } from "./studio.js";
import { infoPage } from "./info-pages.js";
import { installApp, registerApp } from "./pwa.js";
import { collections } from "./collections.js";
import { discoveryPage, bindDiscovery, collectionPage } from "./discovery.js";
import { generatorPage, bindGenerator } from "./generator.js";
import { articlePage, resourcesPage } from "./resources.js";
import { pageMetadata, localizedPath, siteUrl } from "./seo.js";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let stored = {};
try {
  stored = JSON.parse(localStorage.getItem("copyhex-v1") || "{}") || {};
} catch {}
let lang = resolveLocale({
  path: location.pathname,
  stored: stored.lang,
  browser: navigator.language,
});
let favorites = Array.isArray(stored.favorites)
    ? [
        ...new Set(
          stored.favorites.filter(validHex).map((v) => v.toUpperCase()),
        ),
      ]
    : [],
  palettes = Array.isArray(stored.palettes)
    ? stored.palettes.filter(validPalette).map((p) => ({
        ...p,
        colors: [...new Set(p.colors.map((h) => h.toUpperCase()))],
        versions: cleanVersions(p.versions),
      }))
    : [];
const routes = [
  "brand",
  "gradient",
  "project",
  "explore",
  "discover",
  "generator",
  "collection",
  "article",
  "resources",
  "studio",
  "favorites",
  "palettes",
  "about",
  "guide",
];
const routeKey = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  if (parts[0] === "theme-builder") return "brand";
  if (parts[0] === "gradient-studio") return "gradient";
  return parts[0] === "palette-generator"
    ? "generator"
    : parts[0] === "collections"
      ? "collection"
      : parts[0] === "learn"
        ? "article"
        : parts[0] || "explore";
};
const collectionId = () => location.pathname.split("/").filter(Boolean).at(-1);
const routeHref = (v) =>
  localizedPath(
    v,
    lang,
    ["collection", "article"].includes(v) ? collectionId() : "",
  );
const getView = () =>
  routes.includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : routes.includes(routeKey(location.pathname))
      ? routeKey(location.pathname)
      : "explore";
let view = getView(),
  query = "",
  category = "all",
  sort = "curated",
  copyFormat = "HEX",
  selected =
    parseColor(new URLSearchParams(location.search).get("color") || "") ||
    (validHex(stored.selected) ? stored.selected : "#8B7CF8");
let theme = ["light", "dark", "system"].includes(stored.theme)
    ? stored.theme
    : "system",
  recent = Array.isArray(stored.recent)
    ? stored.recent.filter(validHex).slice(0, 12)
    : [];
let brightness = "any",
  saturation = "any",
  source = "any",
  page = 1,
  pageSize = 48;
let pendingUpdate = null;
let cleanupView = null;
const indexed = indexColors(colors),
  byHex = new Map(colors.map((c) => [c.hex, c]));
const t = (k) => messages[lang][k] || k;
function validHex(v) {
  return typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
}
function validPalette(p) {
  return (
    p &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    p.name.length <= 100 &&
    typeof p.note === "string" &&
    p.note.length <= 1000 &&
    Array.isArray(p.colors) &&
    p.colors.every(validHex)
  );
}
function persist() {
  try {
    localStorage.setItem(
      "copyhex-v1",
      JSON.stringify({ lang, favorites, palettes, theme, selected, recent }),
    );
  } catch {
    toast(t("storageError"));
  }
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 3000);
}
async function copy(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast(t("copied") + " · " + value);
  } catch {
    toast(t("failed"));
  }
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function colorName(hex) {
  return byHex.get(hex)?.name || t("custom");
}
function card(c, paletteId = "") {
  return `<article class="color-card"><button class="swatch" style="--swatch:${c.hex}" data-detail="${c.hex}" aria-label="${t("detail")}: ${esc(c.name)}"><span>${t("detail")} ↗</span></button><div class="card-info"><div><strong>${esc(c.name.replace(/([a-z])([A-Z])/g, "$1 $2"))}</strong><button class="heart ${favorites.includes(c.hex) ? "active" : ""}" data-fav="${c.hex}" aria-label="${t("favorite")}" aria-pressed="${favorites.includes(c.hex)}">${favorites.includes(c.hex) ? "♥" : "♡"}</button></div><button class="code" data-copy="${c.hex}">${format(c.hex, copyFormat)} <span>⧉</span></button><div class="card-bottom"><span>${groups[c.cat] ? t(groups[c.cat]) : t("custom")}</span><button data-save="${c.hex}" aria-label="${t("save")}">＋ ${t("save")}</button>${paletteId ? `<button data-remove="${c.hex}" data-palette="${esc(paletteId)}" aria-label="${t("deleteColor")}">×</button>` : ""}</div></div></article>`;
}
function render() {
  cleanupView?.();
  cleanupView = null;
  applyTheme();
  updateMetadata();
  document.documentElement.lang = lang;
  document.documentElement.dir = locales.find((l) => l.code === lang).dir;
  $("#app").innerHTML =
    `<a class="skip-link" href="#main-content">${t("skipContent")}</a><header><a href="${routeHref("explore")}" class="brand"><img src="/assets/logo.svg" alt="" width="38" height="38">CopyHex</a>${navigation(t, lang, view)}<div class="header-tools"><a class="favorites-link" href="${routeHref("favorites")}" aria-label="${t("favorites")}" title="${t("favorites")}">♡ <small>${favorites.length}</small></a><a href="${routeHref("guide")}" class="help-link">${t("help")}</a><button id="install-app" class="install-action" aria-label="${t("install")}" title="${t("install")}">${icon("install")}</button><select id="theme" aria-label="${t("theme")}">${["system", "light", "dark"].map((v) => `<option value="${v}" ${theme === v ? "selected" : ""}>${v === "system" ? "◐ " + t("system") : v === "dark" ? "☾ " + t("darkTheme") : "☀ " + t("lightTheme")}</option>`).join("")}</select><label class="language">${icon("globe")}<select id="language" aria-label="${t("language")}">${locales.map((l) => `<option value="${l.code}" ${lang === l.code ? "selected" : ""}>${l.name}</option>`).join("")}</select></label></div></header><div id="connection" class="connection" ${navigator.onLine ? "hidden" : ""}>${t("offline")}</div><div id="update-banner" class="update-banner" hidden></div><main id="main-content">${view === "brand" ? brandPage(t) : view === "gradient" ? gradientPage(t) : view === "project" ? projectPage(t, lang, location.hash) : view === "resources" ? resourcesPage(t, lang) : view === "article" ? articlePage(collectionId(), t, lang) : view === "discover" ? discoveryPage(t, lang) : view === "generator" ? generatorPage(t) : view === "collection" ? collectionPage(collectionId(), t, lang) : view === "explore" ? explore() : view === "favorites" ? favoritePage() : view === "palettes" ? palettePage() : view === "studio" ? studioPage(t, selected) : infoPage(view, lang, colors.length)}</main><footer><div><a class="brand" href="${routeHref("explore")}"><img src="/assets/logo.svg" alt="" width="26" height="26">CopyHex</a><small>${t("privacy")}</small></div><div class="footer-links"><a href="${routeHref("resources")}">${t("resources")}</a><a href="${routeHref("discover")}">${t("discover")}</a><a href="${routeHref("generator")}">${t("generator")}</a><a href="${routeHref("studio")}">${t("studio")}</a><a href="${routeHref("guide")}">${t("guide")}</a><a href="${routeHref("about")}">${t("about")}</a><a href="mailto:copyhex@haking.tr">${t("contact")} ↗</a></div></footer>`;
  bind();
  showUpdateBanner();
}
function updateMetadata() {
  const meta = pageMetadata(view, lang, collectionId());
  document.title = meta.title;
  const set = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.content = value;
  };
  set('meta[name="description"]', meta.description);
  set('meta[property="og:description"]', meta.description);
  set('meta[property="og:title"]', meta.title);
  set('meta[property="og:url"]', siteUrl + meta.path);
  set(
    'meta[property="og:image"]',
    siteUrl +
      (meta.image.endsWith(".svg")
        ? "/assets/copyhex-palette-discovery.png"
        : meta.image),
  );
  set('meta[property="og:image:alt"]', meta.imageAlt);
  set('meta[name="twitter:title"]', meta.title);
  set('meta[name="twitter:description"]', meta.description);
  set(
    'meta[name="twitter:image"]',
    siteUrl +
      (meta.image.endsWith(".svg")
        ? "/assets/copyhex-palette-discovery.png"
        : meta.image),
  );
  set('meta[name="robots"]', meta.noindex ? "noindex,follow" : "index,follow");
  document.querySelector('link[rel="canonical"]').href = siteUrl + meta.path;
  const xDefault = document.querySelector('link[hreflang="x-default"]');
  if (xDefault)
    xDefault.href =
      view === "explore"
        ? siteUrl + "/"
        : siteUrl +
          localizedPath(
            view,
            "en",
            ["collection", "article"].includes(view) ? collectionId() : "",
          );
  for (const locale of localeCodes) {
    const el = document.querySelector(`link[hreflang="${locale}"]`);
    if (el)
      el.href =
        siteUrl +
        localizedPath(
          view,
          locale,
          ["collection", "article"].includes(view) ? collectionId() : "",
        );
  }
}
function applyTheme() {
  const resolved =
    theme === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]').content =
    resolved === "dark" ? "#151722" : "#f8f9fc";
}
function navigate(v) {
  history.pushState({}, "", routeHref(v));
  view = v;
  render();
  window.scrollTo(0, 0);
}
function remember(hex, save = true) {
  selected = hex;
  if (save) {
    recent = [hex, ...recent.filter((h) => h !== hex)].slice(0, 12);
    persist();
  }
}
function controls() {
  return `<div class="controls"><label>${t("format")} <select id="format">${["HEX", "RGB", "HSL", "OKLCH", "CMYK"].map((v) => `<option ${copyFormat === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><label>${t("sort")} <select id="sort">${["curated", "name", "hue", "light", "dark", ...(view === "explore" ? ["nearest"] : [])].map((v) => `<option value="${v}" ${sort === v ? "selected" : ""}>${t(v)}</option>`).join("")}</select></label></div>`;
}
function explore() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><i></i> ${t("eyebrow")}</p><h1>${t("title")}</h1><p class="intro">${t("intro")}</p><p class="hero-stats">${t("homeStats")}</p><a class="button-link primary hero-cta" href="${routeHref("studio")}">${t("studioCTA")} ↗</a></div><div class="hero-art" aria-hidden="true"><div style="background:#b6c9b0">01<br><b>#B6C9B0</b></div><div style="background:#d8c7f0">02<br><b>#D8C7F0</b></div><div style="background:#f1ad92">03<br><b>#F1AD92</b></div><div style="background:#f0df95">04<br><b>#F0DF95</b></div><span>CopyHex</span></div></section><section class="home-directions"><a href="${routeHref("discover")}"><b>${t("discover")} ↗</b><span>${t("allPalettes")}</span><div>${collections[0].colors.map((h) => `<i style="background:${h}"></i>`).join("")}</div></a><a href="${routeHref("generator")}"><b>${t("generator")} ↗</b><span>${t("lockedHint")}</span><div>${collections[1].colors.map((h) => `<i style="background:${h}"></i>`).join("")}</div></a></section><section class="search-area"><label class="search"><span>⌕</span><input id="search" type="search" value="${esc(query)}" placeholder="${t("search")}" aria-label="${t("search")}"><kbd>/</kbd></label><button class="studio-button" id="studio">◉ ${t("studio")}</button></section><p class="search-tip">${t("tip")}</p><div class="filters">${["all", "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "neutral"].map((g) => `<button data-category="${g}" class="${category === g ? "selected" : ""}">${g === "all" ? "" : `<i class="dot ${g}"></i>`}${t(g)}</button>`).join("")}</div>${advancedFilters()}<section class="library"><div class="section-head"><div><h2>${t("library")} <span id="count"></span></h2><p>${t("librarySub")}</p></div>${controls()}</div><div class="grid" id="grid"></div><div id="pagination" class="pagination" aria-label="${t("page")}"></div></section><section class="studio-banner"><span class="banner-icon">✳</span><div><h2>${t("pick")}</h2><p>${t("pickSub")}</p></div><button id="studio-bottom">${t("open")} ↗</button></section>`;
}
function advancedFilters() {
  return `<div class="advanced-filters"><div><b>${t("filterSummary")}</b><small>${t("resultsHint")}</small></div>${[
    [
      "brightness",
      ["any", "lightColors", "midColors", "darkColors"],
      brightness,
    ],
    ["saturation", ["any", "pastel", "vivid", "muted"], saturation],
    ["source", ["any", "css"], source],
  ]
    .map(
      ([key, options, value]) =>
        `<label>${t(key)}<select id="filter-${key}">${options.map((o) => `<option value="${o}" ${o === value ? "selected" : ""}>${t(o)}</option>`).join("")}</select></label>`,
    )
    .join("")}<button id="reset">${t("resetAll")}</button></div>`;
}
function matching() {
  let list = filterColors(indexed, {
    query,
    category,
    brightness,
    saturation,
    source,
    sort,
  });
  const parsed = parseColor(query);
  if (parsed && !list.some((c) => c.hex === parsed))
    list.unshift({
      hex: parsed,
      name: colorName(parsed),
      cat: byHex.get(parsed)?.cat || "",
    });
  return list;
}
function updateGrid() {
  const list = matching(),
    pages = Math.max(1, Math.ceil(list.length / pageSize));
  page = Math.min(page, pages);
  const start = (page - 1) * pageSize;
  $("#count").textContent =
    list.length.toLocaleString(lang) + " " + t("results");
  $("#grid").innerHTML = list.length
    ? list
        .slice(start, start + pageSize)
        .map((c) => card(c))
        .join("")
    : empty(t("empty"), t("emptySub"));
  $("#pagination").innerHTML =
    `<span>${t("showing")} ${list.length ? start + 1 : 0}–${Math.min(start + pageSize, list.length)} / ${list.length.toLocaleString(lang)}</span><div><button data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>← ${t("previous")}</button><span>${t("page")} ${page} / ${pages}</span><button data-page="${page + 1}" ${page === pages ? "disabled" : ""}>${t("next")} →</button></div><label>${t("perPage")} <select id="page-size">${[24, 48, 96].map((v) => `<option ${v === pageSize ? "selected" : ""}>${v}</option>`).join("")}</select></label>`;
  $("#page-size").onchange = (e) => {
    pageSize = +e.target.value;
    page = 1;
    updateGrid();
  };
}
function empty(title, sub, extra = "") {
  return `<div class="empty"><span>◇</span><h2>${title}</h2><p>${sub}</p>${extra}</div>`;
}
function sortedFavorites() {
  const list = [...favorites];
  if (sort === "name")
    list.sort((a, b) => colorName(a).localeCompare(colorName(b)));
  if (sort === "hue") list.sort((a, b) => hsl(a)[0] - hsl(b)[0]);
  if (sort === "light" || sort === "dark")
    list.sort(
      (a, b) => (luminance(b) - luminance(a)) * (sort === "dark" ? -1 : 1),
    );
  return list;
}
function favoritePage() {
  return `<section class="page-head"><p class="eyebrow">${t("favorites")}</p><h1>${t("favTitle")}</h1><p>${t("favIntro")}</p></section><div class="section-head"><p>${favorites.length} ${t("results")}</p>${controls()}</div><div class="grid">${
    favorites.length
      ? sortedFavorites()
          .map((hex) => card({ hex, name: colorName(hex), cat: "" }))
          .join("")
      : empty(t("noFav"), t("noFavSub"))
  }</div>`;
}
function palettePage() {
  return `<section class="page-head"><p class="eyebrow">${t("palettes")}</p><h1>${t("paletteTitle")}</h1><p>${t("paletteIntro")}</p></section><div class="palette-toolbar"><button class="primary" id="new-palette">＋ ${t("new")}</button><button id="backup">↓ ${t("backup")}</button><label class="file-button">↑ ${t("import")}<input id="import" type="file" accept="application/json,.json"></label></div><p class="muted">${t("local")}</p><div class="palette-list">${palettes.length ? palettes.map((p) => `<article class="palette"><div class="palette-top"><div><h2>${esc(p.name)}</h2><p>${esc(p.note)}</p><small>${p.colors.length} ${t("count")}</small></div><div class="palette-actions">${p.colors.length >= 3 && p.colors.length <= 8 ? `<a class="button-link" href="${routeHref("generator")}?edit=${encodeURIComponent(p.id)}&colors=${p.colors.map((h) => h.slice(1)).join("-")}&locked=${p.colors.map(() => 0).join("")}">${t("editPalette")}</a>` : ""}<button data-history="${esc(p.id)}">${t("history")}</button><button data-share="${esc(p.id)}" ${p.colors.length ? "" : "disabled"}>${t("share")}</button><button data-edit="${esc(p.id)}">${t("rename")}</button><button data-export="${esc(p.id)}">${t("export")}</button><button data-delete="${esc(p.id)}" class="danger">${t("delete")}</button></div></div><div class="grid">${p.colors.length ? p.colors.map((hex) => card({ hex, name: colorName(hex), cat: "" }, p.id)).join("") : `<p class="muted">${t("emptyPalette")}</p>`}</div></article>`).join("") : empty(t("noPalettes"), t("noPalettesSub"))}</div>`;
}
function modal(html) {
  const d = $("#dialog");
  d.innerHTML = `<button class="close" aria-label="${t("close")}" id="close-dialog">×</button>${html}`;
  if (!d.open) d.showModal();
  $("#close-dialog").onclick = () => d.close();
}
function detail(hex) {
  selected = hex;
  const black = contrast(hex, "#000000"),
    white = contrast(hex, "#FFFFFF");
  modal(
    `<div class="detail-swatch" style="background:${hex};color:${black > white ? "#000" : "#fff"}">${esc(colorName(hex))}<b>${hex}</b></div><div class="dialog-content"><h2>${t("detail")}</h2><div class="values">${["HEX", "RGB", "HSL", "OKLCH", "CMYK"].map((f) => `<button data-value="${format(hex, f)}"><span>${f}</span><b>${format(hex, f)}</b> ⧉</button>`).join("")}</div><small class="muted">${t("aboutCMYK")}</small><div class="dialog-actions"><button class="primary" id="detail-save">＋ ${t("save")}</button><button id="detail-fav">${favorites.includes(hex) ? "♥" : "♡"} ${t("favorites")}</button><button id="detail-studio">${t("contrast")}</button></div></div>`,
  );
  $("#detail-save").onclick = () => saveDialog(hex);
  $("#detail-fav").onclick = () => {
    toggleFav(hex);
    detail(hex);
  };
  $("#detail-studio").onclick = () => studio(hex);
}
function toggleFav(hex) {
  favorites = favorites.includes(hex)
    ? favorites.filter((v) => v !== hex)
    : [...favorites, hex];
  persist();
  render();
}
function paletteForm(id = null, hex = null, suggested = "") {
  const p = palettes.find((p) => p.id === id);
  modal(
    `<div class="dialog-content"><h2>${t(p ? "rename" : "new")}</h2><form id="palette-form"><label>${t("paletteName")}<input name="name" maxlength="100" required value="${esc(p?.name || suggested)}" autofocus></label><label>${t("note")}<textarea name="note" maxlength="1000" rows="3">${esc(p?.note || "")}</textarea></label><button class="primary" type="submit">${t(p ? "saveChanges" : "create")}</button></form></div>`,
  );
  $("#palette-form").onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target),
      name = data.get("name").trim();
    if (!name) return;
    if (p) {
      updatePalette(p, {
        name,
        note: data.get("note").trim(),
        ...(Array.isArray(hex) ? { colors: [...hex] } : {}),
      });
    } else
      palettes.push(
        updatePalette({
          id: crypto.randomUUID(),
          name,
          note: data.get("note").trim(),
          colors: Array.isArray(hex) ? hex : hex ? [hex] : [],
        }),
      );
    persist();
    $("#dialog").close();
    render();
    toast(t("saved"));
  };
}
function saveDialog(hex) {
  modal(
    `<div class="dialog-content"><h2>${t("save")}</h2><p>${hex} · ${esc(colorName(hex))}</p><div class="palette-options">${palettes.map((p) => `<button data-add="${esc(p.id)}">${esc(p.name)} <span>${p.colors.length} →</span></button>`).join("")}</div><button id="create-and-save" class="primary">＋ ${t("new")}</button></div>`,
  );
  $("#create-and-save").onclick = () => paletteForm(null, hex);
  $("#dialog")
    .querySelectorAll("[data-add]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const p = palettes.find((p) => p.id === b.dataset.add);
          if (p.colors.includes(hex)) {
            toast(t("exists"));
            return;
          }
          updatePalette(p, { colors: [...p.colors, hex] });
          persist();
          $("#dialog").close();
          render();
          toast(t("saved"));
        }),
    );
}
function studio(hex = selected) {
  remember(hex);
  $("#dialog").close();
  navigate("studio");
}
function bind() {
  const saveColors = (colors, name) => paletteForm(null, colors, name);
  if (view === "brand")
    bindBrand({
      t,
      lang,
      copy,
      download,
      onSave: saveColors,
      onSaveColor: saveDialog,
      toast,
    });
  if (view === "gradient")
    bindGradient({ t, copy, download, onSave: saveColors, toast });
  if (view === "project") bindProject({ onSave: saveColors, copy });
  if (view === "discover") bindDiscovery(t, lang);
  if (view === "generator")
    cleanupView = bindGenerator({
      t,
      lang,
      onSave: (hexes, name) => {
        const id = new URLSearchParams(location.search).get("edit");
        paletteForm(palettes.some((p) => p.id === id) ? id : null, hexes, name);
      },
      copy,
      download,
      toast,
    });

  $("#theme").onchange = (e) => {
    theme = e.target.value;
    persist();
    applyTheme();
  };
  $("#install-app").onclick = () =>
    installApp((installed) =>
      modal(
        `<div class="dialog-content"><h2>${t("installTitle")}</h2><p>${t(installed ? "installed" : "installInfo")}</p><p class="muted">${t("installManual")}</p><a href="${routeHref("guide")}">${t("readGuide")} →</a></div>`,
      ),
    );
  if (view === "studio")
    bindStudio({
      t,
      initial: selected,
      toast,
      onColor: remember,
      onSave: saveDialog,
      onFavorite: (hex) => {
        favorites = favorites.includes(hex)
          ? favorites.filter((h) => h !== hex)
          : [...favorites, hex];
        persist();
        const count = document.querySelector(
          'nav a[href$="/favorites/"] small, .favorites-link small',
        );
        if (count) count.textContent = favorites.length;
      },
      isFavorite: (hex) => favorites.includes(hex),
      onHarmony: (hexes, kind) => paletteForm(null, hexes, t(kind)),
      copy,
      colorName,
      recent: () => recent,
    });
  $("#language").onchange = (e) => {
    lang = e.target.value;
    persist();
    history.replaceState(
      {},
      "",
      routeHref(view) + location.search + location.hash,
    );
    render();
  };
  if (view === "explore") {
    updateGrid();
    $("#search").oninput = (e) => {
      query = e.target.value;
      page = 1;
      updateGrid();
    };
    $("#studio").onclick = $("#studio-bottom").onclick = () => studio();
    for (const key of ["brightness", "saturation", "source"])
      $("#filter-" + key).onchange = (e) => {
        if (key === "brightness") brightness = e.target.value;
        if (key === "saturation") saturation = e.target.value;
        if (key === "source") source = e.target.value;
        page = 1;
        updateGrid();
      };
  }
  $("#format")?.addEventListener("change", (e) => {
    copyFormat = e.target.value;
    if (view === "explore") updateGrid();
    else render();
  });
  $("#sort")?.addEventListener("change", (e) => {
    sort = e.target.value;
    page = 1;
    if (view === "explore") updateGrid();
    else {
      render();
    }
  });
  $("#new-palette")?.addEventListener("click", () => paletteForm());
  $("#backup")?.addEventListener("click", () =>
    download(
      "copyhex-backup.json",
      JSON.stringify({ version: 1, palettes, favorites }, null, 2),
      "application/json",
    ),
  );
  $("#import")?.addEventListener("change", async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5e6) throw Error();
      const data = JSON.parse(await file.text());
      if (
        data.version !== 1 ||
        !Array.isArray(data.palettes) ||
        !data.palettes.every(validPalette) ||
        !Array.isArray(data.favorites) ||
        !data.favorites.every(validHex)
      )
        throw Error();
      palettes.push(
        ...data.palettes.map((p) => ({
          ...p,
          id: crypto.randomUUID(),
          colors: [...new Set(p.colors.map((h) => h.toUpperCase()))],
          versions: cleanVersions(p.versions),
        })),
      );
      favorites = [
        ...new Set([
          ...favorites,
          ...data.favorites.map((h) => h.toUpperCase()),
        ]),
      ];
      persist();
      render();
      toast(t("imported"));
    } catch {
      toast(t("badFile"));
    }
  });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const d = b.dataset;
  if (d.collectionSave) {
    const p = collections.find((p) => p.id === d.collectionSave);
    if (p) paletteForm(null, [...p.colors], collectionDetails(p, lang).name);
  }

  if (d.category) {
    category = d.category;
    page = 1;
    render();
  }
  if (d.page) {
    page = +d.page;
    updateGrid();
    $(".section-head").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (b.id === "reset") {
    category = "all";
    query = "";
    brightness = saturation = source = "any";
    page = 1;
    render();
  }
  if (d.copy) copy(format(d.copy, copyFormat));
  if (d.value) copy(d.value);
  if (d.detail) detail(d.detail);
  if (d.fav) toggleFav(d.fav);
  if (d.save) saveDialog(d.save);
  if (d.edit) paletteForm(d.edit);
  if (d.share) shareSavedPalette(palettes.find((p) => p.id === d.share));
  if (d.history) {
    const p = palettes.find((p) => p.id === d.history);
    updatePalette(p);
    persist();
    modal(historyMarkup(p, t));
    bindHistory({
      p,
      t,
      lang,
      onShare: (v) => shareSavedPalette(p, v),
      onRestore: (v) => {
        updatePalette(p, { name: v.name, colors: [...v.colors] });
        persist();
        $("#dialog").close();
        render();
        toast(t("saved"));
      },
    });
  }
  if (d.remove) {
    const p = palettes.find((p) => p.id === d.palette);
    updatePalette(p, { colors: p.colors.filter((h) => h !== d.remove) });
    persist();
    render();
  }
  if (d.delete && confirm(t("confirm"))) {
    palettes = palettes.filter((p) => p.id !== d.delete);
    persist();
    render();
  }
  if (d.export) {
    const p = palettes.find((p) => p.id === d.export);
    download(
      "copyhex-palette.css",
      `:root {\n${p.colors.map((hex, i) => `  --color-${i + 1}: ${hex};`).join("\n")}\n}\n`,
      "text/css",
    );
  }
});
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (
    !a ||
    e.defaultPrevented ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    a.target ||
    a.hasAttribute("download")
  )
    return;
  const url = new URL(a.href);
  if (url.origin !== location.origin || url.hash) return;
  const v = routeKey(url.pathname);
  if (routes.includes(v)) {
    e.preventDefault();
    $("#dialog").close();
    history.pushState({}, "", url.pathname + url.search);
    view = v;
    const locale = url.pathname.split("/")[1];
    if (isLocale(locale)) {
      lang = locale;
      persist();
    }
    selected = parseColor(url.searchParams.get("color") || "") || selected;
    render();
    window.scrollTo(0, 0);
  }
});
window.addEventListener("popstate", () => {
  const locale = location.pathname.split("/")[1];
  if (isLocale(locale)) {
    lang = locale;
    persist();
  }
  view = getView();
  selected =
    parseColor(new URLSearchParams(location.search).get("color") || "") ||
    selected;
  render();
});
window.addEventListener("hashchange", () => {
  view = getView();
  render();
  window.scrollTo(0, 0);
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
    !$("#dialog").open
  ) {
    e.preventDefault();
    if (view !== "explore") navigate("explore");
    $("#search")?.focus();
  }
});
$("#dialog").addEventListener("click", (e) => {
  if (e.target === $("#dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (theme === "system") applyTheme();
});
for (const event of ["online", "offline"])
  window.addEventListener(event, () => {
    if ($("#connection")) {
      $("#connection").hidden = navigator.onLine;
      $("#connection").textContent = t("offline");
    }
  });
render();
function showUpdateBanner() {
  if (!pendingUpdate) return;
  const banner = $("#update-banner");
  banner.hidden = false;
  banner.innerHTML = `${t("updateReady")} <button id="app-update">${t("updateApp")}</button>`;
  $("#app-update").onclick = pendingUpdate;
}
registerApp((update) => {
  pendingUpdate = update;
  showUpdateBanner();
});

function shareSavedPalette(p, version = null) {
  try {
    const encoded = encodePalette(sharePayload(p, version));
    copy(
      location.origin + localizedPath("project", lang) + "#palette=" + encoded,
    );
  } catch {
    toast(t("shareTooLarge"));
  }
}

document.addEventListener("click", (e) => {
  const menu = document.querySelector("#tools-navigation");
  if (menu?.open && !menu.contains(e.target)) menu.open = false;
});
document.addEventListener("keydown", (e) => {
  const menu = document.querySelector("#tools-navigation");
  if (e.key === "Escape" && menu?.open) {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
});
