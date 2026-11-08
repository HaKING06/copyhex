import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1];base=json.loads((root/'data/localization/base.json').read_text(encoding='utf-8'));codes=['ru','es','fr','de','pt','zh','ja','ko','ar','hi'];messages={**base,**{c:{} for c in codes}}
for file in ['interface','marketing','editorial']:
 for line in (root/f'data/localization/{file}.tsv').read_text(encoding='utf-8-sig').splitlines():
  if not line or line.startswith('#'):continue
  parts=line.split('|');assert len(parts)==11,(file,parts[0],len(parts));key=parts[0].strip().replace('earth y','earthy')
  for code,text in zip(codes,parts[1:]):messages[code][key]=text
extra={
'language':['Language','Dil'],'skipContent':['Skip to content','İçeriğe geç'],
'accessibility':['Accessibility','Erişilebilirlik'],'workspace':['Color workspace','Renk çalışma alanı'],'collectionsLabel':['CopyHex collections','CopyHex koleksiyonları'],'fieldNotes':['Practical color guides','Uygulamalı renk rehberleri'],'artwork':['CopyHex artwork','CopyHex görselleri'],
'seoSummary':['Find HEX, RGB and HSL color codes. Create harmonious palettes, save shades and download color combinations with CopyHex.','CopyHex ile HEX, RGB ve HSL renk kodlarını bul. Uyumlu paletler oluştur, renkleri kaydet ve renk birleşimlerini indir.'],
'aboutIntro':['CopyHex is a free workspace for designers, developers and everyone who creates with color.','CopyHex; tasarımcılar, geliştiriciler ve renklerle üreten herkes için ücretsiz bir çalışma alanıdır.'],
'privacyNotice':['Palettes, favorites and settings stay in this browser without device sync. Export a backup before clearing browser data. Images are processed on your device.','Paletler, favoriler ve ayarlar bu tarayıcıda saklanır; cihazlar arasında eşitlenmez. Tarayıcı verilerini temizlemeden önce yedek al. Görseller cihazında işlenir.'],
'dataNotice':['6,000 unique HEX colors. Data: Color Names by David Aerne and contributors, MIT license. Community names are not necessarily CSS keywords.','6.000 benzersiz HEX rengi. Veri: David Aerne ve katkıcıların Color Names projesi, MIT lisansı. Topluluk adlarının hepsi CSS anahtar kelimesi değildir.'],
'harmonyArticle':['Color harmonies: how to combine colors','Renk uyumları: renkler nasıl birleştirilir?'],'brandArticle':['Build a brand palette from one color','Bir renkten marka paleti oluştur'],'accessibilityArticle':['Accessible color palettes and contrast','Erişilebilir renk paletleri ve kontrast'],'imageArticle':['Extract a color palette from an image','Görselden renk paleti çıkar'],'exportArticle':['Export palettes: CSS, SVG, PNG and JSON','Paletleri dışa aktar: CSS, SVG, PNG ve JSON'],
'harmonyLearning':['Analogous colors are neighbors, complementary colors are opposites, and triads use three hue families. Keep an anchor and vary lightness and saturation. Harmony alone does not guarantee readable text.','Komşu renkler yan yana, tamamlayıcılar karşıttır; üçlü uyum üç renk ailesini kullanır. Ana rengi koruyup açıklık ve doygunluğu değiştir. Uyum tek başına metnin okunaklı olmasını garanti etmez.'],
'contrastLearning':['WCAG AA requires 4.5:1 for normal text; AAA requires 7:1. For large text, AA requires 3:1. Review actual pairs and never communicate meaning through color alone.','WCAG AA normal metinde 4,5:1, AAA ise 7:1 ister. Büyük metinde AA eşiği 3:1’dir. Gerçek renk çiftlerini incele ve anlamı yalnızca renkle aktarma.'],
'exportLearning':['Use CSS for implementation, JSON for data, SVG for editable graphics and PNG for design review. Export the full collection backup separately from My palettes.','Uygulama için CSS, veri için JSON, düzenlenebilir görsel için SVG ve tasarım incelemesi için PNG kullan. Tam koleksiyon yedeğini Paletlerim bölümünden ayrıca dışa aktar.']}
for key,(en,tr) in extra.items():messages['en'][key]=en;messages['tr'][key]=tr
messages['en'].update(tip='Tip: search a color family in your language or paste HEX, RGB or HSL. English color names work too.',homeStats='6,000 colors · 24 palettes · 12 languages')
messages['tr'].update(tip='İpucu: “kırmızı”, “mavi” ya da HEX, RGB, HSL ile ara. İngilizce renk adlarını da kullanabilirsin.',homeStats='6.000 renk · 24 palet · 12 dil')
family=['red','pink','orange','yellow','green','blue','purple','brown','neutral'];colorLabels={
'ru':['Красный','Розовый','Оранжевый','Жёлтый','Зелёный','Синий','Фиолетовый','Коричневый','Нейтральный'],
'es':['Rojo','Rosa','Naranja','Amarillo','Verde','Azul','Morado','Marrón','Neutro'],
'fr':['Rouge','Rose','Orange','Jaune','Vert','Bleu','Violet','Marron','Neutre'],
'de':['Rot','Rosa','Orange','Gelb','Grün','Blau','Violett','Braun','Neutral'],
'pt':['Vermelho','Rosa','Laranja','Amarelo','Verde','Azul','Roxo','Marrom','Neutro'],
'zh':['红色','粉色','橙色','黄色','绿色','蓝色','紫色','棕色','中性色'],
'ja':['赤','ピンク','オレンジ','黄色','緑','青','紫','茶色','無彩色'],
'ko':['빨강','분홍','주황','노랑','초록','파랑','보라','갈색','중성'],
'ar':['أحمر','وردي','برتقالي','أصفر','أخضر','أزرق','بنفسجي','بني','محايد'],
'hi':['लाल','गुलाबी','नारंगी','पीला','हरा','नीला','बैंगनी','भूरा','तटस्थ']}
aliases={'eyebrow':'workspace','pickSub':'intro','noPalettes':'paletteTitle','noPalettesSub':'paletteIntro','noFav':'favTitle','noFavSub':'favIntro','made':'intro','deleteColor':'remove','removeColor':'remove','darkColors':'darkTheme','lightColors':'lightTheme','saveHarmony':'savePalette','shared':'copied','installTitle':'install','release':'version','studioCTA':'open','newVersion':'title','colorLink':'pick','online':'saved','resultsHint':'tip','backupTip':'local','detailsButton':'detail','myPalettes':'palettes','discoverEyebrow':'collectionsLabel','generatorEyebrow':'workspace','previewTitle':'paletteTitle','previewAction':'explore','previewLabel':'paletteName','previewBackground':'background','paletteLink':'sharePalette','savedPaletteNote':'local','swatch':'colorsNav','editHint':'lockedHint','mobileGenerate':'generate','adjust':'editColor','preview':'previewUI','savedFrom':'saved','tools':'studio','vibrant':'vivid'}
for code in codes:
 d=messages[code];d.update(zip(family,colorLabels[code]));d['hexLabel']='HEX / RGB / HSL'
 for key,target in aliases.items():d[key]=d[target]
 d['downloadSvg']=d['download']+' SVG';d['downloadPng']=d['download']+' PNG'
 missing=set(messages['en'])-set(d);assert not missing,(code,missing)
for code,d in messages.items():
 missing=set(messages['en'])-set(d);assert not missing,(code,missing)
(root/'js/i18n.js').write_text('// Generated from data/localization by scripts/build-locales.py.\nexport const messages = '+json.dumps(messages,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Generated',len(messages),'complete dictionaries,',len(messages['en']),'keys each.')


names={code:{} for code in codes}
for line in (root/'data/localization/collection-names.tsv').read_text(encoding='utf-8-sig').splitlines():
 if not line:continue
 parts=line.split('|');assert len(parts)==11
 for code,value in zip(codes,parts[1:]):names[code][parts[0]]=value
(root/'js/collection-names.js').write_text('export const collectionNames = '+json.dumps(names,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
