---
name: chrome-devtools
description: >-
  Real browser verification, visual screenshot capture, DOM inspection, console/network error
  debugging, Core Web Vitals measurement, and mobile/desktop interactive testing (variants, bundles,
  upsells, and Cart API `/cart.js`) using isolated headless Chrome / Puppeteer CLI scripts.
  Preferred verification skill after meaningful Shopify storefront UI, CSS, or JavaScript edits.
---

# Chrome DevTools Verification Skill

Execute isolated real-browser verification against Shopify draft preview URLs or local `shopify theme dev` servers before claiming any storefront change is complete.

> **Reality Check:** A passing `shopify theme push` or HTTP 200 status is **not** proof that a storefront works. Always verify rendered UI, DOM state, network calls, console logs, and interactive controls visually and programmatically.

## 1. Mandatory Shopify Visual Verification Workflow

After any meaningful UI, Liquid, CSS, or JavaScript change:
1. **Navigate to Draft Preview:** Use `?preview_theme_id=<draft_theme_id>` or `http://127.0.0.1:9292` in an isolated headless Chrome session.
2. **Capture Desktop & Mobile Screenshots:**
   - Desktop (`1440x900`) and Mobile (`390x844` via `--mobile true`).
   - Save screenshots cleanly (or into the Antigravity scratch/artifacts directory) and inspect them visually using `read_file`.
3. **Check Console & Network Health:** Confirm zero uncaught `pageerror` / console errors and zero unexpected `>= 400` asset or API requests.
4. **Verify Mobile Responsiveness:** Assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, readable font sizes, clean button spacing, and zero sticky-ATC overlap.
5. **Test Interactive Storefront Flows:**
   - Click bundle tiers & variant pills -> confirm price, savings badges, and sticky ATC sync.
   - Open image zoom / quick-view modals -> confirm no accidental checkbox toggling.
   - Click Add to Cart -> inspect `/cart.js` payload for exact `variant_id`, `quantity`, and line-item `properties`.
6. **Regression Spot-Check:** Open at least one unrelated flagship product page if shared files (`assets/zavelyn-v4-pdp.*`, `sections/zavelyn-v4-pdp-main.liquid`, `layout/theme.liquid`) were modified.

## 2. Puppeteer Automation Scripts

All helper scripts live in `.agents/skills/chrome-devtools/scripts/`:
- `navigate.js` — Open URL (`--url`, `--wait-until`)
- `screenshot.js` — Capture desktop/mobile screenshots (`--url`, `--output`, `--mobile true`, `--width`, `--height`, `--full-page true`, `--selector`)
- `console.js` — Capture browser console errors & `pageerror` (`--url`, `--types error,warn`)
- `network.js` — Inspect XHR/Fetch/asset network requests (`--url`, `--types xhr,fetch`)
- `evaluate.js` — Evaluate DOM/cart assertions in page context (`--url`, `--script`)
- `snapshot.js` — Discover interactive selectors cleanly
- `click.js` / `fill.js` — Simulate clicks and form input
- `performance.js` — Measure LCP, CLS, FCP, TTFB Core Web Vitals

### Quick Verification Commands (PowerShell / Windows)
```powershell
cd .agents\skills\chrome-devtools\scripts

# Desktop + Mobile screenshots
node screenshot.js --url "https://<store>.myshopify.com/products/<handle>?preview_theme_id=<id>" --output "./desktop.png"
node screenshot.js --url "https://<store>.myshopify.com/products/<handle>?preview_theme_id=<id>" --mobile true --output "./mobile.png"

# Console errors & Web Vitals
node console.js --url "https://<store>.myshopify.com/products/<handle>?preview_theme_id=<id>" --types error
node performance.js --url "https://<store>.myshopify.com/products/<handle>?preview_theme_id=<id>"
```

**Note:** For interactive multi-step browser sessions driven through Antigravity UI, you may also delegate to the `browser` subagent when visual step-by-step interaction is preferred; for automated deterministic QA gates and E2E `/cart.js` assertions, use these isolated scripts or `scripts/verify_*.cjs`.

## Reference Guides
- **Chrome DevTools Protocol Domains:** [references/cdp-domains.md](./references/cdp-domains.md)
- **Web Vitals & Performance Audits:** [references/performance-guide.md](./references/performance-guide.md)
- **Puppeteer Selector & Waiting Guide:** [references/puppeteer-reference.md](./references/puppeteer-reference.md)
- **Script CLI Options:** [scripts/README.md](./scripts/README.md)

