import { parseColor, format } from "./color-utils.js";
import {
  themeFromSeed,
  themeCss,
  themeTokens,
  roleKeys,
} from "./theme-engine.js";
import { shadeSteps, visionModes, formatOklch } from "./color-spaces.js";
import { designPreview, previewKinds } from "./design-preview.js";
import { bindEyedropper } from "./eyedropper.js";
import { escapeHtml } from "./ui-utils.js";
export function brandPage(t) {
  return `<section class="tool-hero"><p class="eyebrow">CopyHex / OKLCH</p><h1>${t("brandBuilder")}</h1><p>${t("brandIntro")}</p></section><div class="brand-controls panel"><form id="brand-form"><label>${t("seed")}<div class="seed-pair"><input type="color" id="brand-seed" value="#8B7CF8" aria-label="${t("seed")}"><input id="brand-code" value="#8B7CF8" spellcheck="false" aria-label="HEX / RGB / HSL / OKLCH"></div></label><button class="primary">${t("apply")}</button></form><button id="brand-eyedropper">◉ ${t("eyedropper")}</button><label>${t("previewScenario")}<select id="brand-kind">${previewKinds.map((k) => `<option value="${k}">${t(k)}</option>`).join("")}</select></label><label>${t("vision")}<select id="brand-vision">${visionModes.map((k) => `<option value="${k}">${t(k === "normal" ? "normalVision" : k)}</option>`).join("")}</select></label></div><div id="brand-results"></div><p class="muted tool-note">${t("gamutNote")} ${t("visionNote")}</p>`;
}
export function bindBrand({
  t,
  lang,
  copy,
  download,
  onSave,
  onSaveColor,
  toast,
}) {
  const $ = (s) => document.querySelector(s);
  let draft = {};
  try {
    draft = JSON.parse(localStorage.getItem("copyhex-brand-v1") || "{}");
  } catch {}
  let seed =
      parseColor(new URLSearchParams(location.search).get("color") || "") ||
      parseColor(String(draft?.seed || "")) ||
      "#8B7CF8",
    kind = previewKinds.includes(draft?.kind) ? draft.kind : "dashboard",
    vision = visionModes.includes(draft?.vision) ? draft.vision : "normal",
    space = ["HEX", "OKLCH"].includes(draft?.space) ? draft.space : "HEX",
    theme;
  function remember() {
    try {
      localStorage.setItem(
        "copyhex-brand-v1",
        JSON.stringify({ seed, kind, vision, space }),
      );
    } catch {}
    history.replaceState({}, "", location.pathname + "?color=" + seed.slice(1));
  }
  function draw() {
    theme = themeFromSeed(seed);
    $("#brand-code").value = seed;
    $("#brand-seed").value = seed;
    $("#brand-kind").value = kind;
    $("#brand-vision").value = vision;
    const labels = {
      background: "background",
      surface: "surface",
      surfaceRaised: "surfaceRaised",
      textPrimary: "textPrimary",
      textMuted: "textMuted",
      primary: "primaryColor",
      onPrimary: "foreground",
      border: "border",
      success: "success",
      warning: "warning",
      danger: "danger",
      info: "info",
    };
    $("#brand-results").innerHTML =
      `<div class="section-head"><div><h2>${t("themePair")}</h2><p>${t("previewUI")}</p></div><div class="theme-actions"><button id="brand-save">＋ ${t("savePalette")}</button><button id="brand-share">↗ ${t("share")}</button></div></div><div class="theme-pair">${["light", "dark"].map((mode) => `<section class="theme-preview"><div class="preview-mode-label"><span>${t(mode === "light" ? "lightTheme" : "darkTheme")}</span><small>${t(kind)}</small></div>${designPreview(theme[mode], { kind, vision, t })}</section>`).join("")}</div><section class="panel scale-panel"><div class="section-head"><div><h2>${t("shadeScale")}</h2><p>${seed} · OKLCH</p></div><label>${t("format")}<select id="brand-space"><option ${space === "HEX" ? "selected" : ""}>HEX</option><option ${space === "OKLCH" ? "selected" : ""}>OKLCH</option></select></label></div><div class="tone-scale">${shadeSteps.map((step) => `<button data-value="${format(theme.brand[step], space)}"><i style="background:${theme.brand[step]}"></i><b>${step}</b><code>${theme.brand[step]}</code></button>`).join("")}</div></section><section class="panel"><h2>${t("semanticRoles")}</h2><div class="role-pair">${["light", "dark"].map((mode) => `<div><h3>${t(mode === "light" ? "lightTheme" : "darkTheme")}</h3><div class="role-list">${roleKeys.map((key) => `<div><button data-value="${format(theme[mode][key], space)}" aria-label="${t("copy")} ${t(labels[key])}"><i style="background:${theme[mode][key]}"></i><span>${t(labels[key])}<small>${key}</small></span><code>${theme[mode][key]}</code></button><button data-brand-color="${theme[mode][key]}" aria-label="${t("save")}">＋</button></div>`).join("")}</div></div>`).join("")}</div></section><section class="panel token-panel"><div class="section-head"><h2>${t("tokens")}</h2><div><button id="brand-copy-css">⧉ ${t("copy")} CSS</button><button id="brand-export-css">↓ CSS</button><button id="brand-export-json">↓ DTCG JSON</button></div></div><textarea id="brand-token-output" readonly rows="12" spellcheck="false" aria-label="${t("tokens")}">${escapeHtml(themeCss(theme, space))}</textarea></section>`;
    $("#brand-space").onchange = (e) => {
      space = e.target.value;
      remember();
      draw();
    };
    $("#brand-save").onclick = () =>
      onSave(
        [
          ...new Set([
            seed,
            theme.light.background,
            theme.light.textPrimary,
            theme.dark.background,
            theme.dark.textPrimary,
          ]),
        ],
        t("brandBuilder"),
      );
    $("#brand-share").onclick = () => {
      remember();
      copy(location.href);
    };
    $("#brand-copy-css").onclick = () => copy(themeCss(theme, space));
    $("#brand-export-css").onclick = () =>
      download("copyhex-theme.css", themeCss(theme, space), "text/css");
    $("#brand-export-json").onclick = () =>
      download(
        "copyhex.tokens.json",
        JSON.stringify(themeTokens(theme), null, 2),
        "application/json",
      );
    $("#brand-results")
      .querySelectorAll("[data-brand-color]")
      .forEach((b) => (b.onclick = () => onSaveColor(b.dataset.brandColor)));
  }
  function update(hex) {
    seed = hex;
    remember();
    draw();
  }
  $("#brand-form").onsubmit = (e) => {
    e.preventDefault();
    const hex = parseColor($("#brand-code").value);
    if (hex) update(hex);
    else toast(t("invalid"));
  };
  $("#brand-seed").oninput = (e) => update(e.target.value.toUpperCase());
  $("#brand-kind").onchange = (e) => {
    kind = e.target.value;
    remember();
    draw();
  };
  $("#brand-vision").onchange = (e) => {
    vision = e.target.value;
    remember();
    draw();
  };
  bindEyedropper($("#brand-eyedropper"), { onPick: update, t, toast });
  draw();
}
