const valid = (h) => typeof h === "string" && /^#[0-9a-f]{6}$/i.test(h);
export function cleanVersions(versions) {
  return (Array.isArray(versions) ? versions : [])
    .filter(
      (v) =>
        v &&
        typeof v.name === "string" &&
        v.name.length <= 100 &&
        Array.isArray(v.colors) &&
        v.colors.length <= 6000 &&
        v.colors.every(valid) &&
        typeof v.date === "string" &&
        Number.isFinite(Date.parse(v.date)) &&
        Number.isInteger(v.number) &&
        v.number > 0,
    )
    .slice(-20)
    .map((v) => ({
      name: v.name,
      colors: v.colors.map((h) => h.toUpperCase()),
      date: v.date,
      number: v.number,
    }));
}
function snapshot(p, number) {
  return {
    name: p.name,
    colors: [...p.colors],
    date: new Date().toISOString(),
    number,
  };
}
export function updatePalette(p, patch = {}) {
  let versions = cleanVersions(p.versions);
  if (!versions.length) versions.push(snapshot(p, 1));
  Object.assign(p, patch);
  const last = versions.at(-1);
  if (
    last.name !== p.name ||
    JSON.stringify(last.colors) !== JSON.stringify(p.colors)
  )
    versions.push(snapshot(p, last.number + 1));
  p.versions = versions.slice(-20);
  return p;
}
export function paletteDifference(a, b) {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => ({
    index: i,
    before: a[i] || null,
    after: b[i] || null,
    changed: a[i] !== b[i],
  }));
}
export function sharePayload(p, version = null) {
  const s = version || {
    name: p.name,
    colors: p.colors,
    date: new Date().toISOString(),
    number: cleanVersions(p.versions).at(-1)?.number || 1,
  };
  return {
    v: 1,
    name: s.name,
    colors: [...s.colors],
    version: s.number,
    date: s.date,
  };
}
export function encodePalette(payload) {
  if (!validShared(payload)) throw new Error("Invalid palette");
  const bytes = new TextEncoder().encode(JSON.stringify(payload)),
    text = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function validShared(p) {
  return (
    p &&
    p.v === 1 &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    p.name.length <= 100 &&
    Array.isArray(p.colors) &&
    p.colors.length > 0 &&
    p.colors.length <= 128 &&
    p.colors.every(valid) &&
    Number.isInteger(p.version) &&
    p.version > 0 &&
    p.version < 100000 &&
    typeof p.date === "string" &&
    p.date.length < 40 &&
    Number.isFinite(Date.parse(p.date))
  );
}
export function decodePalette(encoded) {
  try {
    if (
      typeof encoded !== "string" ||
      encoded.length > 12000 ||
      !/^[A-Za-z0-9_-]+$/.test(encoded)
    )
      return null;
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/"),
      bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
      p = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return validShared(p)
      ? {
          v: 1,
          name: p.name,
          colors: p.colors.map((h) => h.toUpperCase()),
          version: p.version,
          date: p.date,
        }
      : null;
  } catch {
    return null;
  }
}
