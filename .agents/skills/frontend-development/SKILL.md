---
name: frontend-development
description: >-
  Build robust, high-performance storefront frontend code in HTML5, modular CSS, Vanilla ES6+ JavaScript,
  Web Components, and React/TypeScript (for Shopify Extensions/Hydrogen). Covers DOM event delegation,
  variant & bundle state management, Ajax Cart API integration, Section Rendering API, zero-CLS performance,
  and WCAG accessibility. Use when implementing interactive storefront sections, modals, drawers, bundle
  calculators, or fixing frontend DOM/CSS/JS behavior.
---

# Storefront Frontend Development Guidelines

Production patterns for building fast, accessible, maintainable frontend interactions across Shopify Liquid themes and storefront extensions.

## 1. Core Architecture (Shopify Storefront JS & CSS)

### Modular & Scoped JavaScript (`assets/*.js`)
- **Zero Global Pollution:** Wrap section logic in IIFEs, ES modules, or Custom Elements (`customElements.define(...)`), scoping queries to the section container or buy-box root rather than fragile global selectors.
- **No Syntax Regressions:** Always verify syntax cleanly after editing (`node -c assets/<file>.js`) and avoid hardcoded template literal assumptions in generated scripts.
- **Event Isolation & Delegation:**
  - When embedding zoom triggers or nested buttons inside interactive cards or `<label>` rows, decouple `<label for="...">` from the trigger element or call `e.preventDefault()` + `e.stopPropagation()` so clicking an image never toggles a bundle/upsell checkbox unintentionally.
  - Attach `keydown` handlers (`Enter`, `Space`, `Escape`) on custom interactive elements, drawers, and zoom lightboxes.

### Shopify Storefront & Cart API Patterns
- **Ajax Cart Synchronization:** Send clean multi-item payloads (`{ items: [{ id, quantity, properties, selling_plan }] }`) to `/cart/add.js`, handle non-2xx JSON errors gracefully with inline user feedback, and refresh cart drawer counts/sections dynamically.
- **Price & Variant Integrity:** Keep single source-of-truth price formatting (`Shopify.formatMoney` or consistent integer-cents helpers) synchronized across variant pills, bundle tiers, upsells, main ATC buttons, and mobile sticky ATC bars.
- **Product-Specific Scoping:** Guard custom bundle/upsell controllers cleanly (`if (buyBox.querySelector('.zv-gnome-bundle-card'))`) so other products use their own controllers untouched.

## 2. Performance & Core Web Vitals

- **Zero Cumulative Layout Shift (CLS):** Always specify explicit `width` and `height` (or CSS `aspect-ratio`) on gallery images, upsell thumbnails, review avatars, and skeleton containers.
- **LCP Prioritization:** Keep above-the-fold hero media eager (`loading="eager"`, high fetch priority); apply `loading="lazy"` to below-the-fold sections, review galleries, and drawer images.
- **GPU-Friendly Animations:** Animate `transform` and `opacity` rather than layout properties (`top`, `left`, `height`). Use CSS transitions over heavy JS animation loops whenever possible.
- **Asset Hygiene:** Avoid bundling unused frontend libraries or duplicate CSS overrides when native CSS variables and vanilla DOM APIs suffice.

## 3. Accessibility & Responsive Craft

- **Semantic HTML First:** Use `<button type="button">` for actions, `<a href>` for navigation, `<dialog>` or `role="dialog" aria-modal="true"` for zoom/quick-view modals, and proper `<label for="...">` associations.
- **Touch & Mobile Usability:** Minimum `44x44px` tap target on mobile bundle cards, variant pills, modal close buttons, and sticky ATC triggers. Prevent horizontal overflow (`scrollWidth <= clientWidth`).
- **Focus & Scroll Locking:** Lock `document.body.style.overflow = 'hidden'` while lightboxes or drawers are open and always restore it cleanly on close (`Escape`, backdrop click, close button).

## 4. Headless / Checkout UI Extensions (React & TypeScript)
When working outside Liquid (e.g., Shopify Checkout UI Extensions or Hydrogen):
- Enforce strict TypeScript (no `any`), reusable small components, Suspense boundaries without jarring loading spinners, and Shopify Polaris UI primitives.

## Reference Guides
- **Frontend Performance Optimization:** [references/performance.md](./references/performance.md)
- **Loading & Error States (Zero CLS):** [references/loading-and-error-states.md](./references/loading-and-error-states.md)
- **Component Composition Patterns:** [references/component-patterns.md](./references/component-patterns.md)
- **TypeScript Standards (Extensions/Apps):** [references/typescript-standards.md](./references/typescript-standards.md)

