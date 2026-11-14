"""Unit tests for the offline scanner, no Shopify calls or external dependencies."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "scripts" / "qa_ultra_isolation.py"
SPEC = importlib.util.spec_from_file_location("qa_ultra_isolation", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class IsolationAuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        for folder in ("sections", "templates", "assets"):
            (self.root / folder).mkdir()
        (self.root / "sections" / "willa-header.liquid").write_text('<a href="/products/ear-cleaner">Ear</a>\n<a href="/collections/all">Shop</a>', encoding="utf-8")
        (self.root / "templates" / "index.json").write_text(json.dumps({"sections": {"featured": {"type": "trymalora-featured-products"}}}), encoding="utf-8")
        (self.root / "sections" / "zavelyn-v4-pdp-main.liquid").write_text("untouched", encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def test_detects_old_product_and_catalog(self):
        report = MODULE.audit(self.root)
        codes = [a["code"] for a in report["issues"]]
        self.assertIn("LEGACY_PRODUCT_LINK", codes)
        self.assertIn("CATALOG_DISCOVERY_LINK", codes)
        self.assertIn("LEGACY_HOMEPAGE_SECTION", codes)
        self.assertGreater(report["counts"]["high"], 0)

    def test_baseline_protects_old_pdp(self):
        state = MODULE.baseline(self.root)
        self.assertEqual(state["kind"], "ultra_legacy_pdp_source_baseline")
        self.assertFalse(any(i["code"] == "PROTECTED_PDP_DRIFT" for i in MODULE.audit(self.root,state)["issues"]))
        (self.root / "sections" / "zavelyn-v4-pdp-main.liquid").write_text("modified", encoding="utf-8")
        self.assertIn("PROTECTED_PDP_DRIFT", [i["code"] for i in MODULE.audit(self.root,state)["issues"]])

    def test_rejects_unsafe_baseline_path(self):
        with self.assertRaises(ValueError):
            MODULE.audit(self.root, {"kind": "ultra_legacy_pdp_source_baseline", "files": {"../secrets": "x"}})

    def test_no_false_legacy_handle(self):
        (self.root / "sections" / "willa-header.liquid").write_text('<a href="/products/ultra-overnight">Shop</a>', encoding="utf-8")
        report = MODULE.audit(self.root)
        self.assertFalse(any(x["code"] == "LEGACY_PRODUCT_LINK" for x in report["issues"]))

if __name__ == "__main__":
    unittest.main()
