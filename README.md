# CopyHex

![CopyHex — Colors that work together.](assets/copyhex-poster.png)

**A focused color workspace for developers, designers and curious makers.**

[Website](https://copyhex.haking.tr) · [Color studio](https://copyhex.haking.tr/studio/) · [Guide](https://copyhex.haking.tr/guide/) · [Support](mailto:copyhex@haking.tr)

Version **1.0.3** · MIT licensed · 12 languages · No runtime dependencies

## What you can do

- Build coordinated light/dark brand themes, semantic roles and 50–950 OKLCH shade scales from one seed.
- Preview dashboard, storefront, portfolio and mobile layouts with optional color-vision simulations.
- Export themes as CSS (HEX or OKLCH) or DTCG color tokens with typed sRGB components.
- Create 2–8-stop linear/radial gradients in sRGB or OKLab; copy CSS or export SVG/PNG.
- Sample a screen pixel with EyeDropper where supported (HTTPS and explicit user gesture required); native color inputs remain available.
- Keep up to 20 local palette snapshots, compare changes and restore a prior snapshot as a new version.
- Share a palette snapshot in a URL fragment (up to 128 colors), then save or customize a personal copy. Links contain palette name/colors/version/date, never private notes. They do not provide cloud storage or live collaboration.

- Discover **24 original curated palettes**, with dedicated detail pages and SVG/PNG references.
- Customize ready-made palettes and save personal copies.
- Generate 3–8-color schemes from a seed; lock colors, regenerate one column or the remaining palette, compare four alternatives and undo/redo.
- Extract a local image palette without uploading the image; preview colors in a UI and check actual text/background pairs.
- Export working palettes as CSS, JSON, SVG or PNG and share their color/lock state in a link.
- Explore **6,000 distinct HEX colors**, with duplicate HEX values merged and alternative names searchable.
- Search English names, Turkish color families/common color words, HEX, RGB or HSL codes.
- Combine color-family, lightness, saturation and CSS-collection filters. Sort by name, hue, lightness or nearest RGB color; paginate 24/48/96 results.
- Fine-tune any of **16,777,216 opaque 8-bit RGB colors** with a native picker and live RGB/HSL sliders.
- Copy HEX, RGB, HSL and approximate CMYK; share a direct color link such as `/studio/?color=8B7CF8`.
- Save favorites and project palettes with names and notes. Generate complementary, analogous or triadic palettes.
- Export CSS variables or JSON backups; import backups while preserving existing data.
- Check WCAG AA/AAA contrast for normal text.
- Use light, dark or system appearance. Theme and language preferences persist.
- Install as a PWA on supported browsers and use essential tools offline after a successful first load.

## Local development

Requires **Node.js 20.11+**. No API keys, package installation or backend required.

```sh
npm run dev
```

Open [localhost:4173](http://127.0.0.1:4173). Use HTTP rather than double-clicking `index.html`; the application uses ES modules.

```sh
npm test          # color conversions, catalog uniqueness, aliases and filters
npm run build    # crawlable HTML, dist/ and versioned service worker
node server.mjs --dist  # preview the exact production build
```

Only run one server on port 4173 at a time. Run `npm run build` after source changes when verifying the production build or offline cache. A new service worker waits for the user to select **Update app** before replacing an active version. Keep only one local preview for the same origin when testing updates.

## Current Cloudflare deployment

The existing site uses **Workers Builds**, Worker `copyhex`, connected to `HaKING06/copyhex` on `main`. Its build command is `npm run build`, and its deploy command is `npx wrangler deploy`. A commit message is only a label; it does not update `package.json`. Check the commit SHA in the build details when diagnosing an outdated deployment.

### Alternative: Cloudflare Pages

1. Push this repository to GitHub and connect it to Cloudflare Pages.
2. Framework preset: **None**.
3. Build command: **`npm run build`**.
4. Build output directory: **`dist`**; project root is the repository root.
5. Add **`copyhex.haking.tr`** in Pages → Custom domains. Follow Cloudflare's DNS verification steps and wait for HTTPS activation.
6. Open `/`, `/studio/`, `/about/` and `/guide/` directly. Check theme persistence, installation and offline reload.

No environment variables or secrets are required. `_headers` sets a same-origin CSP and security headers. Images, fonts and application code use this origin only; no external font requests are made. The build never publishes development scripts, test data or the original page archive.

### Search visibility

Each public page has readable initial HTML, a unique title and description, canonical URL, Open Graph/Twitter metadata and JSON-LD. `/sitemap.xml` lists public content; `/robots.txt` allows crawling. Personal palettes and favorites use `noindex` because they exist only in the visitor's browser.

After publishing, verify domain ownership in **Google Search Console** and submit `https://copyhex.haking.tr/sitemap.xml`. Use URL inspection to request indexing. This requires the owner's account and is not performed by this project. Search engines decide when and how pages appear; ranking or immediate indexing is not guaranteed. Keyword stuffing and hidden search terms are intentionally avoided.

All 12 supported languages have separate, fully rendered locale URLs, including `/en/`, `/tr/`, `/ru/` and `/ar/` with reciprocal `hreflang` and self-canonical metadata. Explicit locale URLs display that language; the root entry still uses the saved preference or browser language. The sitemap index references four maps: public tools, curated palette pages, editorial guides and actual page images.

There are **492 localized entry pages**: 456 indexable public pages and 36 private-workspace entries marked noindex. Each of the 24 palettes has an original name, colors, use notes, a customization link and a genuine SVG/PNG preview. Five localized practical guides add substantive use information. Pages are internally linked and can be read without JavaScript; interactive tools require JavaScript. No invented rating or ranking claim is included.

## Data, privacy and limits

Palettes, favorites, recent colors, selected color, language and theme are stored under the existing `copyhex-v1` localStorage key, preserving 1.0.0 collections. The generator keeps its latest working draft separately under `copyhex-generator-v1`. It is not part of the full collection backup until saved as a project palette. JSON backups keep the compatible `version: 1` data format; application version is independently **1.0.3**.

There is **no account, cloud database or cross-device sync**. Export JSON before clearing browser data or moving devices. Offline caches are separate from saved palettes. The hosting provider may retain request logs under its own policies. The application includes no analytics or advertising trackers.

Community color labels are not necessarily CSS keywords. Use the **CSS classics** filter for standard names; copy numeric color codes for general use. Turkish family and common color-word search is supported, but the complete community naming dataset is not translated.

CMYK is a mathematical approximation, not an ICC-managed conversion. Nearest-color sorting uses Euclidean RGB distance, not perceptual Delta E. Contrast checks target normal text; they do not replace a full accessibility audit. Installation UI varies by browser. On iOS, use Share → Add to Home Screen.

## Color data provenance

The catalog combines the original CSS entries with a deterministic, hue/lightness-distributed selection from [Color Names by David Aerne and contributors](https://github.com/meodai/color-names). The bundled snapshot has 32,004 source records; the shipped catalog has exactly 6,000 unique HEX values. CSS aliases remain searchable. Conflicting CSS/community labels are disambiguated with `(Community)`.

- Source snapshot: [`data/source-colors.csv`](data/source-colors.csv)
- Retrieval date, SHA-256 and selection method: [`data/source.json`](data/source.json)
- Upstream license notice: [`licenses/color-names-MIT.txt`](licenses/color-names-MIT.txt)
- Rebuild the committed catalog deterministically: `npm run catalog`

The catalog script uses the bundled snapshot and never fetches data during a production build. Update the source file deliberately, preserve its license and review changes before regenerating.

## Project structure

```text
index.html / studio/ / about/ / guide/   Crawlable entry documents
favorites/ / palettes/                  Personal workspace entry documents
js/app.js                              Routing, state and collection actions
js/catalog.js                          Indexed search and filter logic
js/studio.js                           Live color workspace and harmonies
js/color-utils.js                      Parsing, conversion and contrast
js/i18n.js / js/info-pages.js           Bilingual interface and editorial content
js/theme-init.js / js/pwa.js            Early theme and app lifecycle
css/style.css                          Responsive light/dark styles
assets/                                Logo, PWA icons, share/brand poster
scripts/                               Catalog and static HTML generation
build.mjs / sw.js                       Production packaging and offline worker
_headers / manifest.webmanifest        Cloudflare policies and PWA metadata
tests/                                 Node test suite
```

## Contributing & licensing

See [CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md) and [SECURITY.md](SECURITY.md). Project code is [MIT licensed](LICENSE); preserve the separate upstream data notice when redistributing the catalog. Two CopyHex campaign posters were generated with OpenAI ImageGen and reviewed for correct CopyHex capitalization and domain. The 24 palette preview pairs and educational SVG diagrams are generated from project color data and original code. The existing vector logo is reused for application icons.

---

## Türkçe

CopyHex, renk kodu bulmak, HEX/RGB/HSL değerlerini anlık kopyalamak ve projeye özel renk paletleri oluşturmak için hazırlanmıştır. 1.0.1 sürümünde 6.000 özgün HEX rengi, gelişmiş filtreler, kalıcı koyu tema, ana menüden erişilen renk stüdyosu, renk uyumları, rehber ve kurulabilir uygulama desteği bulunur.

Desteklenen 12 tarayıcı dilinden biri otomatik seçilir; desteklenmeyen tarayıcı dillerinde İngilizce açılır. Son seçilen dil ve görünüm korunur. Dilin açıkça belirtildiği adresler o dilde açılır. Renk aileleri 12 dilde aranabilir; katalogdaki CSS ve topluluk renk adları da aranabilir.

Çalıştırmak için `npm run dev`, test için `npm test`, yayın çıktısı için `npm run build`. Cloudflare Pages çıktı klasörü `dist` olmalıdır. Ana adres **https://copyhex.haking.tr**, destek **copyhex@haking.tr**.

Kayıtlar tarayıcıdadır. Cihaz değiştirmeden önce JSON yedeğini indir. GitHub push, Cloudflare domain bağlantısı ve Search Console doğrulaması depo sahibinin kontrolündedir.


## Palette workspace and search structure

- `/en/discover/` / `/tr/discover/`: curated palettes, mood filters and search.
- `/en/palette-generator/` / `/tr/palette-generator/`: local smart generator, locks, image extraction, exports and design preview.
- `/{locale}/collections/{slug}/`: 24 reusable palette directions, each with a PNG and SVG.
- `/{locale}/resources/` and `/{locale}/learn/{slug}/`: localized practical guides and artwork.
- `/sitemap.xml`: sitemap index; `/sitemaps/pages.xml`, `palettes.xml`, `guides.xml`, `images.xml` hold the actual entries.

New modules: `js/collections.js`, `js/discovery.js`, `js/palette-engine.js`, `js/generator.js`, `js/resources.js`, `js/seo.js`. New styles live in `css/workspace.css`.

`npm run assets` regenerates the palette SVG files and JSON data from the authored collection. The committed PNG previews can be recreated with `python scripts/render-palette-previews.py` when Python/Pillow are installed; this optional authoring step is not required to build or deploy. No image-generation API runs in production.

Research and the implementation rationale: [docs/research-2026-11-08.md](docs/research-2026-11-08.md).

The smart generator is a local harmony engine, not an external AI service. It does not promise objectively perfect combinations or automatic accessibility. Share links contain colors, locks, mode and mood; they do not include private notes. All-locked palettes remain unchanged. Shrinking the palette cannot discard a locked trailing color until it is unlocked.

### Artwork prompts

OpenAI ImageGen was used in built-in mode for `assets/copyhex-palette-discovery.png`: premium dark editorial launch banner, exact brand **CopyHex**, headline **Colors that work together.**, domain **copyhex.haking.tr**, and sage/ivory/spruce/gold/terracotta swatch cards. `assets/copyhex-smart-palette-generator.png`: exact **CopyHex**, **One color. Endless palettes.**, **copyhex.haking.tr**, with one lilac swatch branching into three harmonious palette options. No version number is displayed in either banner. The first poster is also used as the default `copyhex-poster.png` alias.


## Global localization

CopyHex is English-first and supports **English, Turkish, Russian, Spanish, French, German, Portuguese, Simplified Chinese, Japanese, Korean, Arabic and Hindi**. This is a broad international language set, not a claim of a definitive popularity ranking.

Each language has 317 complete interface messages, localized search examples, color-family search terms, palette names, public-page metadata and reciprocal language links. Arabic uses RTL layout; color codes remain LTR. Community/CSS color identifiers retain their standard names. Shared reference artwork remains English-branded; the surrounding captions and controls are localized.

`js/locales.js` is the single registry for routing, browser detection and language options. Priority is explicit locale URL, saved valid preference, supported primary browser language, then English. Unsupported browser languages such as Swedish or Italian fall back to English. Device storage remains backward compatible.

Translation sources live in `data/localization/`. Run `npm run locales` with Python to rebuild the committed dictionaries and palette names, then `npm run build`. Production builds need Node only; no translation API or external service is used at runtime. Original English/Turkish long guides are retained; additional languages have concise localized editions covering the same practical tasks.

The palette engine now assigns stable harmony offsets and lightness roles, evaluates each new swatch against existing/locked colors and favors useful separation without maximizing unrelated RGB distance. Single-color regeneration and locked-color guarantees are preserved. Decorative gradients and hover motion are kept outside actual color-reference surfaces and respect reduced-motion preferences.

Essential locale workspaces are precached; the full localized content is generated for crawling without forcing every article/detail document into the initial app cache.


Application version is maintained in `package.json`. The build generates `js/version.js`; About pages, structured data and the offline-cache version use that value. Git commit messages and release names do not change the application version.

## Color science references

Oklab conversions follow [Björn Ottosson’s reference](https://bottosson.github.io/posts/oklab/); sRGB transfer functions follow [CSS Color 4](https://www.w3.org/TR/css-color/). Out-of-gamut OKLCH colors are mapped by reducing chroma while retaining lightness and hue. Shades use a fixed perceptual lightness progression; the seed remains available separately.

Color-vision previews use the full-severity Machado matrices in linear sRGB; grayscale uses relative luminance. These are approximate simulations and do not modify exported colors or contrast calculations. Semantic role contrast is checked against its stated surface; arbitrary combinations and real page content still need review.

[EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) availability varies by browser. [DTCG format](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/) exports use typed color values rather than informal HEX-only objects.
