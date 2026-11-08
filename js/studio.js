import { bindEyedropper } from "./eyedropper.js";
import { rgb, hsl, format, parseColor, contrast } from "./color-utils.js";
export function studioPage(t, hex) {
  return `<section class="page-head studio-head"><div><p class="eyebrow">CopyHex</p><h1>${t("studio")}</h1><p>${t("studioIntro")}</p></div><a class="button-link" href="/guide/">${t("readGuide")} ↗</a></section><div class="studio-workspace"><section class="studio-left"><div class="large-preview" id="large-preview"><span id="preview-name"></span><b id="preview-hex"></b><span>sRGB</span><input id="live-picker" type="color" value="${hex}" aria-label="${t("pick")}"></div><div class="studio-tools"><button id="studio-eyedropper">◉ ${t("eyedropper")}</button><button id="live-fav">♡ ${t("studioFavorite")}</button><button class="primary" id="live-save">＋ ${t("save")}</button><button id="live-share">↗ ${t("share")}</button></div><div class="panel"><h2>${t("harmonies")}</h2><div class="harmony-tabs">${["complementary", "analogous", "triadic"].map((k, i) => `<button data-harmony="${k}" aria-pressed="${i === 0}">${t(k)}</button>`).join("")}</div><div id="harmonies" class="harmony-row"></div><button id="save-harmony">＋ ${t("saveHarmony")}</button></div><div class="panel"><h2>${t("recent")}</h2><div id="recent-colors" class="recent-colors"></div></div></section><section class="studio-right"><div class="panel"><h2>${t("channels")}</h2><form id="live-form"><label>${t("hexLabel")}<input id="live-value" value="${hex}" autocomplete="off" spellcheck="false"></label><button type="submit">${t("apply")}</button><p id="live-error" role="alert"></p></form><div class="channel-group"><h3>RGB</h3>${["R", "G", "B"].map((k, i) => channel(k, 255, "rgb", i)).join("")}</div><div class="channel-group"><h3>HSL</h3>${["H", "S", "L"].map((k, i) => channel(k, i === 0 ? 359 : 100, "hsl", i)).join("")}</div></div><div class="panel"><h2>${t("live")}</h2><div class="values" id="live-values"></div><small class="muted">${t("aboutCMYK")}</small></div></section></div><section class="panel studio-contrast"><div><p class="eyebrow">${t("accessibility")}</p><h2>${t("contrast")}</h2><div class="contrast-inputs"><label>${t("foreground")}<input id="live-foreground" type="color" value="${hex}"></label><label>${t("background")}<input id="live-background" type="color" value="#ffffff"></label></div><p id="live-ratio" aria-live="polite"></p></div><div id="live-contrast-preview">${t("sample")}</div></section>`;
}
function channel(label, max, type, i) {
  return `<label class="channel"><span>${label}</span><input type="range" min="0" max="${max}" data-channel="${type}" data-index="${i}" aria-label="${type.toUpperCase()} ${label}"><output id="${type}-${i}"></output></label>`;
}
export function bindStudio({
  t,
  initial,
  toast,
  onColor,
  onSave,
  onFavorite,
  isFavorite,
  onHarmony,
  copy,
  colorName,
  recent,
}) {
  let current = initial,
    kind = "complementary",
    harmonies = [];
  const $ = (s) => document.querySelector(s);
  const set = (hex, remember = true) => {
    current = hex.toUpperCase();
    onColor(current, remember);
    $("#live-value").value = current;
    $("#live-picker").value = current;
    $("#large-preview").style.background = current;
    $("#large-preview").style.color =
      contrast(current, "#000000") > contrast(current, "#FFFFFF")
        ? "#111111"
        : "#FFFFFF";
    $("#preview-hex").textContent = current;
    $("#preview-name").textContent = colorName(current);
    $("#live-fav").textContent =
      (isFavorite(current) ? "♥ " : "♡ ") + t("studioFavorite");
    $("#live-fav").setAttribute("aria-pressed", isFavorite(current));
    for (const [type, values] of [
      ["rgb", rgb(current)],
      ["hsl", hsl(current)],
    ])
      values.forEach((v, i) => {
        const input = $(`[data-channel="${type}"][data-index="${i}"]`);
        input.value = type === "hsl" && i === 0 ? Math.min(359, v) : v;
        $(`#${type}-${i}`).textContent = v;
      });
    $("#live-values").innerHTML = ["HEX", "RGB", "HSL", "OKLCH", "CMYK"]
      .map(
        (type) =>
          `<button data-value="${format(current, type)}"><span>${type}</span><b>${format(current, type)}</b> ⧉</button>`,
      )
      .join("");
    $("#live-foreground").value = current;
    updateContrast();
    updateHarmonies();
    updateRecent();
  };
  function updateContrast() {
    const fg = $("#live-foreground").value,
      bg = $("#live-background").value,
      r = contrast(fg, bg);
    $("#live-contrast-preview").style.cssText = `color:${fg};background:${bg}`;
    $("#live-ratio").textContent =
      `${r.toFixed(2)}:1 · AA: ${t(r >= 4.5 ? "pass" : "fail")} · AAA: ${t(r >= 7 ? "pass" : "fail")}`;
  }
  function updateHarmonies() {
    const [h, s, l] = hsl(current),
      offsets =
        kind === "complementary"
          ? [0, 180]
          : kind === "analogous"
            ? [-30, 0, 30]
            : [0, 120, 240];
    harmonies = offsets.map((o) =>
      parseColor(`hsl(${(h + o + 360) % 360}, ${s}%, ${l}%)`),
    );
    $("#harmonies").innerHTML = harmonies
      .map(
        (hex) =>
          `<button data-pick="${hex}" style="--swatch:${hex}" aria-label="${t("colorLink")}: ${hex}"><span>${hex}</span></button>`,
      )
      .join("");
  }
  function updateRecent() {
    $("#recent-colors").innerHTML = recent()
      .map(
        (hex) =>
          `<button style="background:${hex}" data-pick="${hex}" aria-label="${t("colorLink")}: ${hex}" title="${hex}"></button>`,
      )
      .join("");
  }
  $("#live-picker").oninput = (e) => set(e.target.value, false);
  $("#live-picker").onchange = (e) => set(e.target.value);
  $("#live-form").onsubmit = (e) => {
    e.preventDefault();
    const hex = parseColor($("#live-value").value);
    $("#live-error").textContent = hex ? "" : t("invalid");
    if (hex) set(hex);
  };
  document.querySelectorAll("[data-channel]").forEach((el) => {
    const update = (remember) => {
      const type = el.dataset.channel,
        values = [...document.querySelectorAll(`[data-channel="${type}"]`)].map(
          (e) => +e.value,
        );
      set(
        type === "rgb"
          ? "#" + values.map((v) => v.toString(16).padStart(2, "0")).join("")
          : parseColor(`hsl(${values[0]}, ${values[1]}%, ${values[2]}%)`),
        remember,
      );
    };
    el.oninput = () => update(false);
    el.onchange = () => update(true);
  });
  $("#live-save").onclick = () => {
    onColor(current, true);
    onSave(current);
  };
  $("#live-fav").onclick = () => {
    onColor(current, true);
    onFavorite(current);
    $("#live-fav").textContent =
      (isFavorite(current) ? "♥ " : "♡ ") + t("studioFavorite");
    $("#live-fav").setAttribute("aria-pressed", isFavorite(current));
  };
  $("#live-share").onclick = () =>
    copy(location.origin + "/studio/?color=" + current.slice(1));
  $("#save-harmony").onclick = () => onHarmony(harmonies, kind);
  $(".studio-workspace").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b?.dataset.pick) set(b.dataset.pick);
    if (b?.dataset.harmony) {
      kind = b.dataset.harmony;
      document
        .querySelectorAll("[data-harmony]")
        .forEach((el) => el.setAttribute("aria-pressed", el === b));
      updateHarmonies();
    }
  });
  $("#live-foreground").oninput = $("#live-background").oninput =
    updateContrast;
  bindEyedropper($("#studio-eyedropper"), {
    onPick: (hex) => set(hex),
    t,
    toast,
  });
  set(current, false);
}
