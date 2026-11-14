---
name: ultra-media-performance
description: Optimize ULTRA OVERNIGHT Shopify image/video assets with safe local preprocessing, correct compression, responsive delivery and licensing checks. Use for hero, product detail, lifestyle, cutaway and mobile images.
---
# ULTRA OVERNIGHT: Media Performance

References: Claude Super Kit `media-processing/SKILL.md` (FFmpeg, ImageMagick concepts), existing ECC media and front-end performance guidance. Do NOT install or run arbitrary scripts from third-party bundles. Do not download competitors' creatives for publication without rights.

## Asset SOP
- Maintain a source provenance ledger: owner-created, licensed, supplier-authorized, mockup/concept; copyright and usage permission recorded.
- Preserve master originals outside the published theme; create optimized derivatives with deterministic names and sizes.
- Product hero: responsive Shopify `image_url` + `image_tag`, `widths`, `sizes`, constrained dimensions and alt text; avoid huge CSS backgrounds for primary product.
- Photos: WebP/AVIF when Shopify delivery supports it; JPEG fallback when needed; never destroy needed transparency.
- Cutaways: optimized PNG/WebP with transparent alpha; avoid showing internal tested performance not yet validated.
- Videos: MP4 H.264 baseline compatibility (plus modern fallback if supported), muted/pause controls, poster image, no surprise autoplay audio. Compress with FFmpeg only in an approved local environment.
- Use short story clips, captions and transcript; don't use video as the sole carrier of sizing/care details.
- Load hero eagerly when above fold; defer below-fold images/video. Avoid render blocking assets and layout shifts.

## QA
Compare original and optimized visual detail, product color/variant consistency, alt labels, keyframes, media resolution, loading behavior and approximate network transfer. Audit desktop and mobile Lighthouse/Web Vitals when tools available; don't fabricate scores.

## Deployment safety
Media processing is offline; changes to `assets/` only on draft/isolated branch. No paid APIs, no credentials or external uploader without authorization.
