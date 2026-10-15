# Hacktoberfest Track 1 submission audit

**Audit date:** 15 October 2026
**Team:** Rogue One
**Intended repository:** `H26_RogueOne_GemForge`
**Readiness:** **Not ready to submit**

This is an evidence-based checklist, not an independent certification against
the organizer's official handbook. The handbook/link has not been provided or
independently reviewed in this workspace. Event and track details below are
recorded in [DEVELOPMENT.md](DEVELOPMENT.md) as user-confirmed; confirm any
remaining official rules with the organizer before publication.

## Requirements checklist

| Requirement | Status | Evidence and remaining action |
| --- | --- | --- |
| Repository name `H26_RogueOne_GemForge` | **Pending** | This is the intended name in `pyproject.toml`; the checkout is still the local `GemForge` repository. Create/use the approved submission repository only after provenance is confirmed. |
| Starter-fork provenance | **BLOCKER** | No starter checkout/history or approved fork URL is present. LinkWatch is the analysis target, not established as the required starter. Obtain the official starter URL and integration rules; preserve both histories if integration is approved. |
| Public GitHub publication | **BLOCKER** | The local repository has no remote and is not published. GitHub repository search returned no repository for the exact intended name at audit time. Publish only to the confirmed approved fork; do not push from this local audit. |
| Open-source license | **Ready** | [LICENSE](LICENSE) contains the MIT License. Confirm the organizer accepts it if the handbook specifies a license. |
| README | **Ready after this docs change** | [README.md](README.md) now covers the problem, product, stack, architecture, setup, CLI/API, findings, limits and license. |
| Actual LinkWatch analysis | **Complete** | The real target was scanned; hosted Gemma 4 migration inference succeeded after a bounded retry. See [PHASE2-VALIDATION.md](PHASE2-VALIDATION.md) and [GEMMA-DIAGNOSTICS.md](GEMMA-DIAGNOSTICS.md). |
| Gemma 4 integration | **Implemented and exercised** | Official Google GenAI SDK hosted path, model ID `gemma-4-26b-a4b-it`; one real migration hypothesis generated. Later repair-generation request exhausted two HTTP 504 attempts and returned no suggestion. This is not evidence of consistent availability. |
| Dependency Exit Capsule | **Generated; submission packaging pending** | JSON/Markdown scan, migration and verification capsules exist locally under ignored `capsules/`. They are not tracked or committed. Confirm whether a capsule must be included/uploaded; select and review an artifact before distributing it. |
| Test evidence | **Verified** | Fresh audit run: 152 passed, two warnings (Starlette/httpx deprecation and pytest cache access). Command and result are recorded in [README.md](README.md). |
| Six-slide presentation | **Missing from Git** | `git ls-files '*.ppt' '*.pptx' '*.pdf'` found no tracked presentation. An external/untracked deck was not assessed. Prepare and review the required six slides if confirmed by the handbook. |
| Live demonstration | **Pending** | No live presentation or rehearsal was observed in this audit. Backend run instructions and existing validated evidence are available; rehearse the offline capsule import/demo and explain that the candidate has an observed regression. |

## Findings to present accurately

- The static scan observed 26 declarations, 14 normalized packages, 22 import
  locations and a Pydantic manifest conflict in LinkWatch.
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

1. Get the official starter repository/fork URL and confirm how the organizer
   expects prior local work and history to be disclosed.
2. Integrate only in a separate clone of the approved fork; review conflicts,
   keep the starter ancestry and verify the final exact repository name.
3. Confirm the official handbook's six-slide and capsule-delivery requirements;
   prepare the deck and decide which reviewed capsule to distribute.
4. Create the public repository through the approved process and verify its
   visibility and URL. This audit has not created, pushed, merged or published
   anything.
5. Rehearse the live demonstration from the approved submission checkout and
   have a saved capsule available so hosted inference is not required live.

Do not include `.env`, API keys, local environments, caches or unreviewed
generated output in a submission.
