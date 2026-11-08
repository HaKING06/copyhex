export const articles = [
  {
    id: "color-harmonies",
    title: "Color harmonies: how to choose colors that work together",
    tr: "Renk uyumları: birlikte çalışan renkler nasıl seçilir?",
    description:
      "A practical guide to analogous, complementary, split-complementary, triadic and monochromatic color palettes.",
    descriptionTr:
      "Komşu, tamamlayıcı, ayrık tamamlayıcı, üçlü ve tek renkli paletler için uygulamalı rehber.",
    image: "/assets/graphics/locked-palette-workflow.svg",
    sections: [
      [
        "Start with a relationship, not a rule",
        "Bir ilişkiyle başla",
        "Color harmony describes relationships between hues. It is a useful starting point for exploring a palette, rather than a promise that every combination will work in every design. Lightness, saturation, color area and neighboring surfaces change how a palette feels. Choose an anchor color, then decide whether the project needs quiet continuity or a stronger contrast.",
        "Renk uyumu, tonlar arasındaki ilişkileri tanımlar. Her birleşimin her tasarımda çalışacağını garanti etmez; keşfe bir başlangıç verir. Açıklık, doygunluk, kullanılan alan ve komşu yüzeyler paletin hissini değiştirir. Bir ana renk seç, sonra projenin sakin süreklilik mi güçlü karşıtlık mı istediğine karar ver.",
      ],
      [
        "Compare five useful directions",
        "Beş yararlı yönü karşılaştır",
        "Analogous schemes use neighboring hues for continuity. Complementary schemes use opposite hues for a stronger contrast. Split-complementary schemes use two neighbors of the opposite hue. Triadic schemes spread three hue families around the wheel. Monochromatic schemes keep a single hue and create variation through lightness and saturation. Try several directions before choosing one.",
        "Komşu paletler süreklilik için yakın tonları kullanır. Tamamlayıcı paletler karşıt tonlarla güçlü bir denge kurar. Ayrık tamamlayıcı, karşıt rengin iki komşusunu kullanır. Üçlü paletler çember boyunca üç ton ailesine yayılır. Tek renkli paletler aynı tonda açıklık ve doygunlukla çeşitlenir. Seçimden önce birkaç yönü dene.",
      ],
      [
        "Keep an anchor and introduce neutrals",
        "Ana rengi koru ve nötrler ekle",
        "A practical interface rarely needs every color at maximum saturation. Keep one recognisable anchor, use quieter surfaces and reserve a vivid shade for emphasis. In the generator, lock the anchor so it stays unchanged as you explore alternatives. If a palette becomes visually noisy, reduce saturation or try a balanced mood.",
        "Bir arayüzde tüm renklerin en yüksek doygunlukta olması gerekmez. Tanınan bir ana rengi koru, sakin yüzeyler kullan ve canlı tonu vurguya ayır. Oluşturucuda ana rengi kilitle; alternatifler değişirken o aynı kalır. Palet yorucu görünüyorsa doygunluğu azalt veya dengeli ruh halini dene.",
      ],
      [
        "Check the actual pairs you will use",
        "Kullanacağın gerçek çiftleri kontrol et",
        "Hue harmony does not guarantee readable text. Check the foreground/background combinations you intend to use. A pale accent can be useful as a decorative surface and still fail for small text on white. Use CopyHex’s contrast table to compare each swatch against a chosen background, then inspect the palette in the live design preview.",
        "Ton uyumu okunaklı metni garanti etmez. Kullanacağın yazı/arka plan çiftlerini kontrol et. Açık bir vurgu dekoratif yüzeyde iyi çalışabilir, beyaz üzerinde küçük yazıda yetersiz kalabilir. Kontrast tablosunda her tonu seçtiğin arka planla karşılaştır, sonra canlı tasarım önizlemesini incele.",
      ],
    ],
  },
  {
    id: "build-a-brand-color-palette",
    title: "Build a brand color palette from one starting color",
    tr: "Bir başlangıç renginden marka paleti oluştur",
    description:
      "Keep your brand color fixed, explore alternatives, assign roles and export a reusable project palette.",
    descriptionTr:
      "Marka rengini sabitle, seçenekleri keşfet, rolleri belirle ve yeniden kullanılabilir paletini dışa aktar.",
    image: "/assets/copyhex-smart-palette-generator.png",
    sections: [
      [
        "Define a starting point",
        "Bir başlangıç noktası belirle",
        "Begin with a color connected to the brand or the product. Enter its HEX value in the generator and choose “Build around this”. CopyHex locks that first swatch, so regenerating the palette does not replace your starting point. You can also customize a ready-made palette from discovery if you prefer to begin with an established direction.",
        "Marka veya ürünle ilişkili bir renkle başla. HEX değerini oluşturucuya gir ve “Bu renkle oluştur” seçeneğini kullan. İlk renk kilitlenir; yeniden üretim başlangıcını değiştirmez. Hazır bir yönle başlamak istersen keşiften bir paleti özelleştirebilirsin.",
      ],
      [
        "Explore alternatives without losing progress",
        "İlerlemeni kaybetmeden alternatifleri keşfet",
        "Choose a harmony and mood, then generate several options. Lock a second color when it feels right. Change only one column when the rest of the palette already works. Undo and redo let you compare previous directions without reconstructing them. All-locked palettes are intentionally preserved; unlock a swatch before requesting more changes.",
        "Uyumu ve ruh halini seçip birkaç seçenek üret. Doğru bulduğun ikinci rengi kilitle. Paletin geri kalanı hazırsa yalnızca tek sütunu değiştir. Geri al ve yinele ile eski yönlere yeniden kurmadan dönebilirsin. Tüm renkler kilitliyse palet korunur; değişim istemeden önce bir kilidi aç.",
      ],
      [
        "Assign roles instead of adding more colors",
        "Daha fazla renk yerine roller belirle",
        "Treat the palette as a small system: a background, a readable foreground, a primary action, an accent and a secondary surface. The exact number of colors is less important than clear roles. Review contrast and try the design preview before deciding. Colors used for status should have additional cues such as text or icons.",
        "Paleti küçük bir sistem olarak ele al: arka plan, okunaklı yazı, ana aksiyon, vurgu ve ikincil yüzey. Renk sayısından çok rollerin netliği önemlidir. Seçmeden önce kontrastı ve tasarım önizlemesini kontrol et. Durum bildiren renklerin yanında metin veya simge gibi ek ipuçları kullan.",
      ],
      [
        "Save a working copy and hand it off",
        "Çalışma kopyasını kaydet ve paylaş",
        "Save the palette with a project name and notes. Download CSS for implementation, JSON for structured values, SVG for editable artwork or PNG for a visual handoff. Shareable links carry the colors and locks in the URL; they do not publish your private project notes. Back up your personal collection separately as JSON.",
        "Paleti proje adı ve notlarla kaydet. Uygulama için CSS, yapılandırılmış değerler için JSON, düzenlenebilir görsel için SVG veya görsel teslim için PNG indir. Paylaşım bağlantısı renkleri ve kilitleri URL içinde taşır; özel proje notlarını yayınlamaz. Kişisel koleksiyonunu ayrıca JSON olarak yedekle.",
      ],
    ],
  },
  {
    id: "accessible-color-palettes",
    title: "Accessible color palettes: check contrast before you ship",
    tr: "Erişilebilir renk paletleri: yayınlamadan önce kontrastı kontrol et",
    description:
      "Understand WCAG text contrast, distinguish decoration from readable text, and review actual palette pairs.",
    descriptionTr:
      "WCAG metin kontrastını anla, dekoratif renkle okunaklı metni ayır ve gerçek palet çiftlerini değerlendir.",
    image: "/assets/graphics/color-contrast-guide.svg",
    sections: [
      [
        "Contrast is a relationship between two colors",
        "Kontrast iki renk arasındaki ilişkidir",
        "A color is not accessible or inaccessible by itself. Text readability depends on its background, text size, weight and context. A palette can contain beautiful shades that should not be paired for small text. Test the pairs that your design actually uses, including hover and disabled states where applicable.",
        "Bir renk tek başına erişilebilir ya da erişilemez değildir. Okunabilirlik; arka plana, metin boyutuna, kalınlığına ve bağlama bağlıdır. Güzel tonlardan oluşan bir palette küçük metin için birlikte kullanılmaması gereken çiftler bulunabilir. Tasarımındaki gerçek çiftleri ve ilgili etkileşim durumlarını test et.",
      ],
      [
        "Use the right thresholds",
        "Doğru eşikleri kullan",
        "WCAG AA requires at least 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text. Large text is generally 18 point regular or 14 point bold, approximately 24 CSS pixels or 18.7 CSS pixels. CopyHex labels its generator table for normal-text AA.",
        "WCAG AA normal metinde en az 4,5:1, büyük metinde 3:1 ister. AAA normal metinde 7:1, büyük metinde 4,5:1 ister. Büyük metin genellikle 18 punto normal veya 14 punto kalın; yaklaşık 24 CSS piksel veya 18,7 CSS pikseldir. Oluşturucudaki AA etiketi normal metin içindir.",
      ],
      [
        "Separate decorative colors from functional colors",
        "Dekoratif renkleri işlevsel renklerden ayır",
        "A low-contrast pastel may be suitable for a nonessential decoration, while a form label needs a readable pair. Controls and meaningful graphics have their own requirements; a text ratio alone does not validate the entire interface. Do not communicate errors, selection or chart categories with color alone. Include labels, patterns or shapes.",
        "Düşük kontrastlı bir pastel gereksiz bir süs için uygun olabilir; form etiketi ise okunaklı bir çift ister. Kontroller ve anlamlı grafiklerin ayrı gereksinimleri vardır; tek bir metin oranı arayüzün tamamını doğrulamaz. Hata, seçim ve grafik kategorilerini yalnızca renkle anlatma; etiket, desen veya biçim ekle.",
      ],
      [
        "Review the final screen",
        "Son ekranı incele",
        "The generator provides a useful contrast calculation, but it is not a full accessibility audit. Check the final typography, focus indicators, keyboard interactions and content states. Review with actual users when possible. A harmonious palette is a design resource; accessible implementation comes from how you apply it.",
        "Oluşturucu yararlı bir kontrast hesabı sunar, tam erişilebilirlik denetimi değildir. Son tipografiyi, odak göstergelerini, klavye etkileşimlerini ve içerik durumlarını kontrol et. Mümkünse gerçek kullanıcılarla değerlendir. Uyumlu palet bir tasarım kaynağıdır; erişilebilirlik onu nasıl uyguladığına bağlıdır.",
      ],
    ],
  },
  {
    id: "extract-colors-from-an-image",
    title: "Extract a color palette from an image without uploading it",
    tr: "Görseli yüklemeden renk paleti çıkar",
    description:
      "Create a reusable color direction from a local photo or graphic, refine the results and export your palette.",
    descriptionTr:
      "Yerel fotoğraf veya grafikten renk yönü oluştur, sonuçları düzenle ve paletini dışa aktar.",
    image: "/assets/palettes/coastal-blue.png",
    sections: [
      [
        "Choose an image with a clear direction",
        "Belirgin bir yönü olan görsel seç",
        "A photo, mood board or illustration can provide a useful color starting point. Choose an image whose overall feeling matches the project. Large dominant areas influence extraction more strongly than tiny details. The extracted colors describe the image; they do not automatically create a balanced interface system.",
        "Fotoğraf, ilham panosu veya illüstrasyon yararlı bir başlangıç verir. Genel hissi projene uyan bir görsel seç. Geniş baskın alanlar, küçük ayrıntılardan daha çok etki eder. Çıkarılan renkler görseli tanımlar; otomatik olarak dengeli bir arayüz sistemi oluşturmaz.",
      ],
      [
        "Extract privately on your device",
        "Cihazında özel olarak çıkar",
        "In the palette generator, choose a PNG, JPEG or WebP under 10 MB. CopyHex samples a small version on your device and groups nearby colors. The image is not sent to a server. Transparent pixels are ignored; very simple images may yield fewer distinct colors than a detailed photo.",
        "Oluşturucuda 10 MB altında PNG, JPEG veya WebP seç. CopyHex küçük bir örneği cihazında inceler ve yakın renkleri gruplar. Görsel sunucuya gönderilmez. Saydam pikseller yok sayılır; basit görseller ayrıntılı fotoğraflardan daha az özgün renk verebilir.",
      ],
      [
        "Refine the sampled colors",
        "Örneklenen renkleri düzenle",
        "Extracted colors start locked to preserve what came from the image. Unlock the columns you want to explore and generate compatible alternatives. Add a readable dark or light neutral when the original image has only similar mid-tones. Use the contrast table to review actual text combinations.",
        "Görselden gelen renkleri korumak için çıkarılan tonlar kilitli başlar. Keşfetmek istediğin sütunların kilidini aç ve alternatifler üret. Görselde yalnızca benzer orta tonlar varsa okunaklı koyu veya açık bir nötr ekle. Gerçek metin çiftlerini kontrast tablosunda incele.",
      ],
      [
        "Use only images you have permission to use",
        "Kullanma iznin olan görselleri seç",
        "A palette is a starting point for original design work. Keep image permissions and brand guidelines in mind, especially when sharing a mood board or campaign. Save the colors to your own project palette and export the values you need. The source image itself is not included in CopyHex’s palette export.",
        "Palet, özgün tasarım için başlangıçtır. Özellikle ilham panosu veya kampanya paylaşırken görsel izinlerini ve marka kurallarını gözet. Renkleri kendi proje paletine kaydet ve gereken değerleri dışa aktar. Kaynak görsel palet çıktısına dahil edilmez.",
      ],
    ],
  },
  {
    id: "export-css-color-palettes",
    title: "Export color palettes for CSS, SVG, PNG and JSON",
    tr: "Renk paletlerini CSS, SVG, PNG ve JSON olarak dışa aktar",
    description:
      "Choose the right palette export format for implementation, editable artwork, design review or structured data.",
    descriptionTr:
      "Uygulama, düzenlenebilir görsel, tasarım incelemesi ve veri için doğru palet çıktı biçimini seç.",
    image: "/assets/palettes/ink-and-paper.png",
    sections: [
      [
        "CSS for implementation",
        "Uygulama için CSS",
        "CSS export creates custom properties such as --color-1 and --color-2 in a :root block. Rename them to meaningful roles in your project: --surface, --text or --accent. Numeric colors work reliably even when a community color name is not a valid CSS keyword.",
        "CSS çıktısı :root içinde --color-1 ve --color-2 gibi özel değişkenler oluşturur. Projende bunları --surface, --text veya --accent gibi anlamlı rollere dönüştür. Topluluk renk adı geçerli bir CSS anahtar kelimesi olmasa bile sayısal kodlar güvenle kullanılır.",
      ],
      [
        "SVG for editable, scalable artwork",
        "Düzenlenebilir ölçekli görsel için SVG",
        "SVG is useful for a palette sheet that must remain crisp at different sizes. CopyHex exports swatches and color labels as vector artwork. It is suitable for design documents and editable references. Keep the numeric HEX values as the source of truth when moving between applications with different color management.",
        "Farklı boyutlarda net kalması gereken palet sayfası için SVG uygundur. Renk blokları ve kodları vektör olarak çıkarılır. Tasarım belgeleri ve düzenlenebilir referanslarda kullanılabilir. Farklı renk yönetimi kullanan uygulamalar arasında HEX değerlerini temel referans olarak koru.",
      ],
      [
        "PNG for visual reviews",
        "Görsel inceleme için PNG",
        "PNG creates a simple palette image you can include in a project brief or message. The image includes the HEX values so the recipient can identify each swatch. A screenshot-like palette sheet is convenient for discussion, but code or JSON is more suitable when exact machine-readable values are needed.",
        "PNG; proje özeti veya mesajda paylaşılabilecek basit bir palet görseli oluşturur. HEX değerleri görselde bulunur. Görsel palet tartışma için kullanışlıdır; makine tarafından okunacak kesin değerlerde kod veya JSON daha uygundur.",
      ],
      [
        "JSON for data and backup",
        "Veri ve yedek için JSON",
        "A generated-palette JSON export contains that palette’s colors and name. A full collection backup in My palettes includes your saved palettes and favorites and can be reimported into CopyHex. These serve different purposes: use a full backup before changing devices or clearing browser storage.",
        "Oluşturucunun JSON çıktısı o paletin renklerini ve adını içerir. Paletlerim bölümündeki tam koleksiyon yedeği, kaydedilen paletler ve favorileri içerir ve içe aktarılabilir. Amaçları farklıdır: cihaz değiştirmeden veya tarayıcıyı temizlemeden önce tam yedek al.",
      ],
    ],
  },
];
const e = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function articlePage(id, t, lang) {
  const a = articles.find((x) => x.id === id);
  if (!a) return "";
  return `<section class="page-head"><a class="breadcrumb" href="/${lang}/resources/">← ${t("resources")}</a><p class="eyebrow">COPYHEX / FIELD NOTES</p><h1>${e(lang === "tr" ? a.tr : a.title)}</h1><p>${e(lang === "tr" ? a.descriptionTr : a.description)}</p></section><article class="prose"><figure class="article-figure"><img src="${a.image}" alt="${e(lang === "tr" ? a.tr : a.title)}" width="1200" height="720"><figcaption>${e(lang === "tr" ? a.descriptionTr : a.description)}</figcaption></figure>${a.sections.map(([h, tr, p, pt]) => `<section><h2>${e(lang === "tr" ? tr : h)}</h2><p>${e(lang === "tr" ? pt : p)}</p></section>`).join("")}<div class="article-links"><a href="/${lang}/palette-generator/">${t("generator")} →</a><a href="/${lang}/discover/">${t("discover")} →</a><a href="/${lang}/studio/">${t("studio")} →</a></div>${id === "accessible-color-palettes" ? '<p><a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" target="_blank" rel="noopener">W3C: Understanding contrast minimum ↗</a></p>' : ""}</article>`;
}
export function resourcesPage(t, lang) {
  return `<section class="page-head"><p class="eyebrow">COPYHEX / RESOURCES</p><h1>${lang === "tr" ? "Renklerle daha iyi çalış." : "Work better with color."}</h1><p>${lang === "tr" ? "Palet oluşturma, okunabilirlik ve tasarıma aktarım için uygulamalı rehberler." : "Practical guides to palette creation, readability and bringing your colors into a real design."}</p></section><div class="guide-grid">${articles.map((a) => `<article><img class="resource-thumb" src="${a.image}" alt="${e(lang === "tr" ? a.tr : a.title)}" loading="lazy" width="1200" height="720"><h2><a href="/${lang}/learn/${a.id}/">${e(lang === "tr" ? a.tr : a.title)} ↗</a></h2><p>${e(lang === "tr" ? a.descriptionTr : a.description)}</p></article>`).join("")}</div><section class="page-head"><h2>${lang === "tr" ? "CopyHex görselleri" : "CopyHex artwork"}</h2><p>${lang === "tr" ? "Palet keşfi ve oluşturucu için paylaşılabilir görseller." : "Shareable artwork for palette discovery and generation."}</p></section><div class="resource-grid">${[
    ["copyhex-palette-discovery", "Colors that work together."],
    ["copyhex-smart-palette-generator", "One color. Endless palettes."],
  ]
    .map(
      ([id, caption]) =>
        `<figure><img src="/assets/${id}.png" alt="CopyHex — ${caption}" width="1536" height="1024" loading="lazy"><figcaption>${caption} <a href="/assets/${id}.png" download>PNG ↓</a></figcaption></figure>`,
    )
    .join("")}</div>`;
}
