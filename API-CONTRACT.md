# GemForge backend contract for the dashboard

The dashboard and backend are integrated in the local submission branch. The
frontend uses the same-origin Vite development proxy and the running backend's
OpenAPI schema at `http://127.0.0.1:8000/openapi.json`.

Run `.venv/Scripts/python.exe -m uvicorn gemforge.api:app --host 127.0.0.1 --port 8000`.
The existing Vite development proxy exposes these backend routes under `/api`.
The API is for trusted local use and is unauthenticated; keep it on loopback.

## Existing routes remain compatible

| Method/path | Input | Output |
| --- | --- | --- |
| `GET /health` | None | `{status:"ok",phase:"3"}` |
| `POST /scan` | `ScanRequest`: local path or public GitHub HTTPS URL, optional source_commit/import_map | `ExitCapsule` |
| `POST /analyze` | `AnalysisRequest`: scan fields, ai, allow_hosted, max_ai_packages | HTTP 201 `AnalysisResponse` |
| `POST /verify` | `VerificationRequest`: source, dependency, optional target/analysis_id/source_commit, consent, reviewed probes and limits | HTTP 201 `AnalysisResponse` |
| `GET /analyses/{id}` | Cached ID | `ExitCapsule` |
| `GET /analyses/{id}/export?format=json` | Cached ID | application/json `ExitCapsule` attachment |
| `GET /analyses/{id}/export?format=markdown` | Cached ID | text/markdown attachment |

`AnalysisResponse` remains `{id:string,capsule:ExitCapsule}`. Existing fields and
enum values are unchanged. Capsule schema version remains `1.0`; optional
`source_commit` records the resolved 40-character Git commit for remote sources.
Capsules also retain the normalized `import_map` used for usage analysis, so a
follow-up Gemma request uses the same module-to-distribution mapping.
The additive
`repairs` list defaults to `[]` when old capsules are read. Handle absent repairs
in previously saved JSON. `/scan` is read-only/offline; `/analyze` without AI is
offline. Hosted inference remains opt-in and uses the existing Gemma 4 SDK adapter.

## Repository sources and commit pinning

`path` accepts either a local directory or `https://github.com/<owner>/<repo>`
(an optional `.git` suffix is allowed). URL input is restricted to public
GitHub HTTPS repositories; other schemes, hosts, credentials, queries and
fragments are rejected. The backend uses Git non-interactively, disables hooks,
does not initialize submodules, shallow-checks out into an owned temporary
directory, and removes it after the request. Checkout is limited to 120 seconds,
20,000 files and 100 MiB of checked-out source. Analysis records the resolved
commit in `capsule.source_commit`. Supply that SHA with a later analysis/verify
request to pin the operation to the same revision. `/verify` also reuses the
prior capsule's commit if its request omits `source_commit`.

Example:

```json
{"path":"https://github.com/rishrek/LinkWatch","ai":false}
```

`/analyze` with `ai:false` provides deterministic findings first. A separate
`/analyze` request with `ai:true` and explicit `allow_hosted:true` requests
Gemma 4 hypotheses against the same URL and `source_commit`. No hosted request
is sent by scan-only analysis.

| Dashboard data | Typed capsule field |
| --- | --- |
| Repository and declared requirements | `repository`, `dependencies: Dependency[]` |
| Deterministic risk findings | `risks: DetectedRisk[]`, `constraints: ConstraintAssessment[]` |
| Actual import/reference locations | `usages: UsageLocation[]` |
| AI migration hypotheses | `recommendations: AIRecommendation[]`, `inferences: InferenceRecord[]` |
| Baseline/candidate executions, test identities, versions, logs | `verification.baseline`, `.candidate: EnvironmentResult|null` |
| Paired check/test/probe comparison | `verification.comparisons: CheckComparison[]` |
| Verdict, scope, cleanup, candidate diff | `verification: VerificationStatus` |
| Unverified source repair suggestions | `repairs: RepairRecommendation[]` |

Do not equate HTTP 201, `ai_status:"generated"`, or successful installation with
compatibility. Render `verification.verdict` independently. Its existing values
are `not_run`, `execution_failed`, `inconclusive`, `regression_detected` and
`verified_for_selected_checks`; the last still is not a universal safety verdict.

`POST /verify` with `confirm_execution:false` prepares and returns a manifest-only
plan without running target code. Review the returned `verification.plan` before
submitting the request again with `confirm_execution:true` and the returned
analysis ID. Explicit consent is required for tests/probes; Python virtual
environments isolate packages but are not a security sandbox.

## Import an existing capsule without rerunning verification

`POST /analyses/import` accepts an `ExitCapsule` JSON object directly, not a wrapper
or server-side filename. It returns HTTP 201 `AnalysisResponse` with a new cached
ID. Pydantic rejects unknown/malformed fields; serialized capsules over 2 MB are
rejected with HTTP 400. Importing performs no inference, source writes or target
execution. It restores reported evidence; it does not independently attest that
user-supplied test logs are genuine.

Use this route to demonstrate the path-redacted public copy of the preserved
`evidence/linkwatch/linkwatch-phase3.json` result after backend restart. Do not
rerun `/verify` just to populate the dashboard.
The cache still retains only the latest 20 capsules; restart/eviction yields 404.
Existing downloaded files remain the durable evidence.

## Typed probe detail view

`GET /analyses/{id}/verification` returns `VerificationView`:

```typescript
type VerificationView = {
  verification: VerificationStatus;
  probes: Array<{
    name: string;
    specification: ModelProbe | null;
    baseline: ProbeObservation | null;
    candidate: ProbeObservation | null;
    comparison: CheckComparison | null;
  }>;
  limitations: string[];
};
type ProbeObservation = {
  name: string;
  status: "passed" | "failed";
  actual: Record<string, JsonValue> | null;
  actual_exception: string | null;
  error_type: string | null;
  message: string | null;
};
```

This view decodes the original runner's stored JSON output and checks it against
recorded probe statuses. It does not execute or modify the parent capsule. Missing,
truncated, duplicated or inconsistent details produce null values and explicit
limitations; no actual value is invented. The dashboard does not need to parse
command stdout. The saved LinkWatch whitespace comparison exposes baseline
`actual.name:"alpha"` and candidate `actual.name:"  alpha  "`.

## Repair suggestion workflow

`POST /repairs` accepts:

```json
{
  "analysis_id": "ID_OF_IMPORTED_OR_VERIFIED_REGRESSION",
  "dependency": "pydantic",
  "ai": false,
  "allow_hosted": false
}
```

The defaults create an offline evidence preview. `ai:true,allow_hosted:true`
requests real hosted Gemma 4 inference using configured credentials; shell/.env
configuration can also grant hosted consent. It sends selected matched source,
reviewed probe observations, diagnostic messages and prior AI advice, not full
repository logs or private configuration. Server API keys never enter responses.

Successful request handling returns HTTP 201 `AnalysisResponse` with a **new** ID
and a deep-copied capsule carrying an appended repair. The original cached capsule,
AI migration recommendations and verification result remain intact. Inference
failure is also represented in a new capsule, with no invented suggestion.

```typescript
type RepairRecommendation = {
  package: string;
  created_at: string; // ISO 8601
  status: "not_requested" | "generated" | "unavailable";
  origin: "ai_hypothesis";
  verification_status: "unverified";
  parent_verification_sha256: string;
  evidence: RepairEvidence[];
  proposal: RepairProposal | null;
  inference: InferenceRecord | null;
  reason: string;
};
type RepairChange = {
  source_evidence_id: string;
  file: string;
  start_line: number; // inclusive original-source location
  end_line: number;   // inclusive
  before: string;    // exact observed text, indentation retained
  after: string;     // suggested text only; never applied
  explanation: string;
};
```

`RepairProposal` contains `package`, `evidence_ids`, `failure_explanation`,
`changes:RepairChange[]`, `verification_plan:string[]`,
`compatibility_concerns:string[]` and `limitations:string[]`. `RepairEvidence`
contains `id`, `kind` (`source|probe|diagnostic|prior_recommendation`), description,
excerpt, excerpt SHA256, optional source/end_line and a regression boolean.

The backend requires a recorded paired model-probe regression with detailed
observations, unchanged declarations and source excerpts matching captured anchors.
It validates cited evidence and exact before text/line ranges; rejects unknown
paths, duplicate JSON keys, overlapping changes and model-supplied command or
verification fields. These checks establish grounding and structure, **not**
semantic correctness, syntax correctness or approval to execute the suggestion.
The parent hash covers normalized typed verification JSON, not the whole file and
not a signature. Original artifacts are preserved separately.

Display suggested code as untrusted text. There is no apply/patch/execute endpoint.
`POST /repairs` rejects `confirm_execution`, commands and unknown request fields
with HTTP 422. Existing `/verify` remains manifest-only and does not apply anything
in `repairs`, even when given a repair capsule. A source-level verification run
requires separate review and explicit authorization for the isolated candidate.

The original `regression_detected` verdict remains displayed after a generated
suggestion. Inspect `repairs[i].status` and `.inference` for repair-generation
success; root `ai_status` still describes the earlier migration analysis.
Exports include the suggestion, repair evidence and model provenance alongside
the untouched original results.

## Error and concurrency behavior

- HTTP 400: invalid path/state, stale or missing evidence, unsuitable regression,
  oversized imported capsule. No source repair execution occurs.
- HTTP 404: missing/evicted analysis ID.
- HTTP 422: typed request validation failure, unknown fields or invalid format.
- HTTP 201 with `repairs[-1].status:"unavailable"`: inference/configuration/provider
  or response-validation failure; read sanitized inference diagnostics and reason.
- Hosted and verification requests are synchronous and can take minutes under
  bounded timeouts/retries. Do not automatically retry them in the frontend.

The backend's regression tests exercise these routes, response schemas, preserved
parent data, typed observations, malformed AI responses and export media types.
