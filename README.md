# GemForge

**Rogue One · Hacktoberfest 2026 Track 1 — Gemma 4: Dependency Resilience**

GemForge helps Python maintainers investigate dependency migration risk before
changing application code. It reads manifests and Python source without running
the scanned repository, identifies declaration conflicts and import usage,
then exports a versioned **Dependency Exit Capsule** with evidence and limits.
Optional hosted Gemma 4 analysis adds migration hypotheses; it does not replace
observed facts or prove compatibility.

The required public repository is
[yojit2016/H26_RogueOne_GemForge](https://github.com/yojit2016/H26_RogueOne_GemForge),
a genuine fork of `rishrek/LinkWatch`. Local integration commits are not pushed;
the public fork still points to its original LinkWatch commit. See
[SUBMISSION-AUDIT.md](SUBMISSION-AUDIT.md) for current readiness.

Open `GemForge.code-workspace` for development. GemForge lives at the repository
root; the complete, history-preserving LinkWatch source tree is at
`targets/LinkWatch/` and is analyzed dynamically. See
[REPOSITORIES.md](REPOSITORIES.md) for repository boundaries.

## Problem and approach

Dependency scanners often report version ranges without showing where a package
is used or whether a suggested upgrade changes behavior. GemForge connects
manifest declarations, static import locations, bounded source evidence,
optional AI hypotheses and explicitly approved baseline/candidate checks in one
portable record. It distinguishes a metadata conflict from a demonstrated
regression, and both from an unverified suggestion.

## Features

- Read-only Python manifest and AST import analysis with source locations.
- Deterministic constraint assessments and explicit uncertainty/limitations.
- Versioned JSON and Markdown capsules for sharing or importing prior results.
- Optional evidence-grounded Gemma 4 migration hypotheses; no AI commands run.
- Explicit-consent manifest-only baseline/candidate verification with recorded
  versions, checks, comparisons and cleanup evidence.
- Evidence-grounded, **unverified** source repair suggestions; never applied or
  executed by GemForge.
- Local FastAPI endpoints for scanning, analysis, capsule import/export,
  verification views and repair suggestions.

## Architecture

```text
repository manifests + Python source
                 |
     deterministic scanner (offline, read-only)
                 |
       typed facts + bounded evidence
           /                 \
 optional Gemma 4       explicit-consent
 hypothesis             manifest-only checks
           \                 /
        Dependency Exit Capsule
           /                 \
       Typer CLI         local FastAPI
```

AI output is stored separately from scanner facts and execution results. A
successful inference is not a compatibility result; a selected-check pass is
not a universal safety verdict.

## Technology stack

- **Backend:** Python 3.12+, FastAPI, Pydantic, Typer, Rich, `packaging`,
  `tomllib`, and Uvicorn.
- **Hosted inference (optional):** Google GenAI Python SDK (`google-genai`) and
  `python-dotenv`; no local model runtime is required.
- **Frontend:** React, TypeScript and Vite, using Node.js 22.12+ (Node 24 also
  works). The dashboard branch is integrated locally; its original feature
  commits remain in history.
- **Validation:** pytest and Ruff.

## Setup

Requires Python 3.12+ and Node.js 22.12+ (Node 24 is also suitable).
Windows PowerShell, from this directory:

```powershell
py -3.12 -m venv .venv
.venv/Scripts/python.exe -m pip install -e '.[dev,ai]'
.venv/Scripts/gemforge.exe scan C:/path/to/repository --json
```

If using uv: `uv venv --python 3.12` then
`uv pip install --python .venv/Scripts/python.exe -e '.[dev,ai]'`.
On Linux/macOS use `python3.12`, `.venv/bin/python`, and `.venv/bin/gemforge`.
Install development dependencies only for GemForge; scans do not install target dependencies.
The `ai` extra is optional for offline scans, but required for the full SDK test
suite and real inference. SDK-specific tests explicitly skip if it is absent.

```powershell
New-Item -ItemType Directory -Force capsules
.venv/Scripts/gemforge.exe scan C:/path/to/repository --json --output capsules/scan.json --markdown capsules/scan.md
# Explicit distribution/import name mapping, when needed:
.venv/Scripts/gemforge.exe scan C:/path/to/repository --import-map dateutil=python-dateutil
.venv/Scripts/python.exe -m pytest -q
.venv/Scripts/ruff.exe check src tests
```

Reports go to stderr and `--json` emits clean JSON on stdout. Export destinations
must be new files; existing files are never overwritten. Exit code 0 means the scan
completed, not that dependencies are safe; 2 means input/export failure. Partial
analysis is recorded in `limitations`. Risks do not change the exit code.

## CLI commands

```powershell
# Analyze the repository offline (no hosted request):
.venv/Scripts/gemforge.exe analyze targets/LinkWatch --json

# Request the hosted Gemma 4 analysis; review public-data disclosure first:
.venv/Scripts/gemforge.exe analyze targets/LinkWatch --ai --allow-hosted --json --import-map dateutil=python-dateutil

# Preview a manifest-only verification plan; execution needs separate consent:
.venv/Scripts/gemforge.exe verify targets/LinkWatch --dependency pydantic --target 'pydantic>=2,<3' --import-module linkwatch.config

# Preview repair evidence offline from a saved regression capsule:
.venv/Scripts/gemforge.exe repair evidence/linkwatch/linkwatch-phase3.json --dependency pydantic --json
```

`verify` without `--confirm-execution` is a preview and does not run the target.
Read the command-specific `--help` before requesting execution or hosted inference.

## Local API and frontend

```powershell
.venv/Scripts/python.exe -m uvicorn gemforge.api:app --host 127.0.0.1 --port 8000
# In a second terminal:
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5173. The React/TypeScript dashboard scans an explicit local
path or public GitHub HTTPS repository through Vite's `/api` proxy. API docs:
http://127.0.0.1:8000/docs. `POST /scan` accepts
`{"path":"https://github.com/rishrek/LinkWatch","import_map":{}}` or a local
directory and returns a capsule.
`GET /health` reports backend availability. `npm.cmd run build` typechecks and builds.
The production frontend needs a same-origin `/api` reverse proxy; the Vite proxy is
development-only. Keep this unauthenticated local filesystem API bound to loopback;
remote hosting/authentication is outside the current implementation.

`POST /analyze` accepts the scan fields plus optional `source_commit`, `ai` (default false), `allow_hosted`
(default false), and `max_ai_packages` (default 10, range 1–50). It completes
synchronously and returns `{ "id": "...", "capsule": {...} }` with HTTP 201.
`GET /analyses/{id}` retrieves it; `GET /analyses/{id}/export?format=json` or
`format=markdown` exports it without filesystem writes. Only the latest 20 results
are held in process memory; restart/eviction returns 404. Hosted inference can make
this synchronous request slow. An HTTP 201 means an analysis capsule was created;
inspect `ai_status`, recommendations and inference errors to determine AI success.
For GitHub inputs, the backend shallow-checks out a temporary copy without hooks
or submodules, records the checked-out commit in `source_commit`, and cleans the
copy after the request. Checkouts time out after 120 seconds and are capped at
20,000 files/100 MiB of checked-out source. The dashboard scans offline first;
hosted Gemma analysis is a separate action requiring explicit data-sharing consent.
Capsules retain the import map so follow-up analysis uses the same usage mappings.
Verification first returns a manifest-only plan for review, then requires a second
explicit consent before it installs dependencies or executes repository tests.
Virtual environments are not a security sandbox.

## LinkWatch demo

LinkWatch is both the confirmed starter-fork parent and the analysis target:
https://github.com/rishrek/LinkWatch. The fork's original commit is retained in
history, and all original source, tests, manifests and license are preserved under
`targets/LinkWatch/`. No target scripts or tests are run by scanning.

```powershell
.venv/Scripts/gemforge.exe scan targets/LinkWatch --json --import-map dateutil=python-dateutil --output capsules/linkwatch.json --markdown capsules/linkwatch.md
```

The API and dashboard also accept an arbitrary local repository path; the
frontend's scan submits that path (or the public URL) to FastAPI. Its bundled LinkWatch capsule
is a demo fixture only, not a substitute for scanning the included target. In
demo mode, the Scan dialog defaults to `targets/LinkWatch`; submitting it calls
the local API, which reads the selected repository path dynamically.

Observed manifests declare `pydantic==1.10.13` in requirements.txt and
`pydantic>=2` in pyproject.toml. The generic scanner detects this conflict from files;
it contains no LinkWatch-specific risk rules. No package is labeled abandoned or
vulnerable from its name/version alone.

## Verified LinkWatch findings

These results are from the recorded analysis and one approved verification run
against LinkWatch commit
`f52f3930c8e7c33d934ccf614955a38e26984bd5`; they are not claims about every
installation profile or release.

| Evidence | Observed result |
| --- | --- |
| Static scan | 26 dependency declarations, 14 normalized packages, 22 import/reference locations, and a proven Pydantic manifest conflict. |
| Hosted Gemma 4 analysis | A real migration hypothesis was generated and structurally validated after a bounded retry. It proposed a Pydantic 2 migration; the suggestion itself was not proof of compatibility. |
| Baseline/candidate | Pydantic 1.10.13 baseline versus 2.14.1 candidate; candidate changed only the Pydantic manifest constraints. |
| Existing test suite | 9 passed and 1 failed in both environments. The same Jinja2/MarkupSafe report import failure occurred on both sides. |
| Five reviewed probes | 4 passed and 1 regressed in the candidate: whitespace in a `Site` name was no longer stripped. |
| Overall verdict | `regression_detected`; the candidate was not established as compatible. |
| Later repair inference | The hosted request returned two HTTP 504 deadline failures. No model-generated repair was returned. |

The failing whitespace behavior is an actual observed regression. An
engineer-reviewed one-line configuration-key replacement is documented in
[REPAIR-VALIDATION.md](REPAIR-VALIDATION.md), but remains **unverified,
unapplied, and not a Gemma-generated suggestion**. No repaired code or test pass
is claimed. The independent report failure must not be attributed to Pydantic.

In the integrated checkout, `.venv/Scripts/python.exe -m pytest -q` reported
**152 passed, 1 warning** (the Starlette/httpx test-client deprecation). Ruff
passes for GemForge's `src` and `tests`. A repository-wide `ruff check .` reports
13 pre-existing lint findings confined to unchanged `targets/LinkWatch/`; these
were not silently fixed in the imported upstream source. `npm.cmd ci` succeeded
with zero reported vulnerabilities and `npm.cmd run build` passed TypeScript
and the Vite production build. These are project build/test results, not a claim
that LinkWatch's own tests or candidate dependency migration passed.

A fresh dynamic static scan of `targets/LinkWatch/` also reproduced the known
manifest conflict: 26 declarations, 14 normalized packages, 22 usage locations,
one proven Pydantic `constraint_conflict`, and `verification:not_run`. The scan
read manifests and source without executing LinkWatch or making a hosted AI
request.

## Contracts and limitations

- `gemforge.engine.scan_repository(path, import_map=None)` is shared by CLI and API.
- Capsules separate manifest facts, constraint assessments, usages, AI recommendations,
  verification, and limitations. Every at-risk package gets a recommendation record,
  initially `not_requested`, then `generated` or `unavailable` when AI is explicitly
  requested. AI hypotheses cannot modify observed facts. Verification is `not_run`.
- PEP 508 requirements and PEP 621 dependencies/optional dependencies are parsed with
  packaging and tomllib. Dependency groups containing strings are read; group includes
  are reported unsupported. Duplicate declarations retain individual sources.
- All discovered requirements*.txt and pyproject.toml declarations are compared together.
  Scan independent projects/profiles separately. Markers and optional groups remain
  uncertain until a target environment and install selection are defined.
- Exact pins and disjoint supported bounds can prove conflicts. A candidate satisfying
  every specifier proves metadata overlap only, not a published release or runtime
  compatibility. Unsupported/unsolved cases stay uncertain. Local versions and arbitrary
  equality are conservative; prereleases are considered for existential overlap.
- Source lines for TOML strings are best-effort and null when ambiguous. Pip options,
  includes, hashes, editable installs, Poetry tables, setup.py, lockfiles, dynamic
  metadata, build dependencies and transitive dependencies are not resolved.
- AST imports and straightforward module-level aliases are mapped. Name-based
  distribution mappings are labeled heuristic; supply explicit mappings for names such
  as `dateutil`. Dynamic/relative/star imports, nested references, conditional bindings,
  reassignment, local module shadowing and runtime reachability are not resolved.
- Ignored environments/build folders and symlinks/junctions are skipped. Discovery is
  capped at 20,000 files and individual source/manifest reads at 2 MB; partial reads and
  parse failures are reported. Repository code is never executed by the scanner.
- No PyPI, advisory or maintenance metadata fetch is implemented. An empty risk list
  is not a safety verdict. Scans need no network once GemForge is installed.

## Gemma 4 migration analysis

The organizer has explicitly confirmed that hosted/cloud Gemma 4 inference is
permitted for Track 1. GemForge retains the official Google GenAI SDK integration
with `gemma-4-26b-a4b-it`, bounded retries, structured response validation and
sanitized diagnostics. No local inference runtime migration or model substitution
is planned. This confirmation permits inference with relevant public
LinkWatch excerpts. The default is `gemma-4-26b-a4b-it`, configurable through
`GEMFORGE_MODEL`. Only Gemma 4 model IDs are accepted; there is no model substitution.
Google documents hosted access through the official Google GenAI SDK:
https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api.

The model identifier used is `gemma-4-26b-a4b-it`. The SDK sends hosted requests
through Google's Gemini API Developer API (`google_genai_developer_api`); no
separate numeric provider model-build version was recorded. Gemma's role is to
propose evidence-cited migration hypotheses and, when requested, repair
hypotheses. Scanner findings and compatibility outcomes are produced and stored
separately. The initial real LinkWatch migration inference succeeded after a
bounded retry using `google-genai` 2.31.0; the later repair-generation request
did not succeed (see the verified results above).

```powershell
# Once only: copy the template, then edit .env locally to set GEMINI_API_KEY.
Copy-Item .env.example .env
.venv/Scripts/gemforge.exe analyze targets/LinkWatch --ai --allow-hosted --json --import-map dateutil=python-dateutil
# Optional new-file exports:
.venv/Scripts/gemforge.exe analyze targets/LinkWatch --ai --allow-hosted --output capsules/ai.json --markdown capsules/ai.md
```

Keep the key local; never paste it into an issue or commit it. `.env` is ignored.
Configuration reads only `.env` in the invocation directory (no parent/target
search), without interpolation or environment mutation. Shell values override
file values, including empty shell values. Legacy `GOOGLE_API_KEY` and
`GEMFORGE_MODEL_ID` remain aliases when the new names are absent; legacy model IDs
still must name Gemma 4. `--allow-hosted` or `GEMFORGE_ALLOW_HOSTED=true` explicitly
permits sending the selected evidence. Review disclosure permissions for other
repositories. `scan` and `analyze` without `--ai` make no AI/network requests.

Pipeline: deterministic scan/risk analysis → evidence builder → Gemma 4 → strict
Pydantic and provenance validation. Evidence includes actual declarations, risk
IDs, usage locations, up to eight relevant source excerpts per dependency (60
lines/4000 characters each), and filename-based test inventory. `.env` and unrelated
files are excluded; credential-like source assignments are redacted. Excerpt hashes
cover the text shown. Working-tree reads are not an atomic snapshot.

Every at-risk package receives either a validated AI hypothesis or an explicit
limitation. The default request budget is ten packages (`--max-ai-packages` changes
it); excess packages retain evidence with a request-budget limitation. Generated
objects must cite all observed risks and a manifest, use observed file paths, and
contain concerns, unknowns and limitations. Unknown file paths, fabricated evidence
IDs, malformed/truncated responses and claimed verification results are rejected.
JSON is requested in the prompt and validated locally; native JSON-schema mode is
not assumed to be supported by the chosen model.

The adapter checks model access with `models.get`, then calls `generate_content`
without custom generation settings, tools, native JSON schema or thinking settings.
It pins Google's Developer API endpoint, disables SDK retries, and defaults to two
attempts per operation with exponential backoff plus bounded jitter. Set
`GEMFORGE_TIMEOUT_MS` (1000–120000, default 60000), `GEMFORGE_MAX_ATTEMPTS` (1–4,
default 2), and `GEMFORGE_BACKOFF_SECONDS` (0–5, default 1) in the shell or local
`.env` to tune requests. The successful full live diagnostic used 90000 ms. Auth
and model-not-found failures are not retried. Rate limits, selected server errors
and transport timeouts get bounded retries. Model metadata, response ID, finish
reason, token counts, total call count/duration and prompt/response hashes are
recorded when available. Per-attempt API diagnostics preserve only sanitized status,
provider message and selected request IDs. A persistent server/rate/network/auth
failure stops further dependency requests within that analysis; remaining risks
receive explicit limitations. Raw error bodies, credentials and raw unvalidated
model responses are not exported.

An accepted recommendation is **an AI hypothesis**, not proof that its suggested
version exists, API advice is correct, or a migration is compatible. Structural
and citation checks cannot establish semantic truth. Suggested commands are text
only and are never executed. New-file proposals are currently limited to prose
steps; structured change paths must already occur in the observed evidence.

CLI exit codes: 0 = completed analysis, 2 = input/export failure, 3 = requested AI
analysis unavailable or partial. JSON and capsules remain available on exit 3.
Minimal text, dependency explanation, locally validated JSON and the full LinkWatch
pipeline have now succeeded with `gemma-4-26b-a4b-it`. Intermittent provider HTTP 500
errors were also observed and preserved; the final full request recovered on its
bounded retry. See `GEMMA-DIAGNOSTICS.md` and `PHASE2-VALIDATION.md` for actual results.

## Manifest-only migration verification

Preview a plan first; this executes no target code and installs nothing:

```powershell
.venv/Scripts/gemforge.exe verify targets/LinkWatch --dependency pydantic --target 'pydantic>=2,<3' --import-module linkwatch.config
```

After reviewing the repository, dependencies, tests and probes, an explicit
`--confirm-execution` permits running those checks under your normal account.
Virtual environments isolate packages; they are **not an OS security sandbox**.
Administrator/root execution is rejected. For untrusted code, use an external
container/VM boundary. Keep the API local and do not accept requests from others.
The one approved demonstration uses this command shape:

```powershell
# This command performs a NEW run; it is not needed to read existing evidence.
.venv/Scripts/gemforge.exe verify targets/LinkWatch --dependency pydantic --target 'pydantic>=2,<3' --import-module linkwatch.config --probe-file examples/linkwatch-pydantic-probes.json --confirm-execution --timeout 60 --install-timeout 180 --output capsules/verification.json --markdown capsules/verification.md
```

`--analysis` retains a matching previous capsule's AI provenance without making
another inference request. Without `--target`, exactly one generated same-package
target recommendation must exist in that capsule. An explicit target can narrow
the AI proposal to the major version approved for testing. AI commands and source
patches are never executed. The candidate modifies unconditional declarations in
root requirements files and PEP 621 runtime dependencies only; unsupported or
ambiguous edits are rejected. Original file hashes guard against stale plans.

Each side gets a separate temporary repository, home directory and venv. Secret
files, Git metadata, caches, links and unsupported file types are excluded. Child
environments exclude parent API keys and credentials. This does not prevent
trusted target code from accessing the host; consent must reflect that boundary.
The install profile is root `requirements.txt` plus `requirements-dev.txt`, or
PEP 621 runtime dependencies if requirements.txt is absent, plus a pytest harness
`>=8.3,<10`. Installation uses only binary wheels from PyPI; no project build hooks
or global installation run. URL/editable/options-based requirements are rejected.
Other baseline package versions are pinned in the candidate; new transitives of
the selected dependency may be installed. This tests the recorded profile, not
every optional extra or installation route. A conflicting baseline pyproject is
retained as evidence rather than passed together to pip as an impossible input.

Fixed checks cover Python syntax, the selected import, discovered pytest tests,
and optionally reviewed data-only model-construction probes. Timeout and output
capture are bounded. Missing tests, missing version metadata, collection errors,
timeouts and installation failures cannot become passes. Capsules retain the
diff, snapshot hash, versions, wheel hashes, commands, sanitized output, per-test
and per-probe outcomes, comparison, limitations and cleanup status.

Verdicts: `verified_for_selected_checks`, `regression_detected`, `inconclusive`,
`not_run`, `execution_failed`. CLI exits: 0 = preview/selected-check verification,
2 = invalid input/export, 4 = observed regression, 5 = inconclusive, 6 = execution
failure. Evidence is exported even for verification failures. A selected-check
pass never means fully safe.

`POST /verify` accepts `path`, `dependency`, `target`, optional `analysis_id`,
`confirm_execution` (false by default), `import_module`, `probes`, `timeout`, and
`install_timeout`. It returns the same cached/exportable `{id,capsule}` shape as
`/analyze`; inspect the verdict even when HTTP 201 is returned. Requests are
synchronous. It accepts no arbitrary command/source-patch fields.

See `PHASE3-VALIDATION.md` for the actual approved LinkWatch run.

## Evidence-grounded repair suggestions

Use the preserved regression capsule to preview repair evidence without network
requests, installations, source changes or target-code execution:

```powershell
.venv/Scripts/gemforge.exe repair evidence/linkwatch/linkwatch-phase3.json --dependency pydantic --json
# Real hosted suggestion, saved to NEW files:
.venv/Scripts/gemforge.exe repair evidence/linkwatch/linkwatch-phase3.json --dependency pydantic --ai --allow-hosted --output capsules/repair-new.json --markdown capsules/repair-new.md
```

The shared engine sends selected matched source excerpts, actual probe results,
recorded warnings and previous AI hypotheses to the existing Gemma 4 adapter.
Suggestions cite exact inclusive source lines with matching before text and
proposed after text. Unknown locations, stale source, overlapping edits and
fabricated evidence references are rejected. This validates structure and grounding,
not correctness or compatibility. Suggestions remain **unverified and unapplied**;
there is no source-application or arbitrary-command pathway. Verification results
and original capsules are preserved. Export destinations never overwrite files.
CLI exit 3 means requested repair inference was unavailable or invalid; a new
failure capsule still records the sanitized reason.

For the dashboard, `POST /analyses/import` restores a saved capsule without a rerun,
`GET /analyses/{id}/verification` exposes typed actual probe values, and
`POST /repairs` creates a separate suggestion capsule. Existing routes are retained.
See [API-CONTRACT.md](API-CONTRACT.md) for schemas, examples and result semantics.
The Antigravity dashboard branch is integrated locally; its original commits
remain reachable in the submission history. See
[FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md) for the integrated frontend/API
contract. The included dashboard fixture is not a fresh analysis.

The first genuine hosted repair request confirmed model access but exhausted two
generation attempts with HTTP 504 `DEADLINE_EXCEEDED`; its repair capsule records
`unavailable`, with no invented AI proposal. The original regression artifacts
remain unchanged. See [REPAIR-VALIDATION.md](REPAIR-VALIDATION.md) for actual
diagnostics and the separate, unverified engineer-reviewed minimal key rename.

## Frontend integration and submission audit

Use [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md) for the current API routes,
request shapes, capsule import flow, typed verification details, exports and
error handling. It summarizes [API-CONTRACT.md](API-CONTRACT.md), the backend
contract source of truth.

The local integration is based on the confirmed public fork, but these
integration commits have not been pushed. A six-slide deck is not tracked, and
a live demo rehearsal is not verified. See [SUBMISSION-AUDIT.md](SUBMISSION-AUDIT.md)
for the checklist and evidence status.

## Remaining work / Phase 4

1. Review the actual Gemma recommendation for semantic correctness before applying
   anything. Schema/citation validation does not prove its compatibility claims.
2. Address observed compatibility regressions in separately reviewed candidate
   source migrations. Expand behavioral tests and container-backed execution;
   host venv execution is limited to explicitly reviewed trusted repositories.
3. Add real release/advisory metadata with provenance and explicit network policy;
   expand import resolution and semantic recommendation checks.
4. Improve frontend analysis/review/export flows after backend verification.

MIT licensed; see [LICENSE](LICENSE). Submission metadata is recorded in
`[tool.gemforge.submission]` in `pyproject.toml`; it is declarative metadata, not
a publishing integration. The final repository must be public and named
`H26_RogueOne_GemForge`. The local integration branch is
`submission/integration`; it retains the original LinkWatch fork ancestry and
GemForge history. Do not push until the owner has reviewed the integration report.
