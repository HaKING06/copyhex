import {
  decodePalette,
  cleanVersions,
  paletteDifference,
} from "./palette-versions.js";
import { escapeHtml as esc } from "./ui-utils.js";
export function projectPage(t, lang, hash = "") {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get("palette"),
    p = encoded ? decodePalette(encoded) : null;
  const link = `/${lang}/palette-generator/?colors=${p?.colors.map((h) => h.slice(1)).join("-") || ""}`;
  return `<section class="tool-hero"><p class="eyebrow">CopyHex</p><h1>${t("sharedPalette")}</h1><p>${t("sharedIntro")}</p></section>${p ? `<section class="panel shared-project"><div class="section-head"><div><h2>${esc(p.name)}</h2><p>${t("version")} ${p.version} · ${new Date(p.date).toLocaleDateString(lang)}</p></div><button id="shared-save" class="primary">＋ ${t("saveCollection")}</button></div><div class="shared-swatches">${p.colors.map((h) => `<button data-value="${h}" style="--swatch:${h}"><i></i><code>${h}</code></button>`).join("")}</div><div class="dialog-actions">${p.colors.length >= 3 && p.colors.length <= 8 ? `<a class="button-link" href="${link}">${t("editPalette")} ↗</a>` : ""}<button id="shared-copy">${t("copyAll")}</button></div></section>` : `<div class="empty"><h2>${t(encoded ? "invalidShare" : "shareVersion")}</h2><p>${t("historyNote")}</p><a class="button-link primary" href="/${lang}/discover/">${t("discover")} →</a></div>`}<p class="muted">${t("historyNote")}</p>`;
}
export function bindProject({ onSave, copy }) {
  const p = decodePalette(
    new URLSearchParams(location.hash.slice(1)).get("palette"),
  );
  if (!p) return;
  document.querySelector("#shared-save").onclick = () =>
    onSave(p.colors, p.name);
  document.querySelector("#shared-copy").onclick = () =>
    copy(p.colors.join(", "));
}
export function historyMarkup(p, t) {
  const versions = cleanVersions(p.versions);
  return `<div class="dialog-content"><h2>${t("history")} · ${esc(p.name)}</h2><p class="muted">${t("historyNote")}</p><div id="history-content"></div></div>`;
}
export function bindHistory({ p, t, lang, onRestore, onShare }) {
  const versions = cleanVersions(p.versions);
  let a = Math.max(0, versions.length - 2),
    b = versions.length - 1;
  function draw() {
    const left = versions[a],
      right = versions[b];
    if (!left || !right) return;
    const diff = paletteDifference(left.colors, right.colors);
    document.querySelector("#history-content").innerHTML =
      `<div class="history-choices">${[
        ["before", a, "original"],
        ["after", b, "modified"],
      ]
        .map(
          ([key, value, label]) =>
            `<label>${t(label)}<select id="history-${key}">${versions.map((v, i) => `<option value="${i}" ${i === value ? "selected" : ""}>${t("version")} ${v.number} · ${new Date(v.date).toLocaleString(lang)}</option>`).join("")}</select></label>`,
        )
        .join(
          "",
        )}</div><p class="muted">${t("changedColors")}: ${diff.filter((d) => d.changed).length}</p><div class="history-diff">${diff.map((d) => `<div class="${d.changed ? "changed" : ""}"><span>${d.index + 1}</span><code><i style="background:${d.before || "transparent"}"></i>${d.before || "—"}</code><span>→</span><code><i style="background:${d.after || "transparent"}"></i>${d.after || "—"}</code></div>`).join("")}</div><div class="dialog-actions"><button class="primary" id="history-restore">${t("restoreVersion")}</button><button id="history-share" ${right.colors.length ? "" : "disabled"}>↗ ${t("shareVersion")}</button></div>`;
    document.querySelector("#history-before").onchange = (e) => {
      a = +e.target.value;
      draw();
    };
    document.querySelector("#history-after").onchange = (e) => {
      b = +e.target.value;
      draw();
    };
    document.querySelector("#history-restore").onclick = () => onRestore(right);
    document.querySelector("#history-share").onclick = () => onShare(right);
  }
  draw();
}
