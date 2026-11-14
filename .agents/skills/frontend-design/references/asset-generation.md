# Asset Generation Workflow (Antigravity Edition)

Workflow for creating design-aligned storefront assets without leaving Antigravity.

## Generation Workflow

### Step 1: Define Design Context
Before creating visual assets, capture from the product/section brief:
- **Aesthetic direction:** Luxury editorial, Nordic craft, clean clinical showroom, etc.
- **Color palette & lighting:** Match existing Shopify theme tokens (`--zv-*` / `--tm-*`).
- **Framing & aspect ratio:** Hero (`16:9` or `4:3`), gallery square (`1:1`), upsell/thumbnail (`1:1`), mobile story (`3:4`).

### Step 2: Generate or Enhance Assets
1. **New Lifestyle / Editorial Graphics:** Invoke Antigravity's built-in **`image-generator`** subagent with a concrete product/lighting/texture prompt and save into `assets/` or `artifacts`.
2. **Existing Product Thumbnails Too Small for Zoom:** Upscale cleanly with Python Pillow (`Image.Resampling.LANCZOS` + subtle `UnsharpMask`) so high-res zoom lightboxes render crisply without inventing fake product details.
3. **Inspect Quality Visually:** Read the generated/edited image directly with `read_file` to verify craftsmanship, framing, and brand harmony before uploading to Shopify Theme Assets.
