export function infoPage(kind, lang, count) {
  const tr = lang === "tr";
  if (kind === "about")
    return `<section class="page-head"><p class="eyebrow">COPYHEX / 1.0.1</p><h1>${tr ? "Renkten fikre.<br>Fikirden tasarıma." : "From color to idea.<br>From idea to design."}</h1><p>${tr ? "Yazılımcılar, tasarımcılar ve renklerle üreten herkes için açık bir çalışma alanı." : "An open color workspace for developers, designers and everyone who creates with color."}</p></section><div class="info-stats"><div><b>${count.toLocaleString(lang)}</b><span>${tr ? "benzersiz HEX rengi" : "unique HEX colors"}</span></div><div><b>16.7M</b><span>${tr ? "RGB olasılığı" : "RGB possibilities"}</span></div><div><b>1.0.1</b><span>${tr ? "güncel sürüm" : "current version"}</span></div></div><figure class="brand-poster"><img src="/assets/copyhex-poster.png" alt="CopyHex — Find your color. Build your palette." width="1536" height="1024" loading="lazy"><figcaption><a href="/assets/copyhex-poster.png" download>CopyHex / Brand poster ↓</a></figcaption></figure><article class="prose"><h2>${tr ? "CopyHex nedir?" : "What is CopyHex?"}</h2><p>${tr ? "CopyHex; renk kodu bulma, HEX, RGB, HSL ve CMYK değerlerini kopyalama ve projelere özel renk paletleri oluşturma aracıdır. Amaç, doğru rengi bulmakla onu kullanmak arasındaki adımları azaltmaktır." : "CopyHex helps you find color codes, copy HEX, RGB, HSL and CMYK values, and organize project palettes. It brings discovery, conversion and collection into one focused workspace."}</p><h2>${tr ? "1.0.1 ile gelenler" : "New in version 1.0.1"}</h2><ul><li>${tr ? "6.000 farklı HEX değeri, gelişmiş filtreler ve sayfalama." : "6,000 distinct HEX values, advanced filters and pagination."}</li><li>${tr ? "Kalıcı açık/koyu tema, canlı RGB/HSL kontrolleri ve renk uyumları." : "Persistent light/dark themes, live RGB/HSL controls and color harmonies."}</li><li>${tr ? "Kurulabilir uygulama, çevrimdışı araçlar ve paylaşılabilir renk bağlantıları." : "Installable app, offline tools and shareable color links."}</li><li>${tr ? "Kullanım rehberi, kaynak bilgisi ve yenilenen erişilebilir arayüz." : "Usage guide, source attribution and a refined accessible interface."}</li></ul><h2>${tr ? "Renk verisinin kaynağı" : "Color data and attribution"}</h2><p>${tr ? "Katalog, özgün CSS renkleri ve David Aerne ile katkıcıların hazırladığı Color Names projesinden seçilen renklerden oluşur. Aynı HEX değerleri birleştirilir; alternatif isimler aramada korunur. İsimler topluluk isimleridir; her biri CSS anahtar kelimesi değildir." : "The catalog combines the original CSS colors with a distributed selection from Color Names by David Aerne and contributors. Duplicate HEX values are merged; alternative names remain searchable. Community names are descriptive labels, not necessarily CSS keywords."} <a href="https://github.com/meodai/color-names" target="_blank" rel="noopener">Color Names ↗</a> · <a href="/licenses/color-names-MIT.txt">MIT ${tr ? "lisansı" : "license"}</a></p><p>${tr ? "Türkçe renk aileleri ve temel renk kelimeleri her iki arayüz dilinde aranabilir. Topluluk kataloğundaki tüm özel isimlerin Türkçe çevirisi yoktur. RGB aralığı opak 8 bit sRGB renklerini kapsar; ekranınızın renk yönetimi görünümü etkileyebilir." : "Turkish color families and common color words are searchable in either interface language. Community color names retain their original names. The RGB workspace covers opaque 8-bit sRGB colors; display color management can affect their appearance."}</p><h2 id="privacy">${tr ? "Gizlilik ve veri sahipliği" : "Privacy and your data"}</h2><p>${tr ? "Favoriler, paletler, tema, dil ve son renkler yalnızca cihazındaki tarayıcı depolamasına kaydedilir. Hesap, analiz betiği veya reklam takibi yoktur. Veriler başka cihazlara otomatik aktarılmaz. Tarayıcı verileri silinirse kayıtlar kaybolabilir; düzenli JSON yedeği al. Google Fonts kullanılmaz; arayüz cihazındaki yazı tiplerini kullanır. Yayın sağlayıcısı bağlantı isteklerini kendi politikalarına göre işleyebilir." : "Favorites, palettes, theme, language and recent colors stay in your browser storage on this device. There are no accounts, analytics scripts or advertising trackers. Your collection does not sync across devices. Clearing browser storage can remove it; export JSON backups regularly. System fonts avoid external font requests. The hosting provider may process connection requests under its own policies."}</p><h2>${tr ? "Açık kaynak" : "Open source"}</h2><p>${tr ? "CopyHex kodu MIT lisansı ile sunulur. Renk veri setinin lisans bildirimi ayrıca korunur." : "CopyHex code is available under the MIT license. The color dataset retains its separate license notice."} <a href="/LICENSE">MIT License ↗</a></p><h2>${tr ? "İletişim" : "Contact"}</h2><p>${tr ? "Hata bildirimi, erişilebilirlik geri bildirimi ve önerilerin için:" : "For bug reports, accessibility feedback and suggestions:"} <a href="mailto:copyhex@haking.tr">copyhex@haking.tr</a></p><a class="button-link primary" href="/guide/">${tr ? "Kullanım rehberini aç" : "Read the usage guide"} →</a></article>`;
  const items = tr
    ? [
        [
          "01",
          "Rengini bul",
          "Kütüphanede İngilizce renk ismi, Türkçe renk ailesi, HEX, rgb(34, 120, 200) veya hsl(210, 60%, 45%) ara. / tuşu aramaya odaklanır. Bir renk koduyla “Seçtiğin renge en yakın” sıralamasını kullanarak çevresindeki isimli tonları keşfet.",
        ],
        [
          "02",
          "6.000 rengi daralt",
          "Renk ailesini seç; açıklık, doygunluk ve koleksiyon filtrelerini birlikte kullan. Sayfa başına 24, 48 veya 96 renk gösterebilirsin. Sonuç bulamazsan filtreleri temizle.",
        ],
        [
          "03",
          "Kodunu tek dokunuşla kopyala",
          "Karttaki kodu seçili biçimde kopyala. Renk detaylarını açarak HEX, RGB, HSL ve yaklaşık CMYK değerlerinin her birini ayrı kopyalayabilirsin. CMYK bir baskı profili değildir; baskı için ICC profiliyle doğrula.",
        ],
        [
          "04",
          "Renk stüdyosunda üret",
          "Üst menüdeki Renk stüdyosu; renk seçici, RGB ve HSL kaydırıcıları ile çalışır. Değerler anlık değişir. Kalp ile favorilere, Palete kaydet ile projene ekle. Tamamlayıcı, komşu veya üçlü uyumu yeni bir palet olarak kaydet. Renk bağlantısını paylaş.",
        ],
        [
          "05",
          "Projelerini düzenle",
          "Paletlerim bölümünde projene isim ve not ekle. Keşfederken her rengi var olan palete ekleyebilir, renk kaldırabilir veya paleti yeniden adlandırabilirsin. CSS dışa aktarımı, --color-1 gibi değişkenleri hazırlar.",
        ],
        [
          "06",
          "Yedekle ve başka cihaza taşı",
          "Paletlerim → Yedeği dışa aktar ile JSON indir. Diğer cihazda Yedek içe aktar seçeneğini kullan. İçe aktarma mevcut koleksiyonunu korur; eklenen paletler yeni kimlik alır. Tarayıcı verisi silinmeden önce yedek al.",
        ],
        [
          "07",
          "Uygulama olarak kullan",
          "Üst menüdeki yükleme düğmesini kullan. Tarayıcı destekliyorsa kurulum penceresi açılır; aksi durumda kurulum adımları gösterilir. İlk başarılı çevrimiçi yüklemeden sonra araçlar çevrimdışı da çalışır.",
        ],
        [
          "08",
          "Okunaklı renkler seç",
          "Stüdyodaki kontrast kontrolünde yazı ve arka plan rengini karşılaştır. WCAG AA normal metin için en az 4.5:1 hedefle. Büyük metinde AA eşiği 3:1; AAA normal metinde 7:1’dir. Renge tek başına anlam yükleme.",
        ],
      ]
    : [
        [
          "01",
          "Find your color",
          "Search an English color name, Turkish color family, HEX, rgb(34, 120, 200) or hsl(210, 60%, 45%). Press / to focus search. Enter a color code and choose closest-color sorting to discover neighboring named shades.",
        ],
        [
          "02",
          "Narrow down 6,000 shades",
          "Combine a color family with lightness, saturation and collection filters. Display 24, 48 or 96 colors per page. Clear filters if your combination has no matches.",
        ],
        [
          "03",
          "Copy the format you need",
          "Click a card’s code to copy the selected format. Open color details for individual HEX, RGB, HSL and approximate CMYK values. CMYK is not a print profile: verify print output with your ICC workflow.",
        ],
        [
          "04",
          "Create in the color studio",
          "Open Color studio in the main navigation. Adjust the picker, RGB or HSL sliders and watch values update live. Save to favorites or a project palette, generate complementary, analogous or triadic harmonies, or share a color link.",
        ],
        [
          "05",
          "Organize project palettes",
          "Create a named palette with project notes in My palettes. Add colors while exploring, remove swatches and edit palette names. CSS export produces ready-to-use --color-1 variables.",
        ],
        [
          "06",
          "Back up and move devices",
          "Choose Export backup in My palettes to download JSON. Use Import backup on another device. Import keeps existing data and assigns new palette IDs. Back up before clearing browser storage.",
        ],
        [
          "07",
          "Install your workspace",
          "Use the install button in the header. Supporting browsers show an installation prompt; other browsers show instructions. After the first successful online load, the tools work offline.",
        ],
        [
          "08",
          "Check readable combinations",
          "Compare text and background colors in the studio. WCAG AA normal text requires at least 4.5:1. Large text AA requires 3:1; normal text AAA requires 7:1. Avoid relying on color alone to communicate meaning.",
        ],
      ];
  return `<section class="page-head"><p class="eyebrow">COPYHEX / ${tr ? "KULLANIM REHBERİ" : "FIELD GUIDE"}</p><h1>${tr ? "Bir rengi bul.<br>Bir fikir yarat." : "Find a color.<br>Make it yours."}</h1><p>${tr ? "İlk aramadan tamamlanan proje paletine, çalışma alanını tanı." : "From your first search to a finished project palette, get to know your workspace."}</p></section><div class="guide-grid">${items.map(([n, h, p]) => `<article><span>${n}</span><h2>${h}</h2><p>${p}</p></article>`).join("")}</div><section class="support-panel"><h2>${tr ? "Bir sorunun mu var?" : "Need a hand?"}</h2><p>${tr ? "Kullandığın tarayıcıyı ve sorunu anlatan adımları paylaş; birlikte çözelim." : "Tell us your browser and the steps that led to the issue so we can help."}</p><a class="button-link primary" href="mailto:copyhex@haking.tr">copyhex@haking.tr ↗</a><a class="button-link" href="/about/">${tr ? "Hakkında ve gizlilik" : "About & privacy"}</a></section>`;
}
