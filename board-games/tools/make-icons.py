"""Render original Board Games app icon at PWA sizes; requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[1] / 'assets'
im = Image.new('RGB', (1024, 1024), '#fbf6ea')
d = ImageDraw.Draw(im)
d.rounded_rectangle((156,156,868,868),120,fill='#e6ddc7')
for x,y in [(204,204),(536,204),(204,536),(536,536)]:
    d.rounded_rectangle((x,y,x+284,y+284),52,fill='#fffcf4')
for points in [(284,284,408,408),(408,284,284,408)]:
    d.line(points,fill='#ee8669',width=50)
    for x,y in [points[:2],points[2:]]: d.ellipse((x-25,y-25,x+25,y+25),fill='#ee8669')
d.ellipse((566,566,786,786),outline='#65beac',width=50)
d.polygon([(680,264),(698,314),(752,318),(710,354),(722,406),(678,378),(632,406),(644,354),(602,318),(656,314)],fill='#f1bc55')
for x in [314,382]: d.ellipse((x-14,652,x+14,680),fill='#7770a7')
d.arc((296,672,396,742),0,180,fill='#7770a7',width=14)
for size in [192,512]: im.resize((size,size),Image.Resampling.LANCZOS).save(root/f'icon-{size}.png')
