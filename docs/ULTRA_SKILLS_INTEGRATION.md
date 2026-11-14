# TRYMALORA — ULTRA OVERNIGHT selective skill integration

**Purpose:** skill-only overlay for TRYMALORA (`main` read baseline 2026-11-14; latest observed commit `4da5a48c`). No Shopify theme assets, templates, products, pricing, publication or live resources are modified by installing this patch.

## Why this patch exists
The repo already has 11 active `.agents/skills/*` specializations and a very large `ecc/` library. Claude Super Kit adds CRO-copywriting, visual testing and media ideas, but copying its `.claude/` tree into TRYMALORA would duplicate agent instructions, introduce incompatible Claude-only hooks, and risk unexpected operations. This overlay selectively composes existing capabilities with 7 focused Shopify-flagship skills.

## Added skills
| Path | Scope | Source inspiration |
| --- | --- | --- |
| `.agents/skills/ultra-storefront-isolation/SKILL.md` | Public flagship navigation without old catalog leaks | Repo architecture + owner requirements |
| `.agents/skills/ultra-legacy-ads-guard/SKILL.md` | Protect old ads/PDP, variants, bundles, subscriptions, checkout | Repo backup reports + ECC change-impact |
| `.agents/skills/ultra-product-claims/SKILL.md` | Evidence-led functional claims | SPYV2 flagship spec + owner |
| `.agents/skills/ultra-premium-cro/SKILL.md` | Premium feminine copy + CRO | Claude Super Kit copywriter/CRO concepts |
| `.agents/skills/ultra-brand-voice/SKILL.md` | US brand voice and metadata | ECC brand-voice/market-research |
| `.agents/skills/ultra-media-performance/SKILL.md` | Responsive image/video pipeline | Claude Super Kit media-processing concepts |
| `.agents/skills/ultra-visual-qa/SKILL.md` | Draft browser & checkout regression QA | existing chrome-devtools + ECC e2e-testing |

Added global project rule `.agents/rules/ultra_overnight_flagship.md`. No existing rules overwritten.

## Read-only local audit
```powershell
python scripts/qa_ultra_isolation.py audit --root .
python scripts/qa_ultra_isolation.py baseline --root . --output docs/run_reports/legacy_pdp_baseline.json
python scripts/qa_ultra_isolation.py audit --root . --baseline docs/run_reports/legacy_pdp_baseline.json --output docs/run_reports/ultra_isolation_audit.json
python -m unittest discover -s tests -p test_qa_ultra_isolation.py -v
```
The initial audit is expected to flag legacy links until the theme's actual storefront redesign is performed. It reports **potential leaks**, not a full browser security audit. `--enforce` causes CI to fail when `high`/`critical` findings remain; use it only against the redesigned draft source. `baseline` records hashes of selected legacy commerce files and does not upload or mutate Shopify resources.

## Known Trymalora exposure points at audit time
- `sections/willa-header.liquid`: `/collections/all` and `/search` plus fallback links and brand.
- `sections/willa-footer.liquid`: hardcoded old products; newsletter and brand.
- `sections/trymalora-featured-products.liquid`: 6 old product links.
- `sections/willa-cart-drawer.liquid`: cart empty-state Shop All link.
- `sections/main-search.liquid`, `sections/related-products.liquid`: can discover other products.
- `sections/willa-main-collection.liquid` + `/collections/all`: navigation/discovery issues if reachable from flagship.
- `templates/index.json`, `sections/header-group.json`, `sections/footer-group.json`: legacy content/brand.

## Before beginning redesign
1. Shopify read-only admin verification: exact active live theme and catalog ad types (direct links vs dynamic catalog), current product status and publication.
2. Duplicate the **actual** live Shopify theme as a new unpublished theme and confirm identical code/settings. Existing `scripts/create_draft_theme.mjs` creates an unpublished theme but does not copy live theme assets.
3. Capture real ad URLs and baseline screenshots/cart prices. ZIP and chat history provide historical examples only.
4. Do not unlist products until feed/channel impact is verified; do not mutate admin state at skill-install time.
5. Build and test on draft; owner approval required before publish.

## Security note
Repository currently embeds an old storefront access password in `package.json`; rotate it if still valid and remove from tracked source in a separately approved security cleanup. Do not copy `.claude/settings.local.json`, API keys, external MCP servers, paid API scripts, arbitrary hooks, or generated binary assets from the ZIP.

## Implementation status
This document ships as a **ready-to-apply, local additive patch**, not proof of a remote GitHub push. A GitHub branch creation attempt on `DarkTutemi/TRYMALORA` was denied by `403 Resource not accessible by integration` (read permission only). Apply locally via installer, verify, and commit/push with Antigravity's configured credentials. No remote work is implied.
