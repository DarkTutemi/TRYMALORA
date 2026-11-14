---
name: ui-styling
description: >-
  Establish cohesive visual design systems, CSS design tokens, accessible interactive states,
  responsive product cards, modals/drawers, variant pills, and mobile-first layouts across Shopify
  storefronts (Vanilla CSS variables or Tailwind CSS). Use when styling sections, standardizing
  colors/typography/spacing tokens, designing interactive controls (buttons, pills, lightboxes,
  accordions), or auditing visual consistency across desktop and mobile.
---

# UI Styling & Storefront Design System

Create visually consistent, responsive, accessible storefront interfaces using structured CSS design tokens, intentional spacing scales, and refined interactive states.

## 1. Storefront Design Tokens (CSS Custom Properties)

Always bind components to theme-level CSS custom properties (`--zv-*` / `--tm-*` / Shopify `settings_schema.json` variables) instead of scattering arbitrary hex colors:
- **Color Roles:** Surface background (`#FFFDFC` / `#FAF7F5`), card border (`--zv-pdp-line`), heading ink (`--zv-pdp-heading`), muted body copy (`--zv-pdp-muted`), primary CTA (`--zv-pdp-cta`), and promotional accent (`--zv-pdp-accent`).
- **Spacing Rhythm:** Consistent scale (`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`).
- **Elevation & Radii:** Crisp `1px–1.5px` borders + subtle translucent shadows (`0 4px 14px rgba(...)`) over muddy default box shadows.

## 2. E-Commerce Component Styling Standards

### Product Cards & Collection Grids
- Uniform aspect ratios (`aspect-ratio: 1 / 1` or `4 / 5`) with `object-fit: cover` to prevent jagged card heights.
- Clear hierarchy: Image -> Rating/Badge -> Title (2-line clamp max) -> Price + Compare-at anchor -> Quick-action state.
- Smooth `transform` image zoom (`scale(1.03)` over `0.25s`) on hover without shifting surrounding layout.

### Interactive Controls (Buttons, Bundle Tiers, Variant Pills, Upsell Boxes)
- Distinct `:hover`, `:focus-visible`, `.selected`, and `:disabled` states.
- Clear selected ring (`border-color` + light tinted fill) on bundle cards so selected option stands out immediately.
- Ensure zoom triggers inside upsell rows use crisp badges/icons (`cursor: zoom-in` or magnifying icon) and clean modal backdrop blur (`backdrop-filter: blur(8px)`).

### Mobile-First Responsive Discipline
- Design mobile layout (`375px–430px`) cleanly first, then enhance tablet (`>= 640px/768px`) and desktop (`>= 1024px/1280px`).
- Avoid horizontal overflow (`max-width: 100%`, `box-sizing: border-box`, `overflow-wrap: break-word`).
- Reserve bottom padding where sticky ATC bars appear so footer links and cookie banners remain accessible.

## 3. Accessibility & Contrast
- Maintain >= `4.5:1` contrast on body copy/prices and >= `3:1` on large headlines and UI borders.
- Preserve clear `:focus-visible` outlines for keyboard shoppers.
- Enforce `aria-hidden`, `aria-modal`, and contrast-safe close buttons on all drawers and modals.

## Reference Guides
- **Accessible Overlays & Controls:** [references/shadcn-accessibility.md](./references/shadcn-accessibility.md)
- **Theming & CSS Variables:** [references/shadcn-theming.md](./references/shadcn-theming.md)
- **Responsive Breakpoints & Patterns:** [references/tailwind-responsive.md](./references/tailwind-responsive.md)
- **Utility Layout & Typography:** [references/tailwind-utilities.md](./references/tailwind-utilities.md)
- **Custom Theme Tokens:** [references/tailwind-customization.md](./references/tailwind-customization.md)
- **Visual Design System Principles:** [references/canvas-design-system.md](./references/canvas-design-system.md)
- **Component Composition (React/Extensions):** [references/shadcn-components.md](./references/shadcn-components.md)

