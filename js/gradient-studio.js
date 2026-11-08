import {
  defaultGradient,
  normalizeGradient,
  gradientValue,
  gradientCss,
  gradientSvg,
  gradientAt,
  paintGradient,
} from "./gradient-engine.js";
import { parseColor } from "./color-utils.js";
import { escapeHtml } from "./ui-utils.js";
export function gradientPage(t) {
  return `<section class="tool-hero"><p class="eyebrow">CopyHex</p><h1>${t("gradientStudio")}</h1><p>${t("gradientIntro")}</p></section><div class="gradient-layout"><section><div id="gradient-preview" class="gradient-preview" style="background:linear-gradient(120deg,#8B7CF8,#75C9B4,#F2D38B)"><span>CopyHex</span></div><div class="gradient-presets" id="gradient-presets"></div><section class="panel"><div class="section-head"><h2>CSS</h2><button id="gradient-copy">⧉ ${t("copy")}</button></div><textarea id="gradient-code" readonly rows="4" spellcheck="false" aria-label="CSS"></textarea><div class="gradient-actions"><button id="gradient-share">↗ ${t("sharePalette")}</button><button id="gradient-svg">${t("downloadSvg")}</button><button id="gradient-png">${t("downloadPng")}</button><button id="gradient-save" class="primary">＋ ${t("savePalette")}</button></div></section></section><section class="panel gradient-settings"><div class="gradient-kind-controls"><label>${t("gradientType")}<select id="gradient-type"><option value="linear">${t("linear")}</option><option value="radial">${t("radial")}</option></select></label><label>${t("interpolation")}<select id="gradient-space"><option value="oklab">OKLab</option><option value="srgb">sRGB</option></select></label></div><label class="gradient-angle">${t("angle")}<input id="gradient-angle" type="range" min="0" max="360" value="120"><output id="gradient-angle-value">120°</output></label><div class="section-head"><h2>${t("stops")}</h2><button id="gradient-add">＋ ${t("addStop")}</button></div><div id="gradient-stops"></div></section></div>`;
}
export function bindGradient({ t, copy, download, onSave, toast }) {
  const $ = (s) => document.querySelector(s),
    params = new URLSearchParams(location.search);
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem("copyhex-gradient-v1") || "null");
  } catch {}
  const query = {
    type: params.get("type") || "linear",
    space: params.get("space") || "oklab",
    angle: +(params.get("angle") || 120),
    stops: (params.get("stops") || "").split(",").map((s) => {
      const [hex, pos] = s.split("@");
      return { hex, pos: +pos };
    }),
  };
  let g =
    normalizeGradient(query) ||
    normalizeGradient(stored) ||
    structuredClone(defaultGradient);
  const presets = [
    defaultGradient,
    {
      type: "linear",
      space: "oklab",
      angle: 45,
      stops: [
        { hex: "#152F3C", pos: 0 },
        { hex: "#4EAB9C", pos: 50 },
        { hex: "#E5EFCC", pos: 100 },
      ],
    },
    {
      type: "linear",
      space: "oklab",
      angle: 135,
      stops: [
        { hex: "#652D54", pos: 0 },
        { hex: "#D28189", pos: 48 },
        { hex: "#F7D9B4", pos: 100 },
      ],
    },
    {
      type: "radial",
      space: "oklab",
      angle: 90,
      stops: [
        { hex: "#B7A5F5", pos: 0 },
        { hex: "#514591", pos: 55 },
        { hex: "#151A32", pos: 100 },
      ],
    },
  ];
  function remember() {
    g = normalizeGradient(g);
    try {
      localStorage.setItem("copyhex-gradient-v1", JSON.stringify(g));
    } catch {}
    const p = new URLSearchParams({
      type: g.type,
      space: g.space,
      angle: g.angle,
      stops: g.stops.map((s) => s.hex.slice(1) + "@" + s.pos).join(","),
    });
    history.replaceState({}, "", location.pathname + "?" + p.toString());
  }
  function refresh() {
    const valid = normalizeGradient(g);
    const advanced = gradientValue(valid),
      fallback = gradientValue(valid, { fallback: true });
    $("#gradient-preview").style.backgroundImage = CSS.supports(
      "background-image",
      advanced,
    )
      ? advanced
      : fallback;
    $("#gradient-code").value = gradientCss(valid);
    $("#gradient-angle-value").textContent = g.angle + "°";
  }
  function draw() {
    g = normalizeGradient(g);
    $("#gradient-type").value = g.type;
    $("#gradient-space").value = g.space;
    $("#gradient-angle").value = g.angle;
    $("#gradient-angle").disabled = g.type === "radial";
    $("#gradient-add").disabled = g.stops.length >= 8;
    $("#gradient-stops").innerHTML = g.stops
      .map(
        (s, i) =>
          `<div class="gradient-stop"><div><input type="color" data-stop-color="${i}" value="${s.hex}" aria-label="${t("swatch")} ${i + 1}"><input data-stop-code="${i}" value="${s.hex}" spellcheck="false" aria-label="HEX ${i + 1}"><button data-stop-remove="${i}" ${g.stops.length <= 2 ? "disabled" : ""} aria-label="${t("removeColor")}">×</button></div><label>${t("position")}<input type="range" min="0" max="100" value="${s.pos}" data-stop-position="${i}"><output data-stop-output="${i}">${s.pos}%</output></label></div>`,
      )
      .join("");
    document.querySelectorAll("[data-stop-color]").forEach((el) => {
      el.oninput = (e) => {
        g.stops[+el.dataset.stopColor].hex = e.target.value.toUpperCase();
        document.querySelector(
          `[data-stop-code="${el.dataset.stopColor}"]`,
        ).value = e.target.value.toUpperCase();
        refresh();
      };
      el.onchange = () => {
        remember();
        draw();
      };
    });
    document.querySelectorAll("[data-stop-code]").forEach(
      (el) =>
        (el.onchange = (e) => {
          const h = parseColor(e.target.value);
          if (!h) {
            toast(t("invalid"));
            e.target.value = g.stops[+el.dataset.stopCode].hex;
            return;
          }
          g.stops[+el.dataset.stopCode].hex = h;
          remember();
          draw();
        }),
    );
    document.querySelectorAll("[data-stop-position]").forEach((el) => {
      el.oninput = (e) => {
        g.stops[+el.dataset.stopPosition].pos = +e.target.value;
        document.querySelector(
          `[data-stop-output="${el.dataset.stopPosition}"]`,
        ).textContent = e.target.value + "%";
        refresh();
      };
      el.onchange = () => {
        remember();
        draw();
      };
    });
    document.querySelectorAll("[data-stop-remove]").forEach(
      (el) =>
        (el.onclick = () => {
          g.stops.splice(+el.dataset.stopRemove, 1);
          remember();
          draw();
        }),
    );
    refresh();
  }
  $("#gradient-type").onchange = (e) => {
    g.type = e.target.value;
    remember();
    draw();
  };
  $("#gradient-space").onchange = (e) => {
    g.space = e.target.value;
    remember();
    draw();
  };
  $("#gradient-angle").oninput = (e) => {
    g.angle = +e.target.value;
    refresh();
  };
  $("#gradient-angle").onchange = remember;
  $("#gradient-add").onclick = () => {
    const stops = g.stops;
    let i = 0,
      max = -1;
    for (let j = 1; j < stops.length; j++)
      if (stops[j].pos - stops[j - 1].pos > max) {
        max = stops[j].pos - stops[j - 1].pos;
        i = j;
      }
    const pos = Math.round((stops[i - 1].pos + stops[i].pos) / 2);
    g.stops.push({ hex: gradientAt(g, pos / 100), pos });
    remember();
    draw();
  };
  $("#gradient-copy").onclick = () => copy(gradientCss(g));
  $("#gradient-share").onclick = () => {
    remember();
    copy(location.href);
  };
  $("#gradient-svg").onclick = () =>
    download("copyhex-gradient.svg", gradientSvg(g), "image/svg+xml");
  $("#gradient-png").onclick = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 720;
    paintGradient(canvas, g);
    canvas.toBlob((blob) => {
      if (blob) download("copyhex-gradient.png", blob, "image/png");
    });
  };
  $("#gradient-save").onclick = () =>
    onSave([...new Set(g.stops.map((s) => s.hex))], t("gradientStudio"));
  $("#gradient-presets").innerHTML = presets
    .map(
      (p, i) =>
        `<button data-gradient-preset="${i}" style="background:${gradientValue(p, { fallback: true })}" aria-label="${t("curated")} ${i + 1}"><span>0${i + 1}</span></button>`,
    )
    .join("");
  document.querySelectorAll("[data-gradient-preset]").forEach(
    (el) =>
      (el.onclick = () => {
        g = structuredClone(presets[+el.dataset.gradientPreset]);
        remember();
        draw();
      }),
  );
  draw();
}
