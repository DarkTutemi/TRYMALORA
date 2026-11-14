#!/usr/bin/env python3
"""Offline, read-only Shopify theme leakage audit + legacy PDP source baseline.

Does not authenticate with Shopify, change products, or perform HTTP requests.
Run from the TRYMALORA repository root (or pass --root).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

LEGACY_HANDLES = frozenset({
    "kids-infrared-battle-blaster-set-with-target-projector",
    "car-metal-rust-repair-paste",
    "metal-chrome-polish-restorer-paste",
    "metallic-silver-anti-rust-renovation-coating",
    "tile-refinishing-paint-restoration-kit",
    "mini-dual-purpose-travel-styling-iron",
    "ear-cleaner",
    "eyvelle-steam-therapy",
    "luminalift-eye-massager",
})

PUBLIC_ENTRY_FILES = (
    "sections/header-group.json",
    "sections/footer-group.json",
    "sections/willa-header.liquid",
    "sections/willa-footer.liquid",
    "sections/willa-cart-drawer.liquid",
    "sections/trymalora-featured-products.liquid",
    "templates/index.json",
)
DISCOVERY_FILES = (
    "sections/main-search.liquid",
    "sections/predictive-search.liquid",
    "sections/related-products.liquid",
    "sections/willa-main-collection.liquid",
    "sections/main-list-collections.liquid",
    "sections/trymalora-category-cards.liquid",
    "sections/trymalora-shop-all.liquid",
    "templates/collection.json",
    "templates/search.json",
)
PROTECTED_PDP_FILES = (
    "templates/product.json",
    "templates/product.v2.json",
    "sections/zavelyn-v4-pdp-main.liquid",
    "sections/trymalora-pdp-marquee.liquid",
    "sections/trymalora-pdp-package.liquid",
    "sections/trymalora-pdp-how-it-works.liquid",
    "sections/trymalora-pdp-faq.liquid",
    "sections/trymalora-pdp-reviews.liquid",
    "assets/zavelyn-v4-pdp.js",
    "assets/zavelyn-v4-pdp.css",
)
PRODUCT_LINK = re.compile(r"/products/([a-z0-9][a-z0-9-]*)", re.I)
CATALOG_LINK = re.compile(r"/(?:collections/(?:all|all-products|best-sellers)|collections)(?:[?\"'\s/<]|$)", re.I)
SEARCH_LINK = re.compile(r"(?:href|link)\s*[:=]\s*[\"']?/search\b", re.I)
TRYMALORA_BRAND = re.compile(r"\bTRYMALORA(?:®|™)?\b", re.I)


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def baseline(root: Path) -> dict:
    files = {}
    for name in PROTECTED_PDP_FILES:
        p = root / name
        files[name] = _sha(p) if p.is_file() else None
    return {
        "kind": "ultra_legacy_pdp_source_baseline",
        "note": "Source-file digest only; actual live Shopify PDP equivalence requires independent verification.",
        "captured_at_utc": datetime.now(timezone.utc).isoformat(),
        "files": files,
    }


def audit(root: Path, recorded: dict | None = None) -> dict:
    issues = []
    def add(level: str, code: str, path: str, message: str, line: int | None = None) -> None:
        item = {"severity": level, "code": code, "path": path, "message": message}
        if line is not None:
            item["line"] = line
        issues.append(item)

    for name in (*PUBLIC_ENTRY_FILES, *DISCOVERY_FILES):
        file = root / name
        if not file.is_file():
            add("medium", "MISSING_FOR_SCAN", name, "No file at this path; may use another layout/template.")
            continue
        content = file.read_text(encoding="utf-8-sig", errors="replace")
        is_primary = name in PUBLIC_ENTRY_FILES
        for lineno, row in enumerate(content.splitlines(), 1):
            if re.search(r"\b(schema|comment|endschema)\b", row) and "{%" in row:
                continue
            for handle in PRODUCT_LINK.findall(row):
                if handle.lower() in LEGACY_HANDLES:
                    add("high" if is_primary else "medium", "LEGACY_PRODUCT_LINK", name,
                        f"Hardcoded old product URL: /products/{handle}", lineno)
            if CATALOG_LINK.search(row):
                add("high" if is_primary else "medium", "CATALOG_DISCOVERY_LINK", name,
                    "Link to general collection may reveal old products.", lineno)
            if is_primary and SEARCH_LINK.search(row):
                add("high", "UNFILTERED_SEARCH_ENTRY", name,
                    "Search link can reveal legacy products unless results and recommendations are scoped.", lineno)
            if is_primary and TRYMALORA_BRAND.search(row) and any(w in row.lower() for w in (
                    "logo", "headline", "copyright", "newsletter", "brand", "about", "footer", "trymalora inc", "trymalora storefront")):
                add("medium", "OLD_BRAND_REFERENCE", name,
                    "Legacy store branding remains in public-facing template or fallback.", lineno)
        if name == "templates/index.json":
            try:
                template = json.loads(content)
                types = [obj.get("type") for obj in template.get("sections", {}).values() if isinstance(obj, dict)]
                if "trymalora-featured-products" in types or "trymalora-shop-all" in types:
                    add("high", "LEGACY_HOMEPAGE_SECTION", name,
                        "Homepage still includes a legacy product catalog section.")
            except (json.JSONDecodeError, TypeError):
                add("high", "INVALID_HOME_TEMPLATE_JSON", name, "Homepage template is invalid JSON.")
        if name == "sections/main-search.liquid" and "search.results" in content:
            add("medium", "UNSCOPED_SEARCH_RESULTS", name,
                "Search results loop may surface legacy products; check availability and visibility logic.")
        if name == "sections/related-products.liquid" and "recommendations.products" in content:
            add("medium", "UNSCOPED_RECOMMENDATIONS", name,
                "Recommendations may surface legacy products; check rendering and source scope.")
        if name == "sections/willa-main-collection.liquid" and "collection.products" in content:
            add("medium", "UNSCOPED_COLLECTION_GRID", name,
                "General collection grid may still display legacy products if reachable.")

    if recorded is not None:
        if recorded.get("kind") != "ultra_legacy_pdp_source_baseline" or not isinstance(recorded.get("files"), dict):
            raise ValueError("Invalid baseline manifest: expected kind + files mapping")
        for name, expected in recorded["files"].items():
            if name.startswith("/") or ".." in Path(name).parts:
                raise ValueError("Baseline includes unsafe path")
            file = root / name
            current = _sha(file) if file.is_file() else None
            if current != expected:
                add("critical", "PROTECTED_PDP_DRIFT", name,
                    "Protected PDP source changed from baseline; review full diff before considering deploy.")

    counts = {level: sum(x["severity"] == level for x in issues) for level in ("critical", "high", "medium", "low")}
    return {
        "kind": "ultra_isolation_static_audit",
        "scanned_at_utc": datetime.now(timezone.utc).isoformat(),
        "root": str(root.resolve()),
        "counts": counts,
        "issues": issues,
        "note": "Static scanner detects potential exposure; cannot prove rendered route isolation, Shopify product publication, ad feed integrity or checkout behavior.",
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("command", choices=("audit", "baseline"))
    ap.add_argument("--root", default=".")
    ap.add_argument("--output", help="Optional JSON report output (writes only to this path).")
    ap.add_argument("--baseline", help="For audit: read captured protected-PDP baseline JSON.")
    ap.add_argument("--enforce", action="store_true", help="Audit: exit 1 if high/critical findings remain.")
    args = ap.parse_args(argv)
    root = Path(args.root).resolve()
    if not (root / "templates").is_dir() or not (root / "sections").is_dir():
        ap.error(f"Not a Shopify OS2 theme repository: {root}")
    if args.command == "baseline":
        if not args.output:
            ap.error("baseline requires --output")
        report = baseline(root)
    else:
        try:
            recorded = json.loads(Path(args.baseline).read_text(encoding="utf-8")) if args.baseline else None
            report = audit(root, recorded)
        except (ValueError, OSError, json.JSONDecodeError) as exc:
            ap.error(str(exc))

    text = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        dest = Path(args.output)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text + "\n", encoding="utf-8")
    print(json.dumps({"kind": report["kind"], "counts": report.get("counts", {}),
                      "issues": len(report.get("issues", [])), "output": args.output}, ensure_ascii=False))
    if args.command == "audit" and args.enforce and (report["counts"]["critical"] or report["counts"]["high"]):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
