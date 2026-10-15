# Hacktoberfest Track 1 submission audit

**Audit date:** 15 October 2026
**Team:** Rogue One
**Intended repository:** `H26_RogueOne_GemForge`
**Readiness:** **Integration complete locally; push awaits owner review**

This is an evidence-based checklist, not an independent certification against
the organizer's official handbook. The handbook/link has not been provided or
independently reviewed in this workspace. Event and track details below are
recorded in [DEVELOPMENT.md](DEVELOPMENT.md) as user-confirmed; confirm any
remaining official rules with the organizer before publication.

## Requirements checklist

| Requirement | Status | Evidence and remaining action |
| --- | --- | --- |
| Repository name `H26_RogueOne_GemForge` | **Verified** | The public fork URL has the required name: [yojit2016/H26_RogueOne_GemForge](https://github.com/yojit2016/H26_RogueOne_GemForge). |
| Starter-fork provenance | **Verified** | GitHub identifies the repository as a fork of `rishrek/LinkWatch`; local `origin/main` is the upstream root commit `f52f3930c8e7c33d934ccf614955a38e26984bd5`. |
| Public GitHub publication | **Fork exists; app changes not pushed** | The public fork is visible, but the integrated application branch is local only. Do not push before owner review. |
| Open-source license | **Ready** | Root [LICENSE](LICENSE) is MIT for GemForge; `targets/LinkWatch/LICENSE` preserves LinkWatch's original MIT notice. |
| README | **Ready** | [README.md](README.md) now covers the problem, architecture, stack, setup, CLI/API, actual findings, limitations and license. |
| Actual LinkWatch analysis | **Verified dynamically in integration checkout** | A new offline scan of `targets/LinkWatch` observed 26 declarations, 14 normalized packages, 22 usage locations, and one proven Pydantic `constraint_conflict`; verification remained `not_run`. No LinkWatch code was executed. Prior hosted inference and the separately approved comparison are documented in [PHASE2-VALIDATION.md](PHASE2-VALIDATION.md) and [PHASE3-VALIDATION.md](PHASE3-VALIDATION.md). |
| Gemma 4 integration | **Implemented and exercised** | Official Google GenAI SDK path, model `gemma-4-26b-a4b-it`; migration inference succeeded after bounded retry. Later repair-generation request exhausted two HTTP 504 attempts and returned no suggestion. |
| Dependency Exit Capsules | **Preserved in repository** | Exact Phase 3 JSON/Markdown and repair JSON/Markdown exports are under `evidence/linkwatch/`; SHA256 values are listed below. The historical capsules contain absolute local repository and temporary-environment paths, so review that disclosure before pushing. |
| Test evidence | **Verified locally** | Python: `152 passed, 1 warning`. Ruff passes on GemForge `src` and `tests`; repository-wide Ruff reports 13 existing findings only in unchanged `targets/LinkWatch`. Frontend `npm ci` succeeded (0 audit vulnerabilities) and `npm run build` passed TypeScript and Vite production build. |
| Six-slide presentation | **Missing from Git** | `git ls-files '*.ppt' '*.pptx' '*.pdf'` found no tracked presentation. Prepare the required deck before submission. |
| Live demonstration | **Pending** | No live presentation or rehearsal was observed in this audit. Backend run instructions and existing validated evidence are available; rehearse the offline capsule import/demo and explain that the candidate has an observed regression. |

## Findings to present accurately

- The fresh dynamic static scan of `targets/LinkWatch` observed 26 declarations,
  14 normalized packages, 22 import locations and a proven Pydantic manifest
  conflict. It did not execute target code or run verification.
- The actual manifest-only comparison tested Pydantic 1.10.13 versus 2.14.1.
  The candidate failed the whitespace-stripping probe, so the verdict is
  `regression_detected`.
- One existing pytest failure (Jinja2/MarkupSafe report import) occurred in
  both baseline and candidate. It is not a Pydantic regression.
- A minimal Pydantic configuration-key edit is only an engineer-reviewed
  suggestion; it was not applied or verified. The later Gemma repair request
  returned no valid proposal.
- Do not claim the candidate is compatible, all dependencies are safe, the
  repair works, or the report failure was fixed.

## Submission blockers / final actions

1. Review the local integration report, commit graph and test evidence.
2. Confirm the six-slide deck and any organizer presentation/capsule instructions.
3. Rehearse the live demo from the integration checkout using the saved capsule;
   do not depend on hosted inference being available live.
4. After approval, push `submission/integration` to the existing fork with a
   normal non-force push. No push has been performed.

Do not include `.env`, API keys, local environments, caches or unreviewed
generated output in a submission.

## Integration commit ancestry

- Fork parent: `f52f3930c8e7c33d934ccf614955a38e26984bd5`
- LinkWatch subtree relocation: `8cd30917b68cc2df944074890163bfa23c28ff38`
- GemForge docs/frontend branch integration: `4d696702487e99d0629ce736890d3ddeb637253e`
- Fork/GemForge unrelated-history merge: `3e629d3fa79e9af4b710385c0dee07a59bf84cee`

The integrated checkout's Python tests, frontend build and live scan were run
locally. The original LinkWatch source tree was not changed to silence Ruff;
repository-wide lint findings in that imported upstream source are recorded
above. No integrated commits have been pushed.

### Preserved capsule SHA256

| File | SHA256 |
| --- | --- |
| `evidence/linkwatch/linkwatch-phase3.json` | `DF9279443570CE6F550A116CCF9706EF590D7C7ED77455502A5B50B9DA2328A1` |
| `evidence/linkwatch/linkwatch-phase3.md` | `79406DE8600841709FA188C59700442209D961606A419233ECEAA827B6898678` |
| `evidence/linkwatch/linkwatch-repair-1.json` | `7A136ABF1C70F75C79D6376603DB816F3492143A92DEF89CA37C5184DABEA6EF` |
| `evidence/linkwatch/linkwatch-repair-1.md` | `7F7790E53158353B0F95055F612019F067F6EC0B23A4811662D1152F3FEA1A8C` |
