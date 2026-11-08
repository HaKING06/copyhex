import { escapeHtml as esc } from "./ui-utils.js";
import { simulateVision } from "./color-spaces.js";
export const previewKinds = ["dashboard", "storefront", "portfolio", "mobile"];
export function designPreview(
  tokens,
  { kind = "dashboard", vision = "normal", t, name = "CopyHex", radius = 12 },
) {
  const p = Object.fromEntries(
    Object.entries(tokens).map(([k, h]) => [k, simulateVision(h, vision)]),
  );
  const style = Object.entries(p)
    .map(([k, v]) => `--mock-${k}:${v}`)
    .join(";");
  const brand = esc(name);
  const nav = `<div class="mock-nav"><b>${brand}<span> /</span></b><span>● ● ●</span></div>`;
  let body;
  if (kind === "dashboard")
    body = `<div class="mock-title"><small>${brand} / ${t("dashboard")}</small><h3>${t("previewTitle")}</h3></div><div class="mock-stat-grid">${["palettes", "colorsNav", "favorites"].map((k, i) => `<div><small>${t(k)}</small><b>${[24, 128, 16][i]}</b><span class="mock-status">↗ ${[12, 8, 16][i]}%</span></div>`).join("")}</div><div class="mock-chart"><div><b>${t("previewUI")}</b><span>•••</span></div><div class="mock-bars">${[40, 65, 50, 85, 62, 96, 75, 88, 54, 80].map((n, i) => `<i style="height:${n}%;background:${i % 3 === 0 ? "var(--mock-success)" : "var(--mock-primary)"}"></i>`).join("")}</div></div>`;
  else if (kind === "storefront")
    body = `<div class="mock-product"><div class="mock-product-art"><i></i><span>${brand}</span></div><div><small>${t("storefront")}</small><h3>${t("previewTitle")}</h3><p>${t("previewText")}</p><b class="mock-price">49.00</b><span class="mock-action">${t("previewAction")} ↗</span></div></div>`;
  else if (kind === "portfolio")
    body = `<div class="mock-portfolio"><small>${t("portfolio")}</small><h3>${t("previewTitle")}</h3><p>${t("previewText")}</p><span class="mock-action">${t("previewAction")} ↗</span><div class="mock-work"><i></i><i></i><i></i></div></div>`;
  else
    body = `<div class="mock-phone"><div class="mock-phone-top">9:41 <span>● ▰</span></div><small>${brand}</small><h3>${t("previewTitle")}</h3><div class="mock-phone-card"><span>✳</span><b>${t("paletteTitle")}</b></div><p>${t("previewText")}</p><span class="mock-action">${t("previewAction")} ↗</span><div class="mock-phone-tabs">⌂ ◇ ♡</div></div>`;
  return `<div class="design-mockup mock-${kind}" style="${style};--mock-radius:${Math.max(0, Math.min(24, radius))}px" role="img" aria-label="${t("previewUI")} · ${t(kind)}">${kind === "mobile" ? "" : nav}${body}</div>`;
}
