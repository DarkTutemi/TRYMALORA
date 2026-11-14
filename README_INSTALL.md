# TRYMALORA — ULTRA OVERNIGHT selective skills patch

**Package created 2026-11-14.** Contains only new files. It will **not** modify `layout/`, `sections/`, `templates/`, `assets/`, Shopify Admin, products, catalog feeds, Meta Ads, or the live theme by itself.

## Apply from Windows / Antigravity

1. Ensure existing TRYMALORA checkout is on a clean working tree. If another Antigravity window is changing files, use a separate worktree; don't reset or overwrite their work.
2. Create an isolated Git branch:

```powershell
cd C:\Users\Admin\Desktop\TRYMALORA
git status --short
git switch -c chore/ultra-overnight-selective-skills
```

3. Extract this ZIP to any temporary folder. First preview the additive file changes:

```powershell
python "C:\PATH\TO\EXTRACTED\install_ultra_skills.py" --repo "C:\Users\Admin\Desktop\TRYMALORA"
```

4. Then apply only after inspecting the dry-run (no existing path will be overwritten):

```powershell
python "C:\PATH\TO\EXTRACTED\install_ultra_skills.py" --repo "C:\Users\Admin\Desktop\TRYMALORA" --apply
python -m unittest discover -s tests -p test_qa_ultra_isolation.py -v
python scripts/qa_ultra_isolation.py audit --root .
python scripts/qa_ultra_isolation.py baseline --root . --output docs/run_reports/legacy_pdp_baseline.json
```

5. The initial isolation audit should raise legacy-link findings: it is intentionally diagnosing the **current** Trymalora site. It does **not** mean installation failed. Stage only the new additive files and protect existing uncommitted changes:

```powershell
git status --short
git add .agents/rules/ultra_overnight_flagship.md .agents/skills/ultra-* docs/ULTRA_SKILLS_INTEGRATION.md scripts/qa_ultra_isolation.py tests/test_qa_ultra_isolation.py
git commit -m "feat(skills): add ULTRA OVERNIGHT flagship guardrails and Shopify QA"
git push -u origin chore/ultra-overnight-selective-skills
```

## Alternative
Apply `TRYMALORA_ULTRA_SKILLS.patch` from the *parent download folder* with `git apply --check`, then `git apply`; patch is standalone and creates only new files. The ZIP already includes the same content; use **either** installer **or** patch, not both.

## Acceptance
- 7 new selective skills + 1 project rule + 1 documentation + offline QA scanner + unit tests.
- No existing repository file overwritten.
- Unit tests green. CLI audit reports true findings and is run read-only by default.
- No unauthorized Shopify changes or paid APIs.
- Publication and any catalog status changes require separate explicit owner approval.

**Remote limitation:** GitHub connector currently has read-only access. An attempted branch creation returned HTTP 403. This patch is prepared locally and is not committed to remote. Commit/push through your Antigravity GitHub credentials once reviewed.
