import json,pathlib
from PIL import Image,ImageDraw,ImageFont
palettes=json.loads(pathlib.Path('data/collections.json').read_text(encoding='utf-8'))
def font(size,bold=False):
 candidates=['C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
 for file in candidates:
  if pathlib.Path(file).exists(): return ImageFont.truetype(file,size)
 return ImageFont.load_default(size=size)
for p in palettes:
 im=Image.new('RGB',(1200,720),'#151722');d=ImageDraw.Draw(im);d.text((54,31),'CopyHex',font=font(32,True),fill='#f7f5ff');d.text((54,87),p['name'],font=font(22),fill='#b8b6c9')
 for i,h in enumerate(p['colors']):
  x=54+round(i*1092/len(p['colors']));right=54+round((i+1)*1092/len(p['colors']));d.rectangle((x,155,right,595),fill=h);d.text((x+14,613),h,font=font(21),fill='#f7f5ff')
 d.text((54,661),'copyhex.haking.tr',font=font(17),fill='#a5a2b7');im.save('assets/palettes/'+p['id']+'.png',optimize=True)
