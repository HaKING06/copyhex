import { collectionDetails } from "./localized-content.js";
import { collections, collectionCategories } from "./collections.js";
export function generatorUrl(colors, lang = "en") {
  return `/${lang}/palette-generator/?colors=${colors.map((h) => h.slice(1)).join("-")}&locked=${colors.map(() => 0).join("")}`;
}
export function collectionCard(p, t, lang) {
  p = collectionDetails(p, lang);
  return `<article class="collection-card"><a class="palette-image" href="/${lang}/collections/${p.id}/"><img src="/assets/palettes/${p.id}.svg" alt="${p.name}: ${p.colors.join(", ")}" width="1200" height="720" loading="lazy"></a><div class="collection-body"><div><a href="/${lang}/collections/${p.id}/"><h2>${p.name}</h2></a><span>${t(p.category === "dark" ? "darkTheme" : p.category)}</span></div><div class="mini-codes">${p.colors.map((hex) => `<button data-value="${hex}" aria-label="${t("copy")} ${hex}">${hex}</button>`).join("")}</div><p>${p.description}</p><div class="collection-actions"><a class="button-link" href="${generatorUrl(p.colors, lang)}">${t("editPalette")} ↗</a><button class="primary" data-collection-save="${p.id}">＋ ${t("saveCollection")}</button></div></div></article>`;
}
export function discoveryPage(t, lang) {
  return `<section class="discovery-hero"><div><p class="eyebrow">${t("discoverEyebrow")}</p><h1>${t("discoverTitle")}</h1><p>${t("discoverIntro")}</p><a class="button-link primary" href="/${lang}/palette-generator/">${t("generator")} ↗</a></div><div class="palette-stack" aria-hidden="true">${collections
    .slice(0, 3)
    .map(
      (p, i) =>
        `<div class="stack-card stack-${i}">${p.colors.map((h) => `<i style="background:${h}"></i>`).join("")}<span>${collectionDetails(p, lang).name}</span></div>`,
    )
    .join(
      "",
    )}</div></section><div class="discover-search"><label class="search"><span>⌕</span><input id="collection-search" type="search" placeholder="${t("collectionSearch")}" aria-label="${t("collectionSearch")}"></label><span>24 · ${t("allPalettes")}</span></div><div class="filters" id="collection-filters">${collectionCategories.map((c) => `<button data-collection-category="${c}" ${c === "all" ? 'class="selected"' : ""}>${c === "all" ? t("allPalettes") : t(c === "dark" ? "darkTheme" : c)}</button>`).join("")}</div><div id="collection-grid" class="collection-grid">${collections.map((p) => collectionCard(p, t, lang)).join("")}</div><section class="support-panel"><h2>${t("generatorTitle").replace("<br>", " ")}</h2><p>${t("generatorGuideText")}</p><a class="button-link primary" href="/${lang}/palette-generator/">${t("generator")} →</a></section>`;
}
export function bindDiscovery(t, lang) {
  let category = "all",
    query = "";
  const draw = () => {
    const q = query.toLocaleLowerCase(lang);
    const list = collections.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        [
          p.name,
          collectionDetails(p,lang).name,
          collectionDetails(p,lang).description,
          p.tr,
          p.description,
          p.descriptionTr,
          ...p.colors,
          p.category,
          t(p.category === "dark" ? "darkTheme" : p.category),
        ]
          .join(" ")
          .toLocaleLowerCase(lang)
          .includes(q),
    );
    document.querySelector("#collection-grid").innerHTML = list.length
      ? list.map((p) => collectionCard(p, t, lang)).join("")
      : `<div class="empty"><h2>${t("emptyCollections")}</h2></div>`;
  };
  document.querySelector("#collection-search").oninput = (e) => {
    query = e.target.value;
    draw();
  };
  document.querySelector("#collection-filters").onclick = (e) => {
    const b = e.target.closest("[data-collection-category]");
    if (!b) return;
    category = b.dataset.collectionCategory;
    document
      .querySelectorAll("[data-collection-category]")
      .forEach((el) => el.classList.toggle("selected", el === b));
    draw();
  };
}
export function collectionPage(id, t, lang) {
  const original = collections.find((p) => p.id === id);
  const p = original ? collectionDetails(original, lang) : null;
  if (!p)
    return `<div class="empty"><h1>${t("emptyCollections")}</h1><a href="/${lang}/discover/">${t("backDiscover")}</a></div>`;
  return `<section class="page-head"><a class="breadcrumb" href="/${lang}/discover/">← ${t("backDiscover")}</a><p class="eyebrow">${t(p.category === "dark" ? "darkTheme" : p.category)} / ${t("collectionsLabel")}</p><h1>${p.name}</h1><p>${p.description}</p><div class="collection-detail-actions"><a class="button-link primary" href="${generatorUrl(p.colors, lang)}">${t("editPalette")} ↗</a><button data-collection-save="${p.id}">＋ ${t("saveCollection")}</button><a class="button-link" href="/assets/palettes/${p.id}.svg" download>${t("downloadSvg")}</a><a class="button-link" href="/assets/palettes/${p.id}.png" download>${t("downloadPng")}</a></div></section><figure class="collection-poster"><img src="/assets/palettes/${p.id}.png" width="1200" height="720" alt="${p.name} · ${t("paletteColors")} · ${p.colors.join(", ")}"><figcaption>${p.name} · ${p.colors.join(" / ")}</figcaption></figure><div class="collection-swatches">${p.colors.map((h) => `<button style="--swatch:${h}" data-value="${h}"><i></i><b>${h}</b><span>${t("copy")} ⧉</span></button>`).join("")}</div><article class="prose"><h2>${t("collectionAbout")}</h2><p>${p.description}</p><h2>${t("collectionUse")}</h2><p>${t("collectionUseText")}</p><a class="button-link primary" href="${generatorUrl(p.colors, lang)}">${t("editPalette")} →</a></article><div class="section-head"><h2>${t("relatedPalettes")}</h2></div><div class="collection-grid">${collections
    .filter((x) => x.id !== id)
    .filter((x) => x.category === p.category)
    .slice(0, 3)
    .map((x) => collectionCard(x, t, lang))
    .join("")}</div>`;
}
