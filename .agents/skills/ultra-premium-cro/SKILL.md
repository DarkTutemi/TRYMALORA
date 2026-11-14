---
name: ultra-premium-cro
description: Plan and improve Premium Feminine Shopify homepage, product detail page, bundles and ads-to-landing conversion for ULTRA OVERNIGHT. Use on UX/copy/design changes in the flagship experience.
---
# ULTRA OVERNIGHT: Premium Feminine CRO

Adapted conceptually from Claude Super Kit `copywriter.md`, `content/cro.md`, `plan/cro.md`; use the repo's existing `frontend-design`, `taste-skill`, `shopify-theme-architect` for actual implementation.

## Brand intention
Premium feminine, warm and comfortable, never clinical or fear-mongering. Cream, muted rose and restrained plum are starting mood references, not immutable brand-approved tokens. Balance premium aesthetics with measurable clarity: legible contrast, generous negative space, natural editorial photography, visible honest pricing.

## Message-first landing
1. Above fold: visual of ULTRA OVERNIGHT, promise centered on anxiety of unexpected night leaks, single high-contrast `Shop ULTRA OVERNIGHT` CTA; avoid portraying untested outcomes as guaranteed.
2. Translate verified/structural features into benefits; 5-layer cutaway visual should mark target performance as pending until sample testing.
3. Position Full-Spine Shield and SideSeal as intended solution to back/side gaps; use video only if filmed/accurate; do not create fake test footage.
4. Size & fit: size chart, panty dimensions, absorption level clearly defined, fit and care directions. Include underwear hygiene/material information and limitations.
5. Bundle 3/5 options: customer should understand count, actual discount, shipping threshold and AOV. Do not assume real purchase AOV from offer price.
6. Objection preemption: wash instructions, discomfort/bulk, how much flow, heavy-night use, shipping ETA, refund policy on hygiene items. Be accurate on refund eligibility.
7. Proof: authentic reviews/ratings with provenance, lab documents if approved. Use no fake countdown, live visitor counters or fabricated claims.
8. Mobile: one clear sticky CTA, no overlap, target ≥44px tap area; product gallery lazy-loaded with correct alt text.

## Writing workflow
- Identify target audience/pain from documented research, with date and citations for external claims.
- Draft `headline / subheadline / bullets / CTA / objections / FAQ` with variants; mark claims requiring evidence review.
- Maintain message match from ad hook to landing headline and hero image; do not lead visitors to stale old products.
- Create A/B hypothesis one variable at a time, with intended observed metric and stopping rule; never assert a lift percentage without test data.

## Design implementation
- Section and block schemas must expose headings, imagery, trust proof slots, CTA labels and bundle text to Shopify Theme Editor.
- Namespace CSS `.uo-*` and avoid shared JS mutation. Preserve old PDP CSS and price computation.
- Browser-check hero at 375/390/414/768/1440, including font load, focus order and real device screenshots.

## Exit criterion
Prominent product offer, credible proof, accessible layouts, native Shopify cart parity and zero accidental legacy product discovery.
