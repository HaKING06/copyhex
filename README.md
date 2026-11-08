# CopyHex

![CopyHex — Find your color. Build your palette.](assets/copyhex-poster.png)

**A focused color workspace for developers, designers and curious makers.**

[Website](https://copyhex.haking.tr) · [Color studio](https://copyhex.haking.tr/studio/) · [Guide](https://copyhex.haking.tr/guide/) · [Support](mailto:copyhex@haking.tr)

Version **1.0.1** · MIT licensed · English / Türkçe · No runtime dependencies

## What you can do

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

## Cloudflare Pages

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

English and Turkish share the same URLs, with browser detection and a stored language preference. There are no separate language URLs or misleading `hreflang` entries.

## Data, privacy and limits

Palettes, favorites, recent colors, selected color, language and theme are stored under the existing `copyhex-v1` localStorage key, preserving 1.0.0 collections. JSON backups keep the compatible `version: 1` data format; application version is independently **1.0.1**.

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

See [CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md) and [SECURITY.md](SECURITY.md). Project code is [MIT licensed](LICENSE); preserve the separate upstream data notice when redistributing the catalog. The CopyHex poster was generated with OpenAI ImageGen and reviewed for the correct brand/domain. The existing vector logo is reused for application icons.

---

## Türkçe

CopyHex, renk kodu bulmak, HEX/RGB/HSL değerlerini anlık kopyalamak ve projeye özel renk paletleri oluşturmak için hazırlanmıştır. 1.0.1 sürümünde 6.000 özgün HEX rengi, gelişmiş filtreler, kalıcı koyu tema, ana menüden erişilen renk stüdyosu, renk uyumları, rehber ve kurulabilir uygulama desteği bulunur.

Türkçe tarayıcıda ilk açılış Türkçe; diğer tarayıcı dillerinde İngilizcedir. Son seçilen dil ve görünüm korunur. Menü dili ne olursa olsun İngilizce isim veya Türkçe renk ailesi ile arama yapılabilir.

Çalıştırmak için `npm run dev`, test için `npm test`, yayın çıktısı için `npm run build`. Cloudflare Pages çıktı klasörü `dist` olmalıdır. Ana adres **https://copyhex.haking.tr**, destek **copyhex@haking.tr**.

Kayıtlar tarayıcıdadır. Cihaz değiştirmeden önce JSON yedeğini indir. GitHub push, Cloudflare domain bağlantısı ve Search Console doğrulaması depo sahibinin kontrolündedir.
