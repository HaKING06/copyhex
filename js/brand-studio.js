import { parseColor, format, contrast } from "./color-utils.js";
import {
  themeFromSeed,
  themeCss,
  themeTokens,
  roleKeys,
} from "./theme-engine.js";
import { shadeSteps, visionModes } from "./color-spaces.js";
import { designPreview, previewKinds } from "./design-preview.js";
import { bindEyedropper } from "./eyedropper.js";
import { escapeHtml as esc } from "./ui-utils.js";
import { icon } from "./icons.js";
const defaults = {
  seed: "#8B7CF8",
  name: "CopyHex",
  kind: "dashboard",
  vision: "normal",
  space: "HEX",
  intensity: 1,
  tint: 1,
  radius: 12,
  mode: "both",
  roleMode: "light",
  tab: "colors",
  overrides: {},
};
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
const seeds = [
  "#8B7CF8",
  "#217F73",
  "#DC6551",
  "#3478DA",
  "#B66C24",
  "#AB4C84",
];
const modes = ["both", "light", "dark"];
const modeLabel = (mode, t) =>
  t(
    mode === "both"
      ? "viewBoth"
      : mode === "light"
        ? "lightTheme"
        : "darkTheme",
  );
export function brandPage(t) {
  return `<section class="brand-heading"><div><p class="eyebrow">CopyHex / ${t("colorSystem")}</p><h1>${t("brandBuilder")}</h1><p>${t("brandIntro")}</p></div><div class="brand-heading-actions"><button id="brand-share">${t("sharePalette")}</button><button id="brand-save" class="primary">＋ ${t("savePalette")}</button></div></section><div class="brand-workbench"><aside class="brand-sidebar panel"><div class="sidebar-title"><h2>${t("workspaceSettings")}</h2><span>01</span></div><label>${t("brandName")}<input type="text" id="brand-name" maxlength="40" value="CopyHex" autocomplete="off"></label><form id="brand-form"><label for="brand-code">${t("seed")}</label><div class="brand-seed-field"><input type="color" id="brand-seed" value="#8B7CF8" aria-label="${t("seed")}"><input type="text" id="brand-code" value="#8B7CF8" spellcheck="false" aria-label="HEX / RGB / HSL / OKLCH"><button type="submit" aria-label="${t("apply")}">→</button></div><p id="brand-error" role="alert"></p></form><button id="brand-eyedropper" class="brand-pick">${icon("picker")}${t("eyedropper")}</button><div class="brand-presets"><span>${t("presets")}</span><div>${seeds.map((h) => `<button type="button" data-brand-preset="${h}" style="--preset:${h}" aria-label="${t("seed")} ${h}" title="${h}"></button>`).join("")}</div></div>${[
    ["intensity", "colorIntensity", 50, 150, 100, "%"],
    ["tint", "neutralTint", 0, 200, 100, "%"],
    ["radius", "cornerRadius", 0, 24, 12, "px"],
  ]
    .map(
      ([key, label, min, max, value, unit]) =>
        `<label class="brand-slider" for="brand-${key}"><span>${t(label)}<output id="${key}-output">${value}${unit}</output></span><input type="range" id="brand-${key}" min="${min}" max="${max}" value="${value}"></label>`,
    )
    .join(
      "",
    )}<label>${t("vision")}<select id="brand-vision">${visionModes.map((k) => `<option value="${k}">${t(k === "normal" ? "normalVision" : k)}</option>`).join("")}</select></label><button id="brand-reset" class="brand-reset">↶ ${t("resetTheme")}</button></aside><div id="brand-results" class="brand-stage"></div></div><p class="muted tool-note">${t("gamutNote")} ${t("visionNote")}</p>`;
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
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("copyhex-brand-v1") || "{}") || {};
  } catch {}
  const query = new URLSearchParams(location.search);
  let source = stored;
  if (query.has("color")) {
    source = Object.fromEntries(query);
    source.seed = query.get("color");
    try {
      source.overrides = JSON.parse(query.get("overrides") || "{}");
    } catch {
      source.overrides = {};
    }
  }
  const bounded = (v, min, max, fallback) =>
    Number.isFinite(+v) && v !== undefined
      ? Math.max(min, Math.min(max, +v))
      : fallback;
  let state = {
    ...defaults,
    seed: parseColor(String(source.seed || "")) || defaults.seed,
    name:
      typeof source.name === "string"
        ? source.name.slice(0, 40)
        : defaults.name,
    kind: previewKinds.includes(source.kind) ? source.kind : defaults.kind,
    vision: visionModes.includes(source.vision)
      ? source.vision
      : defaults.vision,
    space: ["HEX", "OKLCH"].includes(source.space) ? source.space : "HEX",
    intensity: bounded(source.intensity, 0.5, 1.5, 1),
    tint: bounded(source.tint, 0, 2, 1),
    radius: bounded(source.radius, 0, 24, 12),
    mode: modes.includes(source.mode) ? source.mode : "both",
    roleMode: ["light", "dark"].includes(source.roleMode)
      ? source.roleMode
      : "light",
    overrides:
      source.overrides && typeof source.overrides === "object"
        ? source.overrides
        : {},
  };
  let theme;
  function remember() {
    try {
      localStorage.setItem("copyhex-brand-v1", JSON.stringify(state));
    } catch {}
    const params = new URLSearchParams({
      color: state.seed.slice(1),
      name: state.name,
      intensity: state.intensity,
      tint: state.tint,
      radius: state.radius,
      kind: state.kind,
      mode: state.mode,
      vision: state.vision,
    });
    if (Object.keys(state.overrides).length)
      params.set("overrides", JSON.stringify(state.overrides));
    history.replaceState({}, "", location.pathname + "?" + params);
  }
  function sync() {
    $("#brand-code").value = state.seed;
    $("#brand-seed").value = state.seed;
    $("#brand-name").value = state.name;
    $("#brand-vision").value = state.vision;
    for (const key of ["intensity", "tint", "radius"]) {
      $("#brand-" + key).value =
        key === "radius" ? state[key] : Math.round(state[key] * 100);
      $("#" + key + "-output").value =
        $("#brand-" + key).value + (key === "radius" ? "px" : "%");
    }
    document
      .querySelectorAll("[data-brand-preset]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.brandPreset === state.seed),
      );
  }
  function draw() {
    theme = themeFromSeed(state.seed, state);
    theme.radius = state.radius;
    const shown = state.mode === "both" ? ["light", "dark"] : [state.mode];
    const roleMode = state.roleMode;
    $("#brand-results").innerHTML =
      `<section class="brand-preview-section"><div class="brand-preview-toolbar"><div class="scenario-tabs" aria-label="${t("previewScenario")}">${previewKinds.map((k) => `<button data-brand-kind="${k}" aria-pressed="${state.kind === k}">${t(k)}</button>`).join("")}</div><div class="mode-switch" aria-label="${t("themePair")}">${modes.map((mode) => `<button data-brand-mode="${mode}" aria-pressed="${state.mode === mode}">${modeLabel(mode, t)}</button>`).join("")}</div></div><div class="brand-preview-grid ${state.mode === "both" ? "is-paired" : "is-single"}">${shown.map((mode) => `<section class="brand-preview-card"><div class="brand-preview-label"><span><i class="mode-dot ${mode}"></i>${modeLabel(mode, t)}</span><span>${state.seed}</span></div>${designPreview(theme[mode], { kind: state.kind, vision: state.vision, t, name: state.name || "CopyHex", radius: state.radius })}</section>`).join("")}</div><div class="preview-caption"><span><i></i>${t("previewOnly")}</span><span>${t("contrastChecks")}</span></div><div class="brand-contrast-grid">${shown
        .map((mode) => {
          const roles = theme[mode],
            pairs = [
              ["textPrimary", "surface"],
              ["textMuted", "surface"],
              ["onPrimary", "primary"],
            ];
          return `<section><h3>${modeLabel(mode, t)}</h3>${pairs
            .map(([fg, bg]) => {
              const ratio = contrast(roles[fg], roles[bg]);
              return `<div><span>${t(labels[fg])}</span><b class="${ratio >= 4.5 ? "ratio-pass" : "ratio-fail"}">${ratio.toFixed(2)}:1 <small>AA ${t(ratio >= 4.5 ? "pass" : "fail")}</small></b></div>`;
            })
            .join("")}</section>`;
        })
        .join(
          "",
        )}</div></section><section class="brand-system panel"><div class="brand-system-head"><div class="system-tabs" role="tablist" aria-label="${t("colorSystem")}">${[
        ["colors", "semanticRoles"],
        ["scale", "shadeScale"],
        ["export", "exportTheme"],
      ]
        .map(
          ([key, label]) =>
            `<button role="tab" id="tab-${key}" aria-controls="panel-${key}" aria-selected="${state.tab === key}" tabindex="${state.tab === key ? 0 : -1}" data-brand-tab="${key}">${t(label)}</button>`,
        )
        .join(
          "",
        )}</div><label class="brand-format">${t("format")}<select id="brand-space"><option ${state.space === "HEX" ? "selected" : ""}>HEX</option><option ${state.space === "OKLCH" ? "selected" : ""}>OKLCH</option></select></label></div><div role="tabpanel" id="panel-colors" aria-labelledby="tab-colors" ${state.tab === "colors" ? "" : "hidden"}><div class="brand-role-heading"><p>${t("customizeRoles")}</p><label>${t("theme")}<select id="brand-role-mode">${["light", "dark"].map((mode) => `<option value="${mode}" ${roleMode === mode ? "selected" : ""}>${modeLabel(mode, t)}</option>`).join("")}</select></label></div><div class="brand-role-grid">${roleKeys.map((key) => `<div class="brand-role"><input type="color" data-role="${key}" value="${theme[roleMode][key]}" aria-label="${t(labels[key])}"><div><label for="role-${key}">${t(labels[key])}</label><input type="text" id="role-${key}" data-role-code="${key}" value="${theme[roleMode][key]}" spellcheck="false" aria-label="${t(labels[key])} HEX"></div><button data-value="${format(theme[roleMode][key], state.space)}" aria-label="${t("copy")} ${t(labels[key])}">⧉</button><button data-brand-color="${theme[roleMode][key]}" aria-label="${t("save")} ${t(labels[key])}">＋</button>${state.overrides?.[roleMode]?.[key] ? `<button data-role-reset="${key}" aria-label="${t("restoreRole")}">↶</button>` : ""}</div>`).join("")}</div></div><div role="tabpanel" id="panel-scale" aria-labelledby="tab-scale" ${state.tab === "scale" ? "" : "hidden"}><div class="brand-scale-heading"><h2>${t("shadeScale")}</h2><button id="brand-save-scale">＋ ${t("savePalette")}</button></div><div class="tone-scale">${shadeSteps.map((step) => `<button data-value="${format(theme.brand[step], state.space)}"><i style="background:${theme.brand[step]}"></i><b>${step}</b><code>${theme.brand[step]}</code></button>`).join("")}</div><p class="muted">${t("gamutNote")}</p></div><div role="tabpanel" id="panel-export" aria-labelledby="tab-export" ${state.tab === "export" ? "" : "hidden"}><div class="brand-export-head"><div><h2>${t("exportTheme")}</h2><p>CSS · DTCG JSON</p></div><div><button id="brand-copy-css">⧉ ${t("copy")} CSS</button><button id="brand-export-css">${icon("download")} CSS</button><button id="brand-export-json">${icon("download")} DTCG JSON</button></div></div><textarea id="brand-token-output" readonly rows="12" spellcheck="false" aria-label="${t("tokens")}">${esc(themeCss(theme, state.space))}</textarea></div></section>`;
    document
      .querySelectorAll("[data-brand-kind]")
      .forEach(
        (b) => (b.onclick = () => change({ kind: b.dataset.brandKind })),
      );
    document
      .querySelectorAll("[data-brand-mode]")
      .forEach(
        (b) => (b.onclick = () => change({ mode: b.dataset.brandMode })),
      );
    document.querySelectorAll("[data-brand-tab]").forEach((b) => {
      b.onclick = () => {
        state.tab = b.dataset.brandTab;
        remember();
        draw();
        $("#tab-" + state.tab).focus();
      };
      b.onkeydown = (e) => {
        const tabs = ["colors", "scale", "export"];
        let i = tabs.indexOf(state.tab);
        if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          i =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? 2
                : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
          state.tab = tabs[i];
          remember();
          draw();
          $("#tab-" + state.tab).focus();
        }
      };
    });
    $("#brand-space").onchange = (e) => change({ space: e.target.value });
    $("#brand-role-mode").onchange = (e) =>
      change({ roleMode: e.target.value });
    const setRole = (key, value) => {
      const hex = parseColor(value);
      if (!hex) {
        toast(t("invalid"));
        draw();
        return;
      }
      state.overrides = {
        ...state.overrides,
        [roleMode]: { ...state.overrides?.[roleMode], [key]: hex },
      };
      remember();
      draw();
    };
    document
      .querySelectorAll("[data-role]")
      .forEach(
        (el) => (el.onchange = () => setRole(el.dataset.role, el.value)),
      );
    document
      .querySelectorAll("[data-role-code]")
      .forEach(
        (el) => (el.onchange = () => setRole(el.dataset.roleCode, el.value)),
      );
    document.querySelectorAll("[data-role-reset]").forEach(
      (b) =>
        (b.onclick = () => {
          delete state.overrides[roleMode][b.dataset.roleReset];
          remember();
          draw();
        }),
    );
    $("#brand-save-scale").onclick = () =>
      onSave(
        shadeSteps.map((step) => theme.brand[step]),
        (state.name || "CopyHex") + " · " + t("shadeScale"),
      );
    $("#brand-copy-css").onclick = () => copy(themeCss(theme, state.space));
    $("#brand-export-css").onclick = () =>
      download("copyhex-theme.css", themeCss(theme, state.space), "text/css");
    $("#brand-export-json").onclick = () =>
      download(
        "copyhex.tokens.json",
        JSON.stringify(themeTokens(theme), null, 2),
        "application/json",
      );
    document
      .querySelectorAll("[data-brand-color]")
      .forEach((b) => (b.onclick = () => onSaveColor(b.dataset.brandColor)));
  }
  function change(patch) {
    state = { ...state, ...patch };
    remember();
    draw();
  }
  function setSeed(hex) {
    state.seed = hex;
    state.overrides = {};
    $("#brand-error").textContent = "";
    sync();
    remember();
    draw();
  }
  $("#brand-form").onsubmit = (e) => {
    e.preventDefault();
    const hex = parseColor($("#brand-code").value);
    if (hex) setSeed(hex);
    else $("#brand-error").textContent = t("invalid");
  };
  $("#brand-seed").oninput = (e) => setSeed(e.target.value.toUpperCase());
  $("#brand-name").oninput = (e) => {
    state.name = e.target.value;
    remember();
    draw();
  };
  $("#brand-vision").onchange = (e) => change({ vision: e.target.value });
  for (const key of ["intensity", "tint", "radius"])
    $("#brand-" + key).oninput = (e) => {
      state[key] = key === "radius" ? +e.target.value : +e.target.value / 100;
      $("#" + key + "-output").value =
        e.target.value + (key === "radius" ? "px" : "%");
      remember();
      draw();
    };
  document
    .querySelectorAll("[data-brand-preset]")
    .forEach((b) => (b.onclick = () => setSeed(b.dataset.brandPreset)));
  $("#brand-reset").onclick = () => {
    state = structuredClone(defaults);
    sync();
    remember();
    draw();
    toast(t("resetTheme"));
  };
  $("#brand-share").onclick = () => {
    remember();
    copy(location.href);
  };
  $("#brand-save").onclick = () =>
    onSave(
      [
        ...new Set([
          state.seed,
          theme.light.primary,
          theme.light.background,
          theme.light.textPrimary,
          theme.dark.background,
          theme.dark.textPrimary,
        ]),
      ],
      state.name || t("brandBuilder"),
    );
  bindEyedropper($("#brand-eyedropper"), { onPick: setSeed, t, toast });
  sync();
  draw();
}
