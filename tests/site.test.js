import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
test("public entry documents have unique canonical URLs and readable initial content", async () => {
  for (const slug of ["", "studio/", "about/", "guide/"]) {
    const html = await read(slug + "index.html");
    assert.ok(html.includes(`href="https://copyhex.haking.tr/${slug}"`));
    assert.match(html, /<h1>/);
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.ok(!html.includes("cophex"));
  }
  for (const slug of ["favorites/", "palettes/"])
    assert.match(await read(slug + "index.html"), /noindex,follow/);
});
test("manifest icons exist and version stays consistent", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons)
    await access(new URL(".." + icon.src, import.meta.url));
  assert.equal(JSON.parse(await read("package.json")).version, "1.0.1");
  assert.match(await read("LICENSE"), /MIT License/);
  assert.match(await read("licenses/color-names-MIT.txt"), /David Aerne/);
});
