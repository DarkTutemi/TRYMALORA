---
name: debugging
description: >-
  Systematic root-cause debugging framework for Shopify themes, Liquid rendering, JavaScript
  event conflicts, variant/bundle pricing sync, Ajax Cart `/cart/add.js` failures, and CSS
  layout regressions. Enforces root-cause investigation before editing code, backward stack/DOM
  tracing, defense-in-depth validation, and fresh verification before completion.
---

# Systematic Storefront Debugging

**Iron Law:** NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST. Random trial-and-error edits mask symptoms and create regressions across unrelated products.

## The Four Phases

### Phase 1: Root Cause Investigation (Mandatory First Step)
1. **Reproduce Reliably:** Reproduce the bug on the exact URL (`?preview_theme_id=...`) using `chrome-devtools` (`console.js`, `network.js`, `evaluate.js`), NOT guesswork.
2. **Check Recent Diffs:** Inspect `git diff` / recent asset edits for syntax typos, premature string interpolation, CSS specificity overrides, or selector collisions.
3. **Trace Data Flow & Boundaries:**
   - **Liquid -> DOM:** Does Liquid output the expected `data-variant-id`, `data-price-cents`, and `product.handle` attributes?
   - **DOM -> JS Event:** Is a `<label for="...">` wrapper hijacking clicks intended for an image-zoom button? Did `updateUI()` run after the event?
   - **JS -> Cart API (`/cart/add.js`):** Inspect the exact HTTP status (`422` vs `200`) and response JSON from Shopify Ajax Cart. Is the variant unpublished, out of stock, or missing a `selling_plan`?
   - **Asset Caching / Preview:** Did the updated CSS/JS actually upload to the target draft `THEME_ID`?

### Phase 2: Pattern Analysis
Compare the failing product or section against a verified working product in `TRYMALORA` (e.g., compare `sections/zavelyn-v4-pdp-main.liquid` branches or `assets/zavelyn-v4-pdp.js` bundle controllers) to spot subtle mismatches.

### Phase 3: Hypothesis & Minimal Test
Form one explicit hypothesis (`"Clicking thumbnail toggles checkbox because <img> sits inside <label for='...'>"`) and verify with a single minimal change before adjusting unrelated code. If 3 fixes fail, stop and question the underlying component structure.

### Phase 4: Fix & Verify End-to-End
1. Apply the single root-cause fix.
2. Validate syntax (`node -c`, `shopify theme check`).
3. Re-run `chrome-devtools` browser test on both Desktop and Mobile and inspect console/network + screenshots before claiming fixed.

## Reference Guides
- **Four-Phase Framework:** [references/systematic-debugging.md](./references/systematic-debugging.md)
- **Tracing Invalid State Backward:** [references/root-cause-tracing.md](./references/root-cause-tracing.md)
- **Defense-in-Depth Validation:** [references/defense-in-depth.md](./references/defense-in-depth.md)
- **Verification Discipline:** [references/verification.md](./references/verification.md)

