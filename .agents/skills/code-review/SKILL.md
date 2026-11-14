---
name: code-review
description: >-
  Review Shopify theme modifications (Liquid, JSON schemas, CSS, JS) and review feedback with
  strict technical rigor before deployment or completion claims. Enforces verification-before-completion
  gates, anti-regression scope audits (preventing single-product edits from leaking across products
  or unrelated sections), and clean code checks. Use after implementing features, before deploying
  to a theme, or when evaluating review feedback.
---

# Code Review & Anti-Regression Gate

Enforce technical rigor, scope discipline, and evidence-backed completion across every Shopify theme modification.

## Core Principles

- **YAGNI, KISS, DRY:** Reject unnecessary complexity, duplicated logic, and unrequested edits.
- **Evidence Before Claims:** Never state tests pass, syntax is clean, or UI works without fresh command/browser output from the current session.
- **Strict Scope Control:** Confirm diffs affect *only* the requested product, section, or template.

## 1. Pre-Deploy Shopify Theme Review Checklist

Before deploying or claiming any theme change is complete:
1. **Scope & Diff Audit (`git diff`):**
   - Did a single-product change accidentally touch shared sections or global bundle pricing for unrelated products?
   - Are `{% if product.handle == '...' %}` conditionals or separate templates properly isolated?
   - Are unrelated files in `sections/`, `templates/`, `config/` untouched?
2. **Liquid & Schema Integrity:**
   - Run `shopify theme check` cleanly.
   - Verify valid JSON in `templates/*.json` and `{% schema %}` blocks.
   - Verify Liquid loops have safe bounds, images include `alt`/`width`/`height`, and no broken snippet paths exist.
3. **JavaScript & CSS Safety:**
   - Run `node -c assets/<modified>.js` to catch syntax errors.
   - Confirm no label/checkbox click conflicts, leaked globals, or duplicate CSS rules breaking mobile viewports.
4. **Live Draft Verification:**
   - Confirm visual & interactive checks passed via `chrome-devtools` (desktop, mobile, console, `/cart.js`).
5. **Optional AI Diff Review:** If deep static review is helpful, invoke Antigravity's `gpt-reviewer` MCP (`review_changes`) or delegate a read-only `research` subagent inspection on the changed diff.

## 2. Gate Function (Iron Law)

```text
1. IDENTIFY the command/test proving each claim (`node -c`, `shopify theme check`, `chrome-devtools` run).
2. RUN the full check after your FINAL edit.
3. READ the actual output and screenshots (`read_file`).
4. REPORT exact verified results and scope — never extrapolate ("should work" / "probably fine").
```

## Reference Guides
- **Verification Gates Protocol:** [references/verification-before-completion.md](./references/verification-before-completion.md)
- **Evaluating Review Feedback:** [references/code-review-reception.md](./references/code-review-reception.md)
- **Requesting Structured Reviews:** [references/requesting-code-review.md](./references/requesting-code-review.md)

