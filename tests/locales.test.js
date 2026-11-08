import test from "node:test";
import assert from "node:assert/strict";
import {
  locales,
  localeCodes,
  resolveLocale,
  colorWords,
} from "../js/locales.js";
import { messages } from "../js/i18n.js";
import { colors } from "../js/colors.js";
import { indexColors, filterColors } from "../js/catalog.js";
import { pageMetadata } from "../js/seo.js";
const index = indexColors(colors);
test("12 dictionaries have complete, nonempty key coverage", () => {
  assert.equal(locales.length, 12);
  const keys = Object.keys(messages.en).sort();
  for (const code of localeCodes) {
    assert.deepEqual(Object.keys(messages[code]).sort(), keys, code);
    for (const value of Object.values(messages[code]))
      assert.ok(typeof value === "string" && value.trim());
    assert.ok(!messages[code].tip.includes("undefined"));
  }
});
test("browser language detection, explicit URL and saved choice have stable precedence", () => {
  for (const code of localeCodes)
    assert.equal(resolveLocale({ browser: code + "-XX" }), code);
  assert.equal(resolveLocale({ browser: "sv-SE" }), "en");
  assert.equal(resolveLocale({ browser: "it-IT" }), "en");
  assert.equal(resolveLocale({ browser: "sv-SE", stored: "ru" }), "ru");
  assert.equal(
    resolveLocale({ path: "/ja/discover/", stored: "tr", browser: "ru-RU" }),
    "ja",
  );
  assert.equal(locales.find((l) => l.code === "ar").dir, "rtl");
});
test("color-family search works in every supported language", () => {
  for (const code of localeCodes) {
    for (const i of [0, 4, 5]) {
      const query = colorWords[code][i].split(" ")[0];
      const results = filterColors(index, { query });
      assert.ok(results.length > 10, code + " " + query);
    }
  }
});
test("native search metadata and canonical URLs exist for every locale", () => {
  for (const code of localeCodes) {
    const meta = pageMetadata("generator", code);
    assert.equal(meta.path, `/${code}/palette-generator/`);
    assert.ok(meta.title.includes("CopyHex"));
    assert.ok(meta.description.length > 30);
  }
  assert.match(pageMetadata("explore", "ru").description, /цвет/);
  assert.match(pageMetadata("explore", "zh").description, /颜色/);
});
