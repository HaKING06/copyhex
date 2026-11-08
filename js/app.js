import { colors } from "./colors.js";
import { format, parseColor, hsl, luminance, contrast } from "./color-utils.js";
import { messages } from "./i18n.js";
import { groups, indexColors, filterColors } from "./catalog.js";
import { studioPage, bindStudio } from "./studio.js";
import { infoPage } from "./info-pages.js";
import { installApp, registerApp } from "./pwa.js";
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
let lang = ["en", "tr"].includes(stored.lang)
  ? stored.lang
  : navigator.language.toLowerCase().startsWith("tr")
    ? "tr"
    : "en";
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
      }))
    : [];
const routes = ["explore", "studio", "favorites", "palettes", "about", "guide"];
const routeHref = (v) => (v === "explore" ? "/" : `/${v}/`);
const getView = () => {
  const legacy = location.hash.slice(1),
    path = location.pathname.split("/").filter(Boolean)[0] || "explore";
  return routes.includes(legacy)
    ? legacy
    : routes.includes(path)
      ? path
      : "explore";
};
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
  applyTheme();
  updateMetadata();
  document.documentElement.lang = lang;
  document.title =
    "CopyHex — " +
    t(view === "explore" ? "explore" : view) +
    " | HEX, RGB & Color Palettes";
  document.querySelector('link[rel="canonical"]').href =
    "https://copyhex.haking.tr" + routeHref(view);
  $("#app").innerHTML =
    `<a class="skip-link" href="#main-content">${lang === "tr" ? "İçeriğe geç" : "Skip to content"}</a><header><a href="/" class="brand"><img src="/assets/logo.svg" alt="" width="38" height="38">copyhex <span class="version-chip">1.0.1</span></a><nav aria-label="${lang === "tr" ? "Ana menü" : "Main navigation"}">${["explore", "studio", "favorites", "palettes"].map((v) => `<a class="${view === v ? "current" : ""}" href="${routeHref(v)}" ${view === v ? 'aria-current="page"' : ""}>${t(v)}${v === "favorites" ? ` <small>${favorites.length}</small>` : ""}</a>`).join("")}</nav><div class="header-tools"><a href="/guide/" class="help-link">${t("help")}</a><button id="install-app" class="icon-button" aria-label="${t("install")}" title="${t("install")}">↓</button><select id="theme" aria-label="${t("theme")}">${["system", "light", "dark"].map((v) => `<option value="${v}" ${theme === v ? "selected" : ""}>${v === "system" ? "◐ " + t("system") : v === "dark" ? "☾ " + t("darkTheme") : "☀ " + t("lightTheme")}</option>`).join("")}</select><label class="language"><select id="language" aria-label="Language / Dil"><option value="en" ${lang === "en" ? "selected" : ""}>EN</option><option value="tr" ${lang === "tr" ? "selected" : ""}>TR</option></select></label></div></header><div id="connection" class="connection" ${navigator.onLine ? "hidden" : ""}>${t("offline")}</div><div id="update-banner" class="update-banner" hidden></div><main id="main-content">${view === "explore" ? explore() : view === "favorites" ? favoritePage() : view === "palettes" ? palettePage() : view === "studio" ? studioPage(t, selected) : infoPage(view, lang, colors.length)}</main><footer><div><a class="brand" href="/"><img src="/assets/logo.svg" alt="" width="26" height="26">copyhex</a><p>${t("made")}</p><small>${t("privacy")} · v1.0.1</small></div><div class="footer-links"><a href="/studio/">${t("studio")}</a><a href="/guide/">${t("guide")}</a><a href="/about/">${t("about")}</a><a href="mailto:copyhex@haking.tr">${t("contact")} ↗</a></div></footer>`;
  bind();
  showUpdateBanner();
}
function updateMetadata() {
  const desc =
    lang === "tr"
      ? "CopyHex ile 6.000 özgün rengi keşfet, HEX, RGB ve HSL renk kodlarını kopyala. Renk seçici, proje paletleri ve kontrast kontrolü."
      : "Explore 6,000 unique colors with CopyHex. Copy HEX, RGB and HSL color codes, create project palettes and check contrast.";
  document.querySelector('meta[name="description"]').content = desc;
  for (const key of ["og:description"])
    document.querySelector(`meta[property="${key}"]`).content = desc;
  document.querySelector('meta[property="og:url"]').content =
    "https://copyhex.haking.tr" + routeHref(view);
  document.querySelector('meta[name="robots"]').content = [
    "favorites",
    "palettes",
  ].includes(view)
    ? "noindex,follow"
    : "index,follow";
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
  return `<div class="controls"><label>${t("format")} <select id="format">${["HEX", "RGB", "HSL", "CMYK"].map((v) => `<option ${copyFormat === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><label>${t("sort")} <select id="sort">${["curated", "name", "hue", "light", "dark", ...(view === "explore" ? ["nearest"] : [])].map((v) => `<option value="${v}" ${sort === v ? "selected" : ""}>${t(v)}</option>`).join("")}</select></label></div>`;
}
function explore() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><i></i> ${t("eyebrow")}</p><h1>${t("title")}</h1><p class="intro">${t("intro")}</p><p class="hero-stats">${t("homeStats")}</p><a class="button-link primary hero-cta" href="/studio/">${t("studioCTA")} ↗</a></div><div class="hero-art" aria-hidden="true"><div style="background:#b6c9b0">01<br><b>Sage</b></div><div style="background:#d8c7f0">02<br><b>Lilac</b></div><div style="background:#f1ad92">03<br><b>Peach</b></div><div style="background:#f0df95">04<br><b>Butter</b></div><span>THE POSSIBILITIES ARE ENDLESS ↗</span></div></section><section class="search-area"><label class="search"><span>⌕</span><input id="search" type="search" value="${esc(query)}" placeholder="${t("search")}" aria-label="${t("search")}"><kbd>/</kbd></label><button class="studio-button" id="studio">◉ ${t("studio")}</button></section><p class="search-tip">${t("tip")}</p><div class="filters">${["all", "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "neutral"].map((g) => `<button data-category="${g}" class="${category === g ? "selected" : ""}">${g === "all" ? "" : `<i class="dot ${g}"></i>`}${t(g)}</button>`).join("")}</div>${advancedFilters()}<section class="library"><div class="section-head"><div><h2>${t("library")} <span id="count"></span></h2><p>${t("librarySub")}</p></div>${controls()}</div><div class="grid" id="grid"></div><div id="pagination" class="pagination" aria-label="Pagination"></div></section><section class="studio-banner"><span class="banner-icon">✳</span><div><h2>${t("pick")}</h2><p>${t("pickSub")}</p></div><button id="studio-bottom">${t("open")} ↗</button></section>`;
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
  return `<section class="page-head"><p class="eyebrow">${t("palettes")}</p><h1>${t("paletteTitle")}</h1><p>${t("paletteIntro")}</p></section><div class="palette-toolbar"><button class="primary" id="new-palette">＋ ${t("new")}</button><button id="backup">↓ ${t("backup")}</button><label class="file-button">↑ ${t("import")}<input id="import" type="file" accept="application/json,.json"></label></div><p class="muted">${t("local")}</p><div class="palette-list">${palettes.length ? palettes.map((p) => `<article class="palette"><div class="palette-top"><div><h2>${esc(p.name)}</h2><p>${esc(p.note)}</p><small>${p.colors.length} ${t("count")}</small></div><div class="palette-actions"><button data-edit="${esc(p.id)}">${t("rename")}</button><button data-export="${esc(p.id)}">${t("export")}</button><button data-delete="${esc(p.id)}" class="danger">${t("delete")}</button></div></div><div class="grid">${p.colors.length ? p.colors.map((hex) => card({ hex, name: colorName(hex), cat: "" }, p.id)).join("") : `<p class="muted">${t("emptyPalette")}</p>`}</div></article>`).join("") : empty(t("noPalettes"), t("noPalettesSub"))}</div>`;
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
    `<div class="detail-swatch" style="background:${hex};color:${black > white ? "#000" : "#fff"}">${esc(colorName(hex))}<b>${hex}</b></div><div class="dialog-content"><h2>${t("detail")}</h2><div class="values">${["HEX", "RGB", "HSL", "CMYK"].map((f) => `<button data-value="${format(hex, f)}"><span>${f}</span><b>${format(hex, f)}</b> ⧉</button>`).join("")}</div><small class="muted">${t("aboutCMYK")}</small><div class="dialog-actions"><button class="primary" id="detail-save">＋ ${t("save")}</button><button id="detail-fav">${favorites.includes(hex) ? "♥" : "♡"} ${t("favorites")}</button><button id="detail-studio">${t("contrast")}</button></div></div>`,
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
    `<div class="dialog-content"><h2>${t(p ? "rename" : "new")}</h2><form id="palette-form"><label>${t("paletteName")}<input name="name" maxlength="100" required value="${esc(p?.name || suggested)}" autofocus></label><label>${t("note")}<textarea name="note" maxlength="1000" rows="3">${esc(p?.note || "")}</textarea></label><button class="primary" type="submit">${t(p ? "saved" : "create")}</button></form></div>`,
  );
  $("#palette-form").onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target),
      name = data.get("name").trim();
    if (!name) return;
    if (p) {
      p.name = name;
      p.note = data.get("note").trim();
    } else
      palettes.push({
        id: crypto.randomUUID(),
        name,
        note: data.get("note").trim(),
        colors: Array.isArray(hex) ? hex : hex ? [hex] : [],
      });
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
          p.colors.push(hex);
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
  $("#theme").onchange = (e) => {
    theme = e.target.value;
    persist();
    applyTheme();
  };
  $("#install-app").onclick = () =>
    installApp((installed) =>
      modal(
        `<div class="dialog-content"><h2>${t("installTitle")}</h2><p>${t(installed ? "installed" : "installInfo")}</p><p class="muted">${t("installManual")}</p><a href="/guide/">${t("readGuide")} →</a></div>`,
      ),
    );
  if (view === "studio")
    bindStudio({
      t,
      initial: selected,
      onColor: remember,
      onSave: saveDialog,
      onFavorite: (hex) => {
        favorites = favorites.includes(hex)
          ? favorites.filter((h) => h !== hex)
          : [...favorites, hex];
        persist();
        const count = document.querySelector('nav a[href="/favorites/"] small');
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
  if (d.remove) {
    const p = palettes.find((p) => p.id === d.palette);
    p.colors = p.colors.filter((h) => h !== d.remove);
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
  const v = url.pathname.split("/").filter(Boolean)[0] || "explore";
  if (routes.includes(v)) {
    e.preventDefault();
    $("#dialog").close();
    history.pushState({}, "", url.pathname + url.search);
    view = v;
    selected = parseColor(url.searchParams.get("color") || "") || selected;
    render();
    window.scrollTo(0, 0);
  }
});
window.addEventListener("popstate", () => {
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
