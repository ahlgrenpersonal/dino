"""Rebuild code-drawn PWA icons. Optional development dependency: Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "assets"
scale = 3
image = Image.new("RGB", (512 * scale, 512 * scale), "#f8f6ef")
draw = ImageDraw.Draw(image)


def ellipse(box, color):
    draw.ellipse(tuple(round(v * scale) for v in box), fill=color)


def rounded(box, radius, color):
    draw.rounded_rectangle(tuple(v * scale for v in box), radius * scale, fill=color)


rounded((169, 169, 342, 358), 65, "#77a99a")
ellipse((192, 121, 238, 201), "#77a99a")
ellipse((276, 121, 322, 201), "#77a99a")
ellipse((204, 214, 248, 270), "#fffdf3")
ellipse((269, 214, 313, 270), "#fffdf3")
ellipse((224, 241, 238, 255), "#294d48")
ellipse((279, 241, 293, 255), "#294d48")
ellipse((190, 271, 218, 287), "#a3c5a1")
ellipse((302, 271, 330, 287), "#a3c5a1")
draw.arc(tuple(v * scale for v in (241, 276, 279, 309)), 0, 180, fill="#345e53", width=6 * scale)
ellipse((340, 127, 390, 177), "#edbd68")
for size in (192, 512):
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f"icon-{size}.png")
print("Created 192px and 512px icons")
