from PIL import Image, ImageFilter
import numpy as np

for i in range(1, 10):
    im = Image.open(f'public/brands/card_{i}.png').convert('RGBA')
    # 4x upscale with Lanczos
    w, h = im.size
    up = im.resize((w * 4, h * 4), Image.Resampling.LANCZOS)
    
    # Save upscaled card
    up.save(f'public/brands/brand_card_{i}.png')
    
    # Also let's extract just the inner logo by trimming card borders
    # Inner region of card is approximately x in [12*4, (w-12)*4], y in [10*4, (h-10)*4]
    inner = up.crop((12 * 4, 8 * 4, (w - 12) * 4, (h - 8) * 4))
    
    # Make near-white background transparent
    arr = np.array(inner)
    # Check white background mask
    mask = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240)
    arr[mask, 3] = 0
    
    res = Image.fromarray(arr)
    bbox = res.getbbox()
    if bbox:
        trimmed = res.crop(bbox)
        trimmed.save(f'public/brands/logo_clean_{i}.png')
        print(f"Card {i} inner logo trimmed: {trimmed.size}")

print("Done processing cards.")
