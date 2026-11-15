import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "C:/Users/Admin/Desktop/TRYMALORA/assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Base files
lace_src_path = "C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/.user_uploaded/media_1794719479886_7b7da85f.jpg"
shorts_src_path = "C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/.user_uploaded/media_1794719524857_8e9f869c.jpg"

def make_square_1000(src_img, bg_color=(253, 248, 247), crop_box=None, zoom=1.0):
    """Creates a 1000x1000 square image with subtle luxury background and proper padding."""
    if crop_box:
        img = src_img.crop(crop_box)
    else:
        img = src_img.copy()
        
    canvas = Image.new("RGB", (1000, 1000), bg_color)
    
    # Calculate aspect ratio
    w, h = img.size
    scale = min(920 / w, 920 / h) * zoom
    new_w = int(w * scale)
    new_h = int(h * scale)
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center paste
    offset_x = (1000 - new_w) // 2
    offset_y = (1000 - new_h) // 2
    canvas.paste(img_resized, (offset_x, offset_y))
    return canvas

def add_header_badge(canvas, title, subtitle):
    draw = ImageDraw.Draw(canvas)
    # Background card at top
    draw.rectangle([0, 0, 1000, 90], fill=(75, 32, 56)) # Deep Plum
    
    # Draw simple text
    # Try default or simple bitmap font
    try:
        font_title = ImageFont.truetype("arial.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 16)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    draw.text((40, 20), title, fill=(255, 255, 255), font=font_title)
    draw.text((40, 56), subtitle, fill=(242, 219, 219), font=font_sub)

def create_lace_assets():
    lace_img = Image.open(lace_src_path)
    w, h = lace_img.size # 680, 603
    
    # 1. Hero (1:1 full view)
    hero = make_square_1000(lace_img, bg_color=(253, 248, 247))
    hero.save(os.path.join(OUTPUT_DIR, "ultra-lace-hero.jpg"), quality=95)
    
    # 2. Lace Detail Crop (Focus on hip floral lace)
    detail_crop = lace_img.crop((180, 100, 520, 440))
    detail = make_square_1000(detail_crop, bg_color=(250, 243, 242), zoom=1.1)
    add_header_badge(detail, "ULTRA LACE™ · LUXURY FLORAL EMBROIDERY", "Breathable, Skin-Friendly Intimate Lace Detailing")
    detail.save(os.path.join(OUTPUT_DIR, "ultra-lace-detail.jpg"), quality=95)
    
    # 3. Fit & Cut View (Waistband & rear coverage)
    fit_crop = lace_img.crop((100, 80, 650, 550))
    fit = make_square_1000(fit_crop, bg_color=(253, 248, 247), zoom=1.05)
    add_header_badge(fit, "ULTRA LACE™ · MID-WAIST ERGONOMIC FIT", "Smooth-Drape Contoured Rear & Hip Coverage")
    fit.save(os.path.join(OUTPUT_DIR, "ultra-lace-fit.jpg"), quality=95)
    
    # 4. Five-Layer Technology Infographic
    tech_canvas = Image.new("RGB", (1000, 1000), (255, 255, 255))
    draw = ImageDraw.Draw(tech_canvas)
    draw.rectangle([0, 0, 1000, 100], fill=(75, 32, 56))
    
    try:
        f_h1 = ImageFont.truetype("arial.ttf", 30)
        f_h2 = ImageFont.truetype("arial.ttf", 18)
        f_layer_t = ImageFont.truetype("arialbd.ttf", 20)
        f_layer_d = ImageFont.truetype("arial.ttf", 15)
    except:
        f_h1 = f_h2 = f_layer_t = f_layer_d = ImageFont.load_default()
        
    draw.text((40, 22), "ULTRA LACE™ · 5-LAYER ABSORBENT SYSTEM", fill=(255, 255, 255), font=f_h1)
    draw.text((40, 62), "Everyday Elegance with Heavy-Cycle Overnight Security", fill=(242, 219, 219), font=f_h2)
    
    # Add thumbnail of product
    thumb = lace_img.resize((320, 280), Image.Resampling.LANCZOS)
    tech_canvas.paste(thumb, (40, 140))
    
    # 5 layer cards
    layers = [
        ("Layer 1: Soft Skin-Facing Top Sheet", "Ultra-breathable modal dry-touch layer stays whisper-soft and dry against delicate skin."),
        ("Layer 2: Rapid Directional Moisture Diffuser", "Channels fluid instantly away from the surface into the deeper absorption core."),
        ("Layer 3: Ultra-Lock™ High-Capacity Absorbent Core", "Traps and locks up to 40ml of liquid to prevent dampness or uncomfortable swelling."),
        ("Layer 4: Waterproof Breathable Microporous Barrier", "Impermeable to liquid while allowing heat and vapor to escape freely for all-day freshness."),
        ("Layer 5: Premium Floral Lace & Silky Outer Shell", "Feminine lace accents combined with lightweight stretch knit that won't show under clothing.")
    ]
    
    y = 450
    colors_box = [(253, 245, 245), (250, 240, 242), (253, 245, 245), (250, 240, 242), (253, 245, 245)]
    for i, (l_title, l_desc) in enumerate(layers):
        draw.rectangle([40, y, 960, y + 90], fill=colors_box[i], outline=(220, 195, 205), width=1)
        draw.text((60, y + 15), l_title, fill=(75, 32, 56), font=f_layer_t)
        draw.text((60, y + 45), l_desc, fill=(60, 60, 60), font=f_layer_d)
        y += 105
        
    tech_canvas.save(os.path.join(OUTPUT_DIR, "ultra-lace-five-layers.jpg"), quality=95)
    
    # 5. Color Palette Card
    color_canvas = Image.new("RGB", (1000, 1000), (253, 248, 247))
    draw_c = ImageDraw.Draw(color_canvas)
    draw_c.rectangle([0, 0, 1000, 100], fill=(75, 32, 56))
    draw_c.text((40, 22), "ULTRA LACE™ · CURATED COLOR PALETTE", fill=(255, 255, 255), font=f_h1)
    draw_c.text((40, 62), "Available in 5 Elegant Feminine Shades", fill=(242, 219, 219), font=f_h2)
    
    lace_colors = [
        ("Black", (26, 26, 26), "Midnight Classic"),
        ("Red", (139, 38, 62), "Berry Crimson"),
        ("Skin", (232, 196, 162), "Soft Warm Nude"),
        ("Grey", (138, 138, 142), "Dove Heather Grey"),
        ("Pink", (228, 164, 178), "Blush Petal Pink")
    ]
    
    for i, (c_name, c_rgb, c_sub) in enumerate(lace_colors):
        cy = 160 + i * 160
        # Card background
        draw_c.rectangle([40, cy, 960, cy + 130], fill=(255, 255, 255), outline=(230, 210, 215), width=1)
        # Color circle
        draw_c.ellipse([70, cy + 25, 150, cy + 105], fill=c_rgb, outline=(180, 160, 170), width=2)
        # Texts
        draw_c.text((180, cy + 35), c_name, fill=(75, 32, 56), font=f_layer_t)
        draw_c.text((180, cy + 70), c_sub + " · Sizes XS to 4XL", fill=(100, 100, 100), font=f_layer_d)
        
    color_canvas.save(os.path.join(OUTPUT_DIR, "ultra-lace-colors.jpg"), quality=95)
    print("✓ ULTRA LACE assets generated successfully.")

def create_shorts_assets():
    shorts_img = Image.open(shorts_src_path)
    w, h = shorts_img.size # 361, 579
    
    # 1. Hero (1:1 full view)
    hero = make_square_1000(shorts_img, bg_color=(250, 250, 252), zoom=0.95)
    hero.save(os.path.join(OUTPUT_DIR, "ultra-shorts-hero.jpg"), quality=95)
    
    # 2. Waistband & Ribbed Elastic Detail Crop
    waist_crop = shorts_img.crop((40, 100, 320, 380))
    waist = make_square_1000(waist_crop, bg_color=(245, 246, 250), zoom=1.1)
    add_header_badge(waist, "ULTRA COMFORT SHORTS™ · HIGH-WAIST RIBBED BAND", "Zero-Roll Comfort Waistband with Anti-Chafe Fit")
    waist.save(os.path.join(OUTPUT_DIR, "ultra-shorts-waistband.jpg"), quality=95)
    
    # 3. Leg Coverage View
    leg_crop = shorts_img.crop((20, 240, 350, 560))
    leg = make_square_1000(leg_crop, bg_color=(250, 250, 252), zoom=1.1)
    add_header_badge(leg, "ULTRA COMFORT SHORTS™ · EXTENDED LEG COVERAGE", "Smooth Thigh Hug That Eliminates Gapping & Leaks")
    leg.save(os.path.join(OUTPUT_DIR, "ultra-shorts-leg-coverage.jpg"), quality=95)
    
    # 4. Five-Layer Technology Infographic
    tech_canvas = Image.new("RGB", (1000, 1000), (255, 255, 255))
    draw = ImageDraw.Draw(tech_canvas)
    draw.rectangle([0, 0, 1000, 100], fill=(75, 32, 56))
    
    try:
        f_h1 = ImageFont.truetype("arial.ttf", 30)
        f_h2 = ImageFont.truetype("arial.ttf", 18)
        f_layer_t = ImageFont.truetype("arialbd.ttf", 20)
        f_layer_d = ImageFont.truetype("arial.ttf", 15)
    except:
        f_h1 = f_h2 = f_layer_t = f_layer_d = ImageFont.load_default()
        
    draw.text((40, 22), "ULTRA COMFORT SHORTS™ · 5-LAYER EXTENDED CORE", fill=(255, 255, 255), font=f_h1)
    draw.text((40, 62), "More Coverage. More Comfort. More Freedom All Night Long.", fill=(242, 219, 219), font=f_h2)
    
    thumb = shorts_img.resize((180, 280), Image.Resampling.LANCZOS)
    tech_canvas.paste(thumb, (80, 140))
    
    layers = [
        ("Layer 1: Seamless Ultra-Soft Inner Liner", "Breathable, frictionless bamboo modal knit prevents chafing on inner thighs."),
        ("Layer 2: Fast-Wicking Moisture Transfer Mesh", "Transfers sudden heavy surges away from the body in under 3 seconds."),
        ("Layer 3: Extended High-Density Absorbent Core", "Expands further down the leg openings and full rear for 50ml high-capacity retention."),
        ("Layer 4: 360° Waterproof Sealed Shield", "Full-coverage leakproof membrane guards front, central gusset, and upper thighs."),
        ("Layer 5: Microfiber No-Trace Outer Shorts", "Wear alone as bedtime loungewear or under pajama bottoms without panty lines.")
    ]
    
    y = 450
    colors_box = [(248, 248, 252), (242, 244, 250), (248, 248, 252), (242, 244, 250), (248, 248, 252)]
    for i, (l_title, l_desc) in enumerate(layers):
        draw.rectangle([40, y, 960, y + 90], fill=colors_box[i], outline=(210, 215, 230), width=1)
        draw.text((60, y + 15), l_title, fill=(75, 32, 56), font=f_layer_t)
        draw.text((60, y + 45), l_desc, fill=(60, 60, 60), font=f_layer_d)
        y += 105
        
    tech_canvas.save(os.path.join(OUTPUT_DIR, "ultra-shorts-five-layers.jpg"), quality=95)
    
    # 5. Color Palette Card (6 colors: Green, Black, Grey, Yellow, Pink, Red)
    color_canvas = Image.new("RGB", (1000, 1000), (250, 250, 252))
    draw_c = ImageDraw.Draw(color_canvas)
    draw_c.rectangle([0, 0, 1000, 100], fill=(75, 32, 56))
    draw_c.text((40, 22), "ULTRA COMFORT SHORTS™ · 6 SIGNATURE COLORS", fill=(255, 255, 255), font=f_h1)
    draw_c.text((40, 62), "Designed for Restful Lounging & Complete Sleep Security", fill=(242, 219, 219), font=f_h2)
    
    shorts_colors = [
        ("Grey", (138, 138, 142), "Heathered Studio Grey"),
        ("Black", (26, 26, 26), "Midnight Carbon Black"),
        ("Green", (62, 107, 82), "Sage Forest Green"),
        ("Yellow", (232, 185, 72), "Warm Sunrise Gold"),
        ("Pink", (228, 164, 178), "Soft Petal Rose"),
        ("Red", (139, 38, 62), "Ruby Crimson")
    ]
    
    for i, (c_name, c_rgb, c_sub) in enumerate(shorts_colors):
        cy = 120 + i * 140
        draw_c.rectangle([40, cy, 960, cy + 115], fill=(255, 255, 255), outline=(220, 225, 235), width=1)
        draw_c.ellipse([70, cy + 20, 145, cy + 95], fill=c_rgb, outline=(170, 175, 190), width=2)
        draw_c.text((170, cy + 25), c_name, fill=(75, 32, 56), font=f_layer_t)
        draw_c.text((170, cy + 60), c_sub + " · Sizes XS to 4XL", fill=(100, 100, 100), font=f_layer_d)
        
    color_canvas.save(os.path.join(OUTPUT_DIR, "ultra-shorts-colors.jpg"), quality=95)
    print("✓ ULTRA COMFORT SHORTS assets generated successfully.")

create_lace_assets()
create_shorts_assets()
