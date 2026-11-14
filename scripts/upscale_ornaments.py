from PIL import Image, ImageFilter, ImageEnhance
import os

src_path = 'c:/Users/Admin/.gemini/antigravity/brain/43d9c775-1dab-4bdb-8d9b-3c1d86fa5c71/.user_uploaded/media_1794389022781_b5c17f67.png'
out_path = 'assets/trymalora_jeweled_ornaments_set_hd.png'

img = Image.open(src_path).convert('RGBA')
print('Original size:', img.size)

# Upscale 4x with Lanczos resampling
upscaled = img.resize((img.width * 4, img.height * 4), Image.Resampling.LANCZOS)

# Apply subtle unsharp mask to bring out crystalline edges without noise
sharpened = upscaled.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=3))

# Slightly boost color vibrancy for sparkling crystals and pearls
rgb = sharpened.convert('RGB')
enhancer = ImageEnhance.Color(rgb)
enhanced_color = enhancer.enhance(1.15)
contrast_enhancer = ImageEnhance.Contrast(enhanced_color)
final_img = contrast_enhancer.enhance(1.08)

# Re-attach alpha if any or save as crisp PNG
final_img.save(out_path, format='PNG', quality=95)
print('Saved HD image to:', out_path, 'Size:', final_img.size)

