import os
from PIL import Image, ImageDraw, ImageFont

brands_dir = 'public/brands'

# 10. SHURE
# Shure official logo: heavy black bold condensed italic or geometric uppercase "SHURE" with underline
def make_shure():
    w, h = 360, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Draw SHURE official typography using crisp vector-like geometry
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/impact.ttf', 62)
    except:
        font = ImageFont.load_default()
    d.text((45, 14), 'SHURE', fill=(15, 23, 42, 255), font=font)
    # Official horizontal bar under letters
    d.rectangle([45, 82, 315, 87], fill=(15, 23, 42, 255))
    im.save(os.path.join(brands_dir, 'shure.png'))
    print('Created shure.png')

# 11. SENNHEISER
# Sennheiser official logo: the trapezoid / waveform mark + SENNHEISER
def make_sennheiser():
    w, h = 380, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Trapezoid mark
    # Outer rounded rect
    d.rounded_rectangle([30, 24, 90, 84], radius=8, outline=(15, 23, 42, 255), width=6)
    # The 'S' sound wave inside
    d.line([(44, 68), (56, 40), (64, 40), (76, 68)], fill=(15, 23, 42, 255), width=5)
    # Wordmark
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 38)
    except:
        font = ImageFont.load_default()
    d.text((106, 35), 'SENNHEISER', fill=(15, 23, 42, 255), font=font)
    im.save(os.path.join(brands_dir, 'sennheiser.png'))
    print('Created sennheiser.png')

# 12. YAMAHA
# Yamaha official logo: 3 interlocking tuning forks inside circle + YAMAHA
def make_yamaha():
    w, h = 360, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Circle emblem
    cx, cy, r = 60, 54, 28
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(15, 23, 42, 255), width=5)
    # Tuning forks center
    d.line([(cx, cy), (cx, cy - r + 4)], fill=(15, 23, 42, 255), width=4)
    d.line([(cx - 7, cy - r + 8), (cx, cy - 8), (cx + 7, cy - r + 8)], fill=(15, 23, 42, 255), width=4)
    d.line([(cx, cy), (cx - 20, cy + 16)], fill=(15, 23, 42, 255), width=4)
    d.line([(cx, cy), (cx + 20, cy + 16)], fill=(15, 23, 42, 255), width=4)
    # Wordmark
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 44)
    except:
        font = ImageFont.load_default()
    d.text((105, 30), 'YAMAHA', fill=(15, 23, 42, 255), font=font)
    im.save(os.path.join(brands_dir, 'yamaha.png'))
    print('Created yamaha.png')

# 13. JBL
# JBL official logo: orange rounded square with '!' mark + JBL
def make_jbl():
    w, h = 340, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Orange badge
    d.rounded_rectangle([35, 18, 115, 92], radius=12, fill=(234, 56, 41, 255))
    # Exclamation mark dot & bar
    d.ellipse([50, 32, 68, 50], fill=(255, 255, 255, 255))
    d.rounded_rectangle([78, 28, 92, 82], radius=6, fill=(255, 255, 255, 255))
    # JBL text
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/ariblk.ttf', 60)
    except:
        font = ImageFont.load_default()
    d.text((130, 18), 'JBL', fill=(15, 23, 42, 255), font=font)
    im.save(os.path.join(brands_dir, 'jbl.png'))
    print('Created jbl.png')

# 14. BEHRINGER
# Behringer: triangle with ear + behringer
def make_behringer():
    w, h = 360, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Inverted triangle
    pts = [(60, 20), (25, 88), (95, 88)]
    d.polygon(pts, fill=(245, 158, 11, 255))
    d.line(pts + [(60, 20)], fill=(15, 23, 42, 255), width=3)
    # Ear curve
    d.arc([42, 40, 78, 80], start=120, end=350, fill=(15, 23, 42, 255), width=4)
    # Text
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 38)
    except:
        font = ImageFont.load_default()
    d.text((115, 34), 'behringer', fill=(15, 23, 42, 255), font=font)
    im.save(os.path.join(brands_dir, 'behringer.png'))
    print('Created behringer.png')

# 15. KÖNİG
def make_konig():
    w, h = 340, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Crown icon
    crown = [(170, 22), (182, 34), (195, 16), (208, 34), (220, 22), (216, 42), (174, 42)]
    d.polygon(crown, fill=(217, 119, 6, 255))
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/ariblk.ttf', 44)
    except:
        font = ImageFont.load_default()
    d.text((80, 42), 'KÖNİG', fill=(15, 23, 42, 255), font=font)
    im.save(os.path.join(brands_dir, 'konig.png'))
    print('Created konig.png')

# 16. GOLD AUDIO
def make_gold_audio():
    w, h = 360, 110
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Gold audio circle
    d.ellipse([30, 28, 84, 82], outline=(217, 119, 6, 255), width=5)
    d.line([(45, 55), (69, 55)], fill=(217, 119, 6, 255), width=5)
    d.line([(57, 43), (57, 67)], fill=(217, 119, 6, 255), width=5)
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/ariblk.ttf', 34)
    except:
        font = ImageFont.load_default()
    d.text((98, 38), 'GOLD AUDIO', fill=(15, 23, 42, 255), font=font)
    im.save(os.path.join(brands_dir, 'gold-audio.png'))
    print('Created gold-audio.png')

make_shure()
make_sennheiser()
make_yamaha()
make_jbl()
make_behringer()
make_konig()
make_gold_audio()
