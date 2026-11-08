# CopyHex

Renk bulma, dönüştürme ve proje paletleri oluşturma aracı. Public adres: https://cophex.haking.tr — destek: cophex@haking.tr.

## Yerelde çalıştırma

Node.js 20+ ile bağımlılık kurmadan:

```sh
npm run dev
```

http://127.0.0.1:4173 adresini açın. ES modülleri kullanıldığı için HTML dosyasını doğrudan çift tıklayarak açmayın.

```sh
npm test
npm run build
```

## Cloudflare Pages

GitHub deposunu Cloudflare Pages'e bağlayın. Framework: None. Build command: `npm run build`. Build output directory: `dist`. Root directory: depo kökü. Ortam değişkeni veya API anahtarı gerekmez. Pages özel alan adı ayarlarına `cophex.haking.tr` ekleyin; Cloudflare'ın gösterdiği DNS kaydını uygulayın ve HTTPS sertifikası tamamlandığında kontrol edin. Bu proje henüz push edilmedi veya yayınlanmadı.

## Özellikler

- 148 CSS renk adı ve ilave Amethyst rengi; Gray/Grey yazım alternatifleri dahil.
- 16.777.216 opak RGB rengini HEX, RGB veya HSL girdisi ve yerel renk seçiciyle açma.
- Menü dilinden bağımsız İngilizce isim, Türkçe renk ailesi ve çevrilmiş isim bileşenleriyle arama. Her RGB renginin standart bir ismi yoktur.
- HEX, RGB, HSL, yaklaşık CMYK kopyalama; WCAG AA normal metin kontrast kontrolü.
- Favoriler, proje adı ve notlarıyla paletler, paletten renk kaldırma, palet düzenleme/silme.
- CSS değişkenleri dışa aktarma, JSON yedekleme ve mevcut koleksiyonu koruyan JSON içe aktarma.
- İlk ziyarette Türkçe tarayıcıya Türkçe, diğer dillere İngilizce; sonraki ziyaretlerde kullanıcının son seçimi.
- Mobil yerleşim, klavye odağı, Escape ile kapanan diyaloglar, aramaya `/` kısayolu.

## Veri ve gizlilik

Favoriler, paletler ve dil yalnızca o tarayıcının localStorage alanında tutulur. Üyelik, sunucu veritabanı veya cihazlar arası senkronizasyon yoktur. Tarayıcı verisi silinirse kayıtlar silinir; JSON yedeğini indirin. Başka bir cihazda içe aktarabilirsiniz. Google Fonts fontları yüklenir; analitik veya takip betiği kullanılmaz. CMYK matematiksel dönüşümdür; profesyonel baskıda ICC profiliyle doğrulayın.

## Dosyalar

`index.html`: belge ve SEO. `css/style.css`: responsive arayüz. `js/app.js`: uygulama ve localStorage. `js/colors.js`: katalog. `js/color-utils.js`: dönüşümler ve kontrast. `js/i18n.js`: çeviriler. `assets/logo.svg`: özgün vektör logo. `_headers`: Cloudflare güvenlik başlıkları. `tests/`: dönüşüm ve veri doğrulama testleri. `original-index.html`: önceki sayfanın arşivi; build çıktısına girmez.

Testler: dönüşüm sınırları, geçersiz değerler, kontrast, katalog tutarlılığı. Tarayıcıda Türkçe/İngilizce arama, özel renk favorileme ve palete ekleme, yeniden yüklemede dil ve kayıtların korunması, 390px mobil yatay taşma kontrol edildi.
