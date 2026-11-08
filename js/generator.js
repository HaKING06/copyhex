import {
  generatePalette,
  modes,
  styles,
  extractPalette,
  paletteCss,
  paletteSvg,
} from "./palette-engine.js";
import { parseColor, contrast, luminance, format } from "./color-utils.js";
const valid = (h) => typeof h === "string" && /^#[0-9A-F]{6}$/i.test(h);
const clone = (s) => JSON.parse(JSON.stringify(s));
function initialState() {
  let draft;
  try {
    draft = JSON.parse(localStorage.getItem("copyhex-generator-v1") || "null");
  } catch {}
  const params = new URLSearchParams(location.search),
    hexes = (params.get("colors") || "")
      .split("-")
      .map((v) => parseColor(v))
      .filter(Boolean);
  if (hexes.length > 0 && hexes.length < 3) {
    const locks = Array.from({ length: 5 }, (_, i) => i < hexes.length);
    return {
      colors: generatePalette({
        colors: hexes,
        locks,
        count: 5,
        seed: hexes[0],
      }),
      locks,
      mode: "smart",
      style: "balanced",
      seed: hexes[0],
    };
  }
  if (hexes.length >= 3 && hexes.length <= 8)
    return {
      colors: hexes,
      locks: hexes.map((_, i) => (params.get("locked") || "")[i] === "1"),
      mode: modes.includes(params.get("mode")) ? params.get("mode") : "smart",
      style: styles.includes(params.get("style"))
        ? params.get("style")
        : "balanced",
      seed: hexes[0],
    };
  if (
    draft &&
    Array.isArray(draft.colors) &&
    draft.colors.length >= 3 &&
    draft.colors.length <= 8 &&
    draft.colors.every(valid) &&
    Array.isArray(draft.locks)
  )
    return {
      ...draft,
      seed: valid(draft.seed) ? draft.seed.toUpperCase() : draft.colors[0],
      colors: draft.colors.map((h) => h.toUpperCase()),
      locks: draft.colors.map((_, i) => draft.locks[i] === true),
      mode: modes.includes(draft.mode) ? draft.mode : "smart",
      style: styles.includes(draft.style) ? draft.style : "balanced",
    };
  const seed = "#8B7CF8";
  return {
    colors: generatePalette({ seed }),
    locks: [true, false, false, false, false],
    mode: "smart",
    style: "balanced",
    seed,
  };
}
export function generatorPage(t) {
  return `<section class="generator-hero"><div><p class="eyebrow">${t("generatorEyebrow")}</p><h1>${t("generatorTitle")}</h1><p>${t("generatorIntro")}</p></div><a class="button-link" href="../discover/">${t("discover")} ↗</a></section><div id="generator-workbench"></div><section class="generator-info panel"><h2>${t("generatorGuide")}</h2><p>${t("generatorGuideText")}</p><p class="muted">${t("localDraft")}</p></section>`;
}
export function bindGenerator({ t, lang, onSave, copy, download, toast }) {
  let state = initialState(),
    past = [],
    future = [],
    options = [],
    background = state.colors.length - 1;
  const $ = (s) => document.querySelector(s);
  const root = $("#generator-workbench");
  function store() {
    try {
      localStorage.setItem("copyhex-generator-v1", JSON.stringify(state));
    } catch {}
    const params = new URLSearchParams({
      colors: state.colors.map((h) => h.slice(1)).join("-"),
      locked: state.locks.map((v) => (v ? 1 : 0)).join(""),
      mode: state.mode,
      style: state.style,
    });
    history.replaceState({}, "", location.pathname + "?" + params.toString());
  }
  function commit(next) {
    if (JSON.stringify(next) === JSON.stringify(state)) {
      toast(t("noChanges"));
      return;
    }
    past.push(clone(state));
    if (past.length > 40) past.shift();
    future = [];
    state = next;
    options = [];
    store();
    draw();
  }
  function generate(index = null) {
    if (index === null && state.locks.every(Boolean)) {
      toast(t("allLocked"));
      return;
    }
    commit({
      ...state,
      colors: generatePalette({
        ...state,
        count: state.colors.length,
        replaceIndex: index,
      }),
    });
  }
  function draw() {
    background = Math.min(background, state.colors.length - 1);
    root.innerHTML = `<div class="generator-toolbar"><button class="primary generate-button" id="generate-palette">✳ ${t("regenerate")}</button><div class="history-buttons"><button id="generator-undo" ${past.length ? "" : "disabled"} aria-label="${t("undo")}">↶</button><button id="generator-redo" ${future.length ? "" : "disabled"} aria-label="${t("redo")}">↷</button></div><span class="keyboard-hint">${t("spaceHint")}</span><button id="save-generated">＋ ${t("savePalette")}</button><button id="share-generated">↗ ${t("sharePalette")}</button></div><div class="generator-controls"><form id="seed-form"><label>${t("seed")}<input id="seed-input" value="${state.seed}" spellcheck="false" aria-label="${t("seed")}"></label><button>${t("applySeed")}</button></form><label>${t("harmonyMode")}<select id="generator-mode">${modes.map((v) => `<option value="${v}" ${v === state.mode ? "selected" : ""}>${t(v === "dark" ? "darkTheme" : v)}</option>`).join("")}</select></label><label>${t("paletteStyle")}<select id="generator-style">${styles.map((v) => `<option value="${v}" ${v === state.style ? "selected" : ""}>${t(v === "dark" ? "darkTheme" : v)}</option>`).join("")}</select></label><label>${t("colorCount")}<select id="generator-count">${[3, 4, 5, 6, 7, 8].map((n) => `<option ${n === state.colors.length ? "selected" : ""}>${n}</option>`).join("")}</select></label></div><div class="palette-canvas" style="--columns:${state.colors.length}">${state.colors.map((hex, i) => swatch(hex, i)).join("")}</div><div class="generator-underbar"><p id="generator-status" role="status">${t("lockedHint")}</p><button id="copy-generated">⧉ ${t("copyAll")}</button><label>${t("exportFormat")}<select id="generator-export"><option>CSS</option><option>JSON</option><option>SVG</option><option>PNG</option></select></label><button id="export-generated">↓ ${t("download")}</button></div><div class="generator-lower"><section class="panel alternatives-panel"><div class="section-head"><div><h2>${t("alternatives")}</h2><p>${t("alternativesIntro")}</p></div><button id="more-options">✳ ${t("moreOptions")}</button></div><div id="palette-options" class="palette-options-grid"></div></section><section class="panel image-extract-panel"><p class="eyebrow">ON-DEVICE / PRIVATE</p><h2>${t("imageExtract")}</h2><p>${t("imageExtractInfo")}</p><label class="file-button">↑ ${t("chooseImage")}<input id="palette-image" type="file" accept="image/png,image/jpeg,image/webp"></label><p id="image-status" role="status"></p></section></div><section class="panel palette-preview-panel"><div><p class="eyebrow">${t("previewUI")}</p><h2>${t("previewTitle")}</h2><p>${t("previewText")}</p><label>${t("previewBackground")}<select id="preview-bg">${state.colors.map((h, i) => `<option value="${i}" ${i === background ? "selected" : ""}>${h}</option>`).join("")}</select></label><p class="muted">${t("contrastNote")}</p><div id="contrast-matrix"></div></div><div id="ui-preview" class="ui-preview"></div></section>`;
    $("#generate-palette").onclick = () => generate();
    $("#generator-undo").onclick = () => {
      if (!past.length) return;
      future.push(clone(state));
      state = past.pop();
      options = [];
      store();
      draw();
    };
    $("#generator-redo").onclick = () => {
      if (!future.length) return;
      past.push(clone(state));
      state = future.pop();
      options = [];
      store();
      draw();
    };
    $("#generator-mode").onchange = (e) =>
      commit({ ...state, mode: e.target.value });
    $("#generator-style").onchange = (e) =>
      commit({ ...state, style: e.target.value });
    $("#generator-count").onchange = (e) => {
      const count = +e.target.value;
      if (state.locks.some((lock, i) => lock && i >= count)) {
        toast(t("lockedHint"));
        e.target.value = state.colors.length;
        return;
      }
      const next = {
        ...state,
        colors: state.colors.slice(0, count),
        locks: Array.from({ length: count }, (_, i) => state.locks[i] || false),
      };
      next.colors = generatePalette({ ...next, count });
      commit(next);
    };
    $("#seed-form").onsubmit = (e) => {
      e.preventDefault();
      const seed = parseColor($("#seed-input").value);
      if (!seed) {
        toast(t("invalid"));
        return;
      }
      const next = {
        ...state,
        seed,
        colors: [seed, ...state.colors.slice(1)],
        locks: [true, ...state.locks.slice(1)],
      };
      next.colors = generatePalette({ ...next, count: next.colors.length });
      commit(next);
    };
    $("#save-generated").onclick = () =>
      onSave([...state.colors], t("generatedName"));
    $("#share-generated").onclick = () => copy(location.href);
    $("#copy-generated").onclick = () => copy(state.colors.join(", "));
    $("#export-generated").onclick = exportPalette;
    $("#more-options").onclick = createOptions;
    $("#preview-bg").onchange = (e) => {
      background = +e.target.value;
      drawPreview();
    };
    $("#palette-image").onchange = importImage;
    root.querySelectorAll("[data-lock]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.lock;
          commit({
            ...state,
            locks: state.locks.map((v, j) => (i === j ? !v : v)),
          });
        }),
    );
    root
      .querySelectorAll("[data-reroll]")
      .forEach((b) => (b.onclick = () => generate(+b.dataset.reroll)));
    root.querySelectorAll("[data-color-form]").forEach(
      (f) =>
        (f.onsubmit = (e) => {
          e.preventDefault();
          const i = +f.dataset.colorForm,
            hex = parseColor(f.querySelector("input").value);
          if (!hex) {
            toast(t("invalid"));
            return;
          }
          setColor(i, hex);
        }),
    );
    root
      .querySelectorAll("[data-native-color]")
      .forEach(
        (input) =>
          (input.onchange = (e) =>
            setColor(+input.dataset.nativeColor, e.target.value.toUpperCase())),
      );
    root.querySelectorAll("[data-move]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.index,
            j = i + (b.dataset.move === "left" ? -1 : 1),
            next = clone(state);
          [next.colors[i], next.colors[j]] = [next.colors[j], next.colors[i]];
          [next.locks[i], next.locks[j]] = [next.locks[j], next.locks[i]];
          commit(next);
        }),
    );
    drawPreview();
    createOptions();
  }
  function swatch(hex, i) {
    const ink =
      contrast(hex, "#000000") > contrast(hex, "#FFFFFF")
        ? "#111111"
        : "#FFFFFF";
    return `<article class="generator-swatch" style="--swatch:${hex};--on-swatch:${ink}"><div class="swatch-top"><span>${String(i + 1).padStart(2, "0")}</span><button data-lock="${i}" aria-pressed="${state.locks[i]}" aria-label="${t(state.locks[i] ? "unlock" : "lock")} ${hex}">${state.locks[i] ? "◆ " + t("locked") : "◇ " + t("lock")}</button></div><label class="swatch-picker" title="${t("editColor")}"><input type="color" data-native-color="${i}" value="${hex}" aria-label="${t("editColor")} ${i + 1}"></label><div class="swatch-bottom"><form data-color-form="${i}"><input value="${hex}" aria-label="HEX ${i + 1}" spellcheck="false"><button type="submit" aria-label="${t("apply")}">↵</button></form><button class="swatch-rgb" data-value="${format(hex, "RGB")}">${format(hex, "RGB")} ⧉</button><div class="swatch-reorder"><button data-move="left" data-index="${i}" ${i === 0 ? "disabled" : ""} aria-label="${t("moveLeft")}">←</button><button data-reroll="${i}" ${state.locks[i] ? "disabled" : ""} title="${t("changeOne")}">↻ ${t("changeOne")}</button><button data-move="right" data-index="${i}" ${i === state.colors.length - 1 ? "disabled" : ""} aria-label="${t("moveRight")}">→</button></div></div></article>`;
  }
  function setColor(i, hex) {
    const next = clone(state);
    next.colors[i] = hex;
    next.locks[i] = true;
    if (i === 0) next.seed = hex;
    commit(next);
  }
  function createOptions() {
    if (state.locks.every(Boolean)) {
      $("#palette-options").innerHTML =
        `<p class="muted">${t("allLocked")}</p>`;
      return;
    }
    options = Array.from({ length: 4 }, () =>
      generatePalette({ ...state, count: state.colors.length }),
    );
    $("#palette-options").innerHTML = options
      .map(
        (colors, i) =>
          `<button data-option="${i}" class="palette-option" aria-label="${t("useOption")} ${i + 1}"><div>${colors.map((h) => `<i style="background:${h}"></i>`).join("")}</div><span>0${i + 1} <b>${t("useOption")} ↗</b></span></button>`,
      )
      .join("");
    root
      .querySelectorAll("[data-option]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            commit({ ...state, colors: [...options[+b.dataset.option]] })),
      );
  }
  function drawPreview() {
    const bg = state.colors[background],
      text =
        contrast(bg, "#000000") > contrast(bg, "#FFFFFF")
          ? "#171927"
          : "#FFFFFF",
      accent = state.colors.find((h) => h !== bg) || text,
      accentText =
        contrast(accent, "#000000") > contrast(accent, "#FFFFFF")
          ? "#171927"
          : "#FFFFFF";
    $("#ui-preview").style.cssText = `background:${bg};color:${text}`;
    $("#ui-preview").innerHTML =
      `<div class="preview-mini-nav"><b>Studio /</b><span>● ● ●</span></div><span class="preview-tag">${t("previewLabel")}</span><h3>${t("previewTitle")}</h3><p>${t("previewText")}</p><span class="preview-cta" style="background:${accent};color:${accentText}">${t("previewAction")} ↗</span><div class="preview-mini-swatches">${state.colors.map((h) => `<i style="background:${h}"></i>`).join("")}</div>`;
    $("#contrast-matrix").innerHTML = state.colors
      .map((hex) => {
        const ratio = contrast(hex, bg);
        return `<div class="contrast-row"><i style="background:${hex}"></i><code>${hex}</code><b>${ratio.toFixed(2)}:1</b><span class="${ratio >= 4.5 ? "ratio-pass" : "ratio-fail"}">AA ${t(ratio >= 4.5 ? "pass" : "fail")}</span></div>`;
      })
      .join("");
  }
  function exportPalette() {
    const kind = $("#generator-export").value;
    if (kind === "CSS")
      download("copyhex-palette.css", paletteCss(state.colors), "text/css");
    if (kind === "JSON")
      download(
        "copyhex-palette.json",
        JSON.stringify(
          { name: t("generatedName"), colors: state.colors },
          null,
          2,
        ),
        "application/json",
      );
    if (kind === "SVG")
      download(
        "copyhex-palette.svg",
        paletteSvg(state.colors, t("generatedName")),
        "image/svg+xml",
      );
    if (kind === "PNG") {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#151722";
      ctx.fillRect(0, 0, 1200, 720);
      ctx.fillStyle = "#f7f5ff";
      ctx.font = "bold 32px system-ui";
      ctx.fillText("CopyHex", 54, 70);
      ctx.font = "22px system-ui";
      ctx.fillStyle = "#b8b6c9";
      ctx.fillText(t("generatedName"), 54, 115);
      state.colors.forEach((h, i) => {
        ctx.fillStyle = h;
        ctx.fillRect(
          54 + (i * 1092) / state.colors.length,
          155,
          1092 / state.colors.length + 1,
          440,
        );
        ctx.fillStyle = "#f7f5ff";
        ctx.font = (state.colors.length > 6 ? "17" : "21") + "px monospace";
        ctx.fillText(h, 68 + (i * 1092) / state.colors.length, 635);
      });
      ctx.font = "17px system-ui";
      ctx.fillStyle = "#a5a2b7";
      ctx.fillText("copyhex.haking.tr", 54, 685);
      canvas.toBlob((blob) => {
        if (blob) download("copyhex-palette.png", blob, "image/png");
      });
    }
  }
  async function importImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      toast(t("imageError"));
      return;
    }
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > 40000000) throw Error();
      const canvas = document.createElement("canvas"),
        scale = Math.min(1, 96 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let colors = extractPalette(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data,
        state.colors.length,
      );
      if (!colors.length) {
        toast(t("imageEmpty"));
        return;
      }
      if (colors.length < 3) {
        const locks = Array.from({ length: 3 }, (_, i) => i < colors.length);
        colors = generatePalette({ colors, locks, count: 3, seed: colors[0] });
      }
      commit({
        ...state,
        colors,
        locks: colors.map(() => true),
        seed: colors[0],
      });
      toast(t("imageImported"));
    } catch {
      toast(t("imageError"));
    } finally {
      bitmap?.close();
    }
  }
  const keyHandler = (e) => {
    if (
      e.code === "Space" &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(
        document.activeElement.tagName,
      ) &&
      !document.querySelector("#dialog").open &&
      document.querySelector("#generator-workbench")
    ) {
      e.preventDefault();
      generate();
    }
  };
  document.addEventListener("keydown", keyHandler);
  draw();
  return () => document.removeEventListener("keydown", keyHandler);
}
