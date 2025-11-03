# Documentation commit plan

This file lists the exact git staging and commit commands (one commit per file) with a short, specific commit message for each changed documentation file. Run each command locally from the repository root. I will not push to any remote.

Notes:
- These commands create one commit per file so changes are traceable. If you prefer a single combined commit, tell me and I'll provide that instead.

---

## Commands (copy-paste)

1) SRS.md

```bash
git add SRS.md
git commit -m "docs(SRS): tidy and condense SRS — update overview, data model summary, NFRs"
```

Rationale: removes duplicate blocks and provides a concise, lint-friendly SRS aligned to the current milestone.

---

2) SDD.md

```bash
git add SDD.md
git commit -m "docs(SDD): embed simplified diagrams and clarify architecture + deployment notes"
```

Rationale: replaced external `/docs` references with inline PlantUML and ASCII diagrams and fixed fenced code language and formatting.

---

3) README.md

```bash
git add README.md
git commit -m "docs(README): remove duplicate H1, convert bare URLs to links, update diagram note"
```

Rationale: ensure a single top-level heading, fix bare links, and update references to embedded diagrams in `SDD.md`.

---

4) SETUP_GUIDE.md

```bash
git add SETUP_GUIDE.md
git commit -m "docs(SETUP_GUIDE): consolidate quickstart, normalize lists, add troubleshooting & help section"
```

Rationale: consolidate duplicate sections, fix list and heading spacing, and improve troubleshooting guidance for dev setup.

---

5) PROJECT_REVIEW.md

```bash
git add PROJECT_REVIEW.md
git commit -m "docs(PROJECT_REVIEW): remove AI-suggestive phrasing, normalize headings and spacing"
```

Rationale: remove assistant/AI phrasing (neutral language), ensure single H1 and consistent heading structure.

---

6) docs/API.md

```bash
git add docs/API.md
git commit -m "docs(API): clarify authentication and endpoint examples; note on generating OpenAPI spec"
```

Rationale: clarified examples, error format, and guidance for OpenAPI generation.

---

7) (optional) docs/openapi.yaml

If you edited `docs/openapi.yaml` or `openapi.yaml` (OpenAPI spec), include it with a message like:

```bash
git add docs/openapi.yaml
git commit -m "docs(openapi): add initial OpenAPI 3.0 skeleton for implemented endpoints"
```

Rationale: provides a baseline OpenAPI document for client generation and review.

---

## Verify before pushing

Run a quick check to see your staged commits and the overall status:

```bash
git status --porcelain
git log --oneline --decorate --graph -n 10
```

Then, if you want me to prepare a single combined commit instead, or to open a PR after committing locally, tell me and I'll prepare the exact commands.

---

After you run these commits locally, I can also prepare the final push instructions (branch name, push command, and PR template) if you want to push these changes to a remote branch.
