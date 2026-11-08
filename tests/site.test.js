import { VERSION } from "../js/version.js";
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const pages = JSON.parse(await read("data/page-manifest.json"));
test("every localized page has unique canonical, language alternates and readable initial content", async () => {
  assert.equal(pages.length, 492);
  assert.equal(new Set(pages.map((p) => p.path)).size, 492);
  for (const p of pages) {
    const html = await read(p.file);
    assert.ok(
      html.includes(
        `rel="canonical" href="https://copyhex.haking.tr${p.path}"`,
      ),
      p.path,
    );
    assert.ok(html.includes(`<html lang="${p.lang}"`), p.path);
    assert.match(html, /<h1>/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="tr"/);
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.ok(!html.includes("cophex"));
    assert.ok(!html.includes("version-chip"));
    if (p.noindex) assert.match(html, /noindex,follow/);
    if (p.view === "about")
      assert.ok(html.includes(`${VERSION} · <a href="/LICENSE">MIT`), p.path);
  }
});
test("all internal links and image sources in generated content resolve to real files", async () => {
  for (const p of pages) {
    const html = await read(p.file);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      const path = decodeURIComponent(match[1].split("?")[0]);
      await access(
        new URL("." + (path.endsWith("/") ? path + "index.html" : path), root),
      );
    }
  }
});
test("sitemap index separates pages, palettes, guides and actual page images", async () => {
  const index = await read("sitemap.xml");
  assert.match(index, /<sitemapindex /);
  for (const kind of ["pages", "palettes", "guides", "images"])
    assert.ok(index.includes(`/sitemaps/${kind}.xml`));
  const urls = [];
  for (const kind of ["pages", "palettes", "guides"]) {
    const xml = await read(`sitemaps/${kind}.xml`);
    assert.match(xml, /xmlns:xhtml=/);
    for (const match of xml.matchAll(
      /<loc>https:\/\/copyhex.haking.tr([^<]+)<\/loc>/g,
    ))
      urls.push(match[1]);
  }
  assert.equal(urls.length, 456);
  assert.equal(new Set(urls).size, 456);
  assert.ok(
    urls.every(
      (url) => !url.endsWith("/favorites/") && !url.endsWith("/palettes/"),
    ),
  );
  const images = await read("sitemaps/images.xml");
  assert.match(images, /xmlns:image=/);
  for (const m of images.matchAll(
    /<image:loc>https:\/\/copyhex.haking.tr([^<]+)<\/image:loc>/g,
  ))
    await access(new URL("." + m[1], root));
});
test("manifest icons and project license are present", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons)
    await access(new URL("." + icon.src, root));
  assert.equal(JSON.parse(await read("package.json")).version, VERSION);
  assert.match(await read("LICENSE"), /MIT License/);
  assert.match(await read("licenses/color-names-MIT.txt"), /David Aerne/);
});

test("navigation has one grouped tools entry and localized theme controls", async () => {
  const { navigation } = await import("../js/navigation.js");
  const { messages } = await import("../js/i18n.js");
  const { localeCodes } = await import("../js/locales.js");
  for (const lang of localeCodes) {
    const t = (k) => messages[lang][k],
      html = navigation(t, lang, "brand");
    assert.equal((html.match(/theme-builder\//g) || []).length, 1);
    assert.equal((html.match(/\/studio\//g) || []).length, 1);
    assert.match(html, /<details /);
    assert.ok(html.includes(t("toolsMenu")));
    assert.ok(!html.includes("undefined"));
  }
});
