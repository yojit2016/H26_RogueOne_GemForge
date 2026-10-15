/**
 * Typed GemForge contracts mirroring src/gemforge/schemas.py and api.py.
 * Strictly aligned with backend pydantic schemas.
 */

export interface SourceLocation {
  file: string
  line: number | null
}

export interface Dependency {
  package: string
  constraint: string
  extras: string[]
  marker: string | null
  url: string | null
  group: string
  source: SourceLocation
  raw: string
}

export type RiskKind = "constraint_conflict" | "constraint_uncertainty" | "direct_reference"
export type RiskCertainty = "proven" | "uncertain"

export interface DetectedRisk {
  package: string
  kind: RiskKind
  certainty: RiskCertainty
  evidence: string
  sources: SourceLocation[]
}

export interface ConstraintAssessment {
  package: string
  status: "conflict" | "compatible" | "uncertain"
  explanation: string
  witness: string | null
}

export interface UsageLocation {
  package: string
  module: string
  symbol: string
  alias: string | null
  kind: "import" | "reference"
  mapping: "explicit" | "name_heuristic"
  source: SourceLocation
}

export interface EvidenceItem {
  id: string
  package: string
  kind: "manifest" | "risk" | "usage" | "source" | "test_inventory" | "limitation"
  description: string
  source: SourceLocation | null
  excerpt: string | null
  excerpt_sha256: string | null
}

export interface ProposedChange {
  file: string
  description: string
}

export interface VerificationCheck {
  command: string
  purpose: string
  status: "not_run"
}

export interface ProviderDiagnostic {
  operation: "model_access" | "generation"
  attempt: number
  http_status: number | null
  provider_status: string | null
  provider_message: string | null
  request_ids: Record<string, string>
  retryable: boolean
}

export interface InferenceRecord {
  package: string
  model_id: string
  access_method: "google_genai_developer_api"
  status: "not_requested" | "succeeded" | "failed" | "invalid_response" | "blocked"
  model_access: "not_checked" | "confirmed" | "failed"
  attempts: number
  duration_ms: number
  response_id: string | null
  model_version: string | null
  finish_reason: string | null
  input_tokens: number | null
  output_tokens: number | null
  prompt_sha256: string | null
  response_sha256: string | null
  error_code: string | null
  message: string | null
  diagnostics: ProviderDiagnostic[]
}

export interface AIRecommendation {
  package: string
  status: "not_requested" | "generated" | "unavailable"
  model_id: string | null
  replacement: string | null
  migration_steps: string[]
  limitations: string[]
  origin: "ai_hypothesis"
  original_constraints: string[]
  evidence_ids: string[]
  risk_explanation: string | null
  rationale: string | null
  affected_files: string[]
  proposed_changes: ProposedChange[]
  compatibility_concerns: string[]
  verification_checks: VerificationCheck[]
  unknowns: string[]
}

export interface ManifestEdit {
  file: string
  before_sha256: string
  before: string
  after: string
}

export interface MigrationPlan {
  dependency: string
  target: string
  edits: ManifestEdit[]
  unified_diff: string
  limitations: string[]
}

export interface ModelProbe {
  name: string
  module: string
  class_name: string
  kwargs: Record<string, unknown>
  expected_attributes: Record<string, unknown>
  expected_exception: string | null
}

export interface CommandResult {
  check: string
  argv: string[]
  status: "passed" | "failed" | "timeout" | "not_run" | "execution_failed"
  exit_code: number | null
  stdout: string
  stderr: string
  duration_ms: number
  output_truncated: boolean
}

export interface EnvironmentResult {
  label: "baseline" | "candidate"
  commands: CommandResult[]
  python_version: string | null
  installed_packages: Record<string, string>
  test_outcomes: Record<string, "passed" | "failed" | "error" | "skipped">
  probe_outcomes: Record<string, "passed" | "failed">
  limitations: string[]
  install_requirements: string[]
  constraints: string[]
  package_hashes: Record<string, string>
}

export interface CheckComparison {
  check: string
  status: "passed_both" | "baseline_failure" | "repaired" | "regression" | "not_comparable" | "not_run"
  explanation: string
}

export type VerificationVerdict =
  | "verified_for_selected_checks"
  | "regression_detected"
  | "inconclusive"
  | "not_run"
  | "execution_failed"

export interface VerificationStatus {
  status: "not_run" | "passed" | "failed" | "inconclusive"
  original_status: "not_run" | "passed" | "failed" | "inconclusive"
  candidate_status: "not_run" | "passed" | "failed" | "inconclusive"
  commands: string[]
  evidence: string[]
  reason: string
  verdict: VerificationVerdict
  plan: MigrationPlan | null
  install_profile: string | null
  baseline: EnvironmentResult | null
  candidate: EnvironmentResult | null
  comparisons: CheckComparison[]
  compatibility_gaps: string[]
  unresolved_risks: string[]
  cleanup_completed: boolean | null
  snapshot_sha256: string | null
  started_at: string | null
  completed_at: string | null
  probes: ModelProbe[]
  import_module: string | null
  timeout_seconds: number | null
  install_timeout_seconds: number | null
}

export type AIAnalysisStatus = "not_requested" | "generated" | "partial" | "unavailable" | "no_risks"

export interface ExitCapsule {
  schema_version: "1.0"
  generated_at: string
  repository: string
  dependencies: Dependency[]
  risks: DetectedRisk[]
  constraints: ConstraintAssessment[]
  usages: UsageLocation[]
  recommendations: AIRecommendation[]
  verification: VerificationStatus
  limitations: string[]
  evidence: EvidenceItem[]
  inferences: InferenceRecord[]
  ai_status: AIAnalysisStatus
}

// API Request/Response contracts
export interface ScanRequest {
  path: string
  import_map?: Record<string, string>
}

export interface AnalysisRequest extends ScanRequest {
  ai?: boolean
  allow_hosted?: boolean
  max_ai_packages?: number
}

export interface AnalysisResponse {
  id: string
  capsule: ExitCapsule
}

export interface VerificationRequest {
  path: string
  dependency: string
  target?: string | null
  analysis_id?: string | null
  confirm_execution: boolean
  probes?: ModelProbe[]
  import_module?: string | null
  timeout?: number
  install_timeout?: number
}

export interface HealthResponse {
  status: string
  phase: string
}
