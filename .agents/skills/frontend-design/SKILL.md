---
name: frontend-design
description: >-
  Create distinctive, high-converting, production-grade Shopify storefront interfaces, homepages,
  product pages, and landing sections with premium typography, visual hierarchy, spacing, and
  micro-interactions. Supports visual reference cloning by extracting exact design tokens from
  screenshots/pages via Chrome DevTools and `read_file` before writing Liquid/CSS/JS. Works smoothly
  alongside `taste-skill` and `shopify-theme-architect` while avoiding generic template aesthetics.
---

# Frontend Design & Storefront UI Direction

Design and build memorable, tactile, conversion-ready storefront interfaces tailored for Shopify Liquid OS 2.0 themes and modern web pages.

> **Working with `taste-skill`:** When designing brand-new landing pages or art direction from scratch, pair this skill with `.agents/skills/taste-skill` to pick distinctive compositions, palettes, and editorial photography without generic AI tropes.

## Input Workflows

### 1. Rebuilding from a Visual Reference / Screenshot / Store URL
When the user provides a reference URL, screenshot, or mock design:
1. **Inspect & Extract Design System First** (see `./references/design-extraction-overview.md` and `./references/extraction-prompts.md`):
   - Capture desktop & mobile screenshots via `chrome-devtools` skill (`screenshot.js`) or inspect uploaded images directly using `read_file`.
   - Extract exact hex palette (`--zv-*` / `--tm-*` tokens), font pairings, scale ratios, card radii, border weights, shadow depth, spacing rhythm, and mobile sticky behaviors.
   - Save extracted tokens or notes cleanly in `docs/design-guidelines/` when building reusable storefront patterns.
2. **Implement in Theme Architecture:**
   - Apply extracted typography, colors, spacing, and visual hierarchy cleanly using CSS variables and Shopify OS 2.0 sections/snippets.
3. **Verify Visually (`chrome-devtools`):**
   - Inspect desktop & mobile screenshots with `read_file` against the reference design (see `./references/visual-analysis-overview.md`).

### 2. Designing Storefront Sections from Scratch
Before writing HTML/Liquid/CSS:
- **Purpose & Buyer Context:** Clarify what product story or shopping action (discover, compare bundle tiers, zoom craftsmanship, add to cart) the section drives.
- **Aesthetic Point of View:** Commit to a clear brand feel (e.g., Warm Editorial Luxury, Nordic Craft, Modern Apothecary, High-Contrast Showroom) matching the Trymalora design language.
- **Hierarchy & Micro-Interactions:** Apply the 4-stage framework from curated design principles:
  - **BEAUTIFUL:** Intentional typography (editorial serif display + readable sans body), strong focal framing, generous whitespace.
  - **RIGHT:** WCAG AA contrast, accessible controls, keyboard navigation, responsive mobile grids.
  - **SATISFYING:** Subtle hover lifts, `150–300ms` easing (`cubic-bezier(0.16, 1, 0.3, 1)`), smooth lightbox zooms, tactile pill selection states (see `./references/micro-interactions.md` and `./references/animejs.md`).
  - **PEAK:** Product storytelling rhythm—hero outcome, unboxing ("What's in the Box"), lifestyle proof rows, and honest social proof (see `./references/storytelling-design.md`).

## Storefront Design Guardrails
- **Avoid Generic Slop:** Reject default Inter/Arial typography stacks, unstyled card grids, purple-on-white SaaS clichés, and cramped Buy Boxes.
- **Visual Assets:** For missing custom editorial graphics or upsell visuals, use real product photography, HD upscaling, or Antigravity's `image-generator` subagent—never placeholder grey boxes.
- **Speed & Stability:** Specify explicit `width` and `height` attributes on images, optimize mobile hero sizes, and avoid heavy animation libraries when crisp CSS transitions achieve the same polish.

## Reference Guides
- **Design Principles & Hierarchy:** `./references/design-principles.md`
- **Micro-Interactions & Easing:** `./references/micro-interactions.md`
- **Storytelling & Flow:** `./references/storytelling-design.md`
- **Screenshot Extraction Workflow:** `./references/design-extraction-overview.md`, `./references/extraction-best-practices.md`
- **Visual Verification Checklist:** `./references/visual-analysis-overview.md`, `./references/analysis-best-practices.md`
- **Accessibility & Performance:** `./references/technical-accessibility.md`, `./references/technical-optimization.md`
- **Choreographed Motion (Anime.js):** `./references/animejs.md`

