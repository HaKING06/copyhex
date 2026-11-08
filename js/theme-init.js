try {
  const saved = JSON.parse(localStorage.getItem("copyhex-v1") || "{}");
  const theme = ["light", "dark"].includes(saved.theme)
    ? saved.theme
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
} catch {}
