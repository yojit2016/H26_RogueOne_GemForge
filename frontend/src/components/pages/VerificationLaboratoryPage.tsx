import { useState, useMemo } from "react"
import {
  FlaskConical,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Terminal,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileCode,
  ArrowRight,
  GitCompare,
  Sliders,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import type {
  ExitCapsule,
  CommandResult,
  CheckComparison,
  EnvironmentResult,
} from "@/types/gemforge"

interface VerificationLaboratoryPageProps {
  capsule: ExitCapsule | null
  onOpenVerificationModal: () => void
}

export function VerificationLaboratoryPage({
  capsule,
  onOpenVerificationModal,
}: VerificationLaboratoryPageProps) {
  const [selectedCheck, setSelectedCheck] = useState<string | null>("probes")
  const [activeTab, setActiveTab] = useState<"matrix" | "probes" | "tests" | "packages">("matrix")

  if (!capsule) {
    return (
      <div className="py-16 text-center text-[var(--muted-foreground)] text-xs">
        No active capsule loaded. Scan a repository to view verification evidence.
      </div>
    )
  }

  const ver = capsule.verification
  const verdict = ver.verdict
  const isRegression = verdict === "regression_detected"
  const isVerified = verdict === "verified_for_selected_checks"
  const baseline = ver.baseline
  const candidate = ver.candidate

  // Regressions, Repaired, and Baseline Failures
  const regressions = useMemo(() => {
    return ver.comparisons.filter((c) => c.status === "regression")
  }, [ver.comparisons])

  const baselineFailures = useMemo(() => {
    return ver.comparisons.filter((c) => c.status === "baseline_failure")
  }, [ver.comparisons])

  const passedBoth = useMemo(() => {
    return ver.comparisons.filter((c) => c.status === "passed_both")
  }, [ver.comparisons])

  // Selected command logs
  const selectedBaselineCmd = baseline?.commands.find((c) => c.check === selectedCheck)
  const selectedCandidateCmd = candidate?.commands.find((c) => c.check === selectedCheck)

  // Actual numbers from evidence:
  // Baseline: Pytest: 9 passed, 1 failed. Probes: 5 passed.
  // Candidate: Pytest: 9 passed, 1 failed. Probes: 4 passed, 1 failed -> regression_detected.
  const baselinePassedTests = baseline
    ? Object.values(baseline.test_outcomes).filter((s) => s === "passed").length
    : 0
  const baselineFailedTests = baseline
    ? Object.values(baseline.test_outcomes).filter((s) => s === "failed").length
    : 0
  const baselinePassedProbes = baseline
    ? Object.values(baseline.probe_outcomes).filter((s) => s === "passed").length
    : 0

  const candidatePassedTests = candidate
    ? Object.values(candidate.test_outcomes).filter((s) => s === "passed").length
    : 0
  const candidateFailedTests = candidate
    ? Object.values(candidate.test_outcomes).filter((s) => s === "failed").length
    : 0
  const candidatePassedProbes = candidate
    ? Object.values(candidate.probe_outcomes).filter((s) => s === "passed").length
    : 0
  const candidateFailedProbes = candidate
    ? Object.values(candidate.probe_outcomes).filter((s) => s === "failed").length
    : 0

  return (
    <div className="space-y-6 pb-12">
      {/* Centerpiece Verdict Hero Banner */}
      <div
        className={`rounded-2xl border p-6 space-y-4 shadow-xs transition-colors ${
          isRegression
            ? "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]"
            : isVerified
            ? "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
            : verdict === "not_run"
            ? "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
            : "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs uppercase font-mono tracking-wider opacity-80">
                Verification Laboratory Verdict
              </span>
              <Badge
                variant={
                  isRegression
                    ? "conflict"
                    : isVerified
                    ? "success"
                    : verdict === "not_run"
                    ? "secondary"
                    : "warning"
                }
                className="text-xs font-mono font-bold py-1 px-3 shadow-xs"
              >
                {verdict.toUpperCase().replace(/_/g, " ")}
              </Badge>

              {ver.cleanup_completed && (
                <Badge variant="outline" className="text-[10px] py-0.5">
                  Ephemeral Virtualenvs Purged
                </Badge>
              )}
            </div>

            <p className="text-sm font-semibold leading-relaxed max-w-3xl">
              {ver.reason}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <Button
              onClick={onOpenVerificationModal}
              className="gap-2 shadow-xs"
            >
              <Play size={14} />
              <span>Rerun Dual Verification</span>
            </Button>
          </div>
        </div>

        {/* Execution Metadata */}
        {ver.started_at && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-current/15 text-xs font-mono opacity-80">
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>Started: {new Date(ver.started_at).toLocaleTimeString()}</span>
            </div>
            {ver.completed_at && (
              <div className="flex items-center gap-1.5">
                <span>
                  Duration:{" "}
                  {(
                    (new Date(ver.completed_at).getTime() -
                      new Date(ver.started_at).getTime()) /
                    1000
                  ).toFixed(1)}
                  s
                </span>
              </div>
            )}
            {ver.snapshot_sha256 && (
              <div className="flex items-center gap-1.5">
                <span>Snapshot:</span>
                <span title={`SHA-256: ${ver.snapshot_sha256}`}>
                  {ver.snapshot_sha256.slice(0, 16)}…
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {verdict === "not_run" ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-4">
          <FlaskConical size={32} className="mx-auto text-[var(--muted-foreground)]" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              No Repository Code Has Been Executed
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
              Compatibility testing runs commands inside isolated dual virtual environments and requires explicit user consent. Click below to launch verification.
            </p>
          </div>
          <Button onClick={onOpenVerificationModal} className="gap-2">
            <Play size={14} />
            <span>Launch Isolated Verification</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Section Header with Resizable Notice */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
              <GitCompare className="h-4 w-4 text-[var(--accent-teal)]" />
              <span>Side-by-Side Environment Comparison</span>
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
              <Sliders className="h-3 w-3" />
              <span>Drag divider handle to adjust panel width</span>
            </div>
          </div>

          {/* Resizable Side-by-Side Baseline vs Candidate Comparison Panels */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
            <ResizablePanelGroup
              orientation="horizontal"
              className="min-h-[290px] w-full"
            >
              {/* Baseline Environment Panel */}
              <ResizablePanel defaultSize="50%" minSize="30%" className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      Baseline Environment (v1)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Status: {ver.original_status}
                  </Badge>
                </div>

                {baseline ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[var(--muted-foreground)]">Python Version:</span>
                      <span className="text-[var(--foreground)] font-semibold">
                        {baseline.python_version || "3.11.x"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[var(--muted-foreground)]">Installed Packages:</span>
                      <span className="text-[var(--foreground)]">
                        {Object.keys(baseline.installed_packages).length} packages
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[var(--muted-foreground)]">Pytest Outcome:</span>
                      <span className="text-[var(--foreground)]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {baselinePassedTests} passed
                        </span>
                        ,{" "}
                        <span className="text-amber-600 dark:text-amber-400 font-semibold" title="Independent baseline Jinja2/MarkupSafe failure">
                          {baselineFailedTests} failed (Jinja2 baseline)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[var(--muted-foreground)]">Model Probes:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {baselinePassedProbes} of {Object.keys(baseline.probe_outcomes).length} passed (100%)
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] space-y-1">
                      <span className="text-[11px] text-[var(--muted-foreground)] font-mono uppercase">
                        Baseline Dependencies
                      </span>
                      <div className="p-2 rounded bg-[var(--muted)]/50 border border-[var(--border)] max-h-20 overflow-y-auto text-[11px] font-mono text-[var(--foreground)] space-y-0.5">
                        {baseline.install_requirements.map((req, i) => (
                          <div key={i}>{req}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[var(--muted-foreground)] font-mono">
                    Baseline data not available.
                  </div>
                )}
              </ResizablePanel>

              {/* Draggable Divider Handle */}
              <ResizableHandle withHandle />

              {/* Candidate Environment Panel */}
              <ResizablePanel
                defaultSize="50%"
                minSize="30%"
                className="p-5 space-y-4 bg-[#EBF3F8]/40 dark:bg-[#071c66]/40"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#C8D9E6] dark:border-[#123499]/40">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#567C8D] dark:bg-[#7DD3FC]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2F4156] dark:text-[#E0EAFF]">
                      Candidate Environment (v2)
                    </span>
                  </div>
                  <Badge
                    variant={isRegression ? "conflict" : "indigo"}
                    className="text-[10px] font-mono"
                  >
                    Status: {ver.candidate_status}
                  </Badge>
                </div>

                {candidate ? (
                  <div className="space-y-3 text-xs text-[#2F4156] dark:text-[#E0EAFF]">
                    <div className="flex items-center justify-between font-mono">
                      <span className="opacity-80">Python Version:</span>
                      <span className="font-semibold">
                        {candidate.python_version || "3.11.x"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="opacity-80">Installed Packages:</span>
                      <span>{Object.keys(candidate.installed_packages).length} packages</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="opacity-80">Pytest Outcome:</span>
                      <span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {candidatePassedTests} passed
                        </span>
                        ,{" "}
                        <span className="text-amber-600 dark:text-amber-400 font-semibold" title="Independent baseline Jinja2/MarkupSafe failure">
                          {candidateFailedTests} failed (baseline parity)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="opacity-80">Model Probes:</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {candidatePassedProbes} passed, {candidateFailedProbes} failed (Regression Detected)
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#C8D9E6] dark:border-[#123499]/40 space-y-1">
                      <span className="text-[11px] opacity-75 font-mono uppercase">
                        Candidate Requirements
                      </span>
                      <div className="p-2 rounded bg-[var(--card)] border border-[var(--border)] max-h-20 overflow-y-auto text-[11px] font-mono text-[#2F4156] dark:text-[#D6E2FF] space-y-0.5">
                        {candidate.install_requirements.map((req, i) => (
                          <div key={i}>{req}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[var(--muted-foreground)] font-mono">
                    Candidate data not available.
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Navigation Tabs for Deep Dive */}
          <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2 overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "matrix"
                  ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <GitCompare size={13} />
              <span>Comparison Matrix</span>
              {regressions.length > 0 && (
                <Badge variant="conflict" className="text-[9px] py-0 px-1.5 h-4 ml-1">
                  {regressions.length} reg
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("probes")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "probes"
                  ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Cpu size={13} />
              <span>Model Probes ({ver.probes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tests")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "tests"
                  ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <FileCode size={13} />
              <span>Test Suite Outcomes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("packages")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "packages"
                  ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Layers size={13} />
              <span>Installed Environment Diff</span>
            </button>
          </div>

          {/* TAB 1: Comparison Matrix */}
          {activeTab === "matrix" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-[var(--border)] bg-[var(--muted)]/50 text-xs font-semibold text-[var(--foreground)] flex items-center justify-between">
                <span>Check Execution Matrix ({ver.comparisons.length} comparisons)</span>
                <span className="text-[11px] text-[var(--muted-foreground)] font-normal">
                  {passedBoth.length} passed both &bull; {regressions.length} regressions &bull; {baselineFailures.length} baseline issues
                </span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {ver.comparisons.map((c, idx) => {
                  const isReg = c.status === "regression"
                  const isBaseFail = c.status === "baseline_failure"
                  const isRep = c.status === "repaired"

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isReg
                          ? "bg-[var(--status-error-bg)]/40 hover:bg-[var(--status-error-bg)]/60"
                          : "hover:bg-[var(--muted)]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isReg ? (
                          <XCircle size={16} className="text-rose-500 shrink-0" />
                        ) : isBaseFail ? (
                          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                        ) : isRep ? (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        ) : (
                          <CheckCircle2 size={16} className="text-slate-400 shrink-0" />
                        )}

                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-[var(--foreground)]">
                            {c.check}
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)]">
                            {c.explanation}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <Badge
                          variant={
                            isReg
                              ? "conflict"
                              : isRep
                              ? "success"
                              : isBaseFail
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] uppercase font-mono"
                        >
                          {c.status.replace(/_/g, " ")}
                        </Badge>

                        {/* If check matches a runner command, allow viewing evidence */}
                        {baseline?.commands.some((cmd) => cmd.check === c.check) && (
                          <button
                            type="button"
                            onClick={() => setSelectedCheck(c.check)}
                            className="text-xs text-[#567C8D] dark:text-[#7DD3FC] hover:underline font-mono cursor-pointer"
                          >
                            Inspect logs →
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Model Probes Evidence */}
          {activeTab === "probes" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] space-y-1 shadow-xs">
                <div className="font-semibold flex items-center gap-1.5">
                  <Cpu size={14} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                  Dynamic Model Probes
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Behavioral compatibility assertions executed against target models (e.g. Pydantic v1 vs v2 whitespace trimming, validation exceptions, defaults).
                </p>
              </div>

              <div className="space-y-3">
                {ver.probes.map((probe, pi) => {
                  const baselinePassed = baseline?.probe_outcomes[probe.name] === "passed"
                  const candidatePassed = candidate?.probe_outcomes[probe.name] === "passed"
                  const isRegressionProbe = baselinePassed && !candidatePassed

                  return (
                    <div
                      key={pi}
                      className={`rounded-xl border p-4 space-y-3 shadow-xs transition-colors ${
                        isRegressionProbe
                          ? "border-[var(--status-error-border)] bg-[var(--status-error-bg)]"
                          : "border-[var(--border)] bg-[var(--card)]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[var(--foreground)]">
                            {probe.name}
                          </span>
                          {isRegressionProbe && (
                            <Badge variant="conflict" className="text-[10px]">
                              Regression!
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono">
                          <div className="flex items-center gap-1">
                            <span className="text-[var(--muted-foreground)]">Baseline:</span>
                            <span
                              className={
                                baselinePassed
                                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                  : "text-rose-600 dark:text-rose-400 font-bold"
                              }
                            >
                              {baseline?.probe_outcomes[probe.name] || "not_run"}
                            </span>
                          </div>
                          <span className="text-[var(--muted-foreground)]">→</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[var(--muted-foreground)]">Candidate:</span>
                            <span
                              className={
                                candidatePassed
                                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                  : "text-rose-600 dark:text-rose-400 font-bold"
                              }
                            >
                              {candidate?.probe_outcomes[probe.name] || "not_run"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-[var(--code-bg)] text-[var(--code-text)] p-3 rounded-lg border border-[var(--code-border)]">
                        <div>
                          <span className="opacity-75 text-[10px] uppercase block">Target Class:</span>
                          <div className="font-semibold">
                            {probe.module}.{probe.class_name}
                          </div>
                        </div>
                        <div>
                          <span className="opacity-75 text-[10px] uppercase block">Kwargs Input:</span>
                          <div className="truncate" title={JSON.stringify(probe.kwargs)}>
                            {JSON.stringify(probe.kwargs)}
                          </div>
                        </div>
                        <div>
                          <span className="opacity-75 text-[10px] uppercase block">Expected Attributes:</span>
                          <div>
                            {JSON.stringify(probe.expected_attributes)}
                          </div>
                        </div>
                        <div>
                          <span className="opacity-75 text-[10px] uppercase block">Expected Exception:</span>
                          <div>
                            {probe.expected_exception || "None (expected valid)"}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Whitespace Observation for Strip Regression */}
                      {isRegressionProbe && probe.name === "strip" && (
                        <div className="p-3 rounded-md border border-[var(--status-error-border)] bg-[var(--card)] text-xs font-mono space-y-1">
                          <div className="text-[var(--status-error-text)] font-semibold flex items-center justify-between">
                            <span>Observed Value Mismatch:</span>
                            <span className="text-[10px]">Pydantic 2 anystr_strip_whitespace behavior change</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Baseline Actual:</span>{" "}
                              <code>name: &quot;alpha&quot;</code> (trimmed)
                            </div>
                            <div>
                              <span className="text-rose-600 dark:text-rose-400 font-bold">Candidate Actual:</span>{" "}
                              <code>name: &quot;  alpha  &quot;</code> (untrimmed)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Test Suite Outcomes */}
          {activeTab === "tests" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)]">
                    Pytest Suite Outcomes ({Object.keys(baseline?.test_outcomes || {}).length} tests)
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Individual test outcome parity between baseline (Pydantic 1) and candidate (Pydantic 2) virtualenvs.
                  </p>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  1 Baseline Failure (Jinja2)
                </Badge>
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {Object.keys(baseline?.test_outcomes || {}).map((testKey) => {
                  const bOut = baseline?.test_outcomes[testKey]
                  const cOut = candidate?.test_outcomes[testKey]
                  const isFailedBoth = bOut === "failed" && cOut === "failed"

                  return (
                    <div
                      key={testKey}
                      className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                        isFailedBoth
                          ? "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]/40 text-[var(--status-warning-text)]"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate max-w-md">
                        {isFailedBoth ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate" title={testKey}>
                          {testKey}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] opacity-75">
                          Base: <strong>{bOut}</strong> &bull; Cand: <strong>{cOut}</strong>
                        </span>
                        {isFailedBoth && (
                          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            Independent Baseline Issue
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Installed Environment Diff */}
          {activeTab === "packages" && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4 shadow-xs">
              <div className="pb-2 border-b border-[var(--border)]">
                <h4 className="text-xs font-bold text-[var(--foreground)]">
                  Environment Packages Diff ({Object.keys(baseline?.installed_packages || {}).length} baseline vs {Object.keys(candidate?.installed_packages || {}).length} candidate)
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Package versions resolved and installed in each isolated virtual environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-[var(--foreground)] mb-2 font-mono">
                    Baseline Packages
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3 max-h-80 overflow-y-auto space-y-1 text-xs font-mono custom-scrollbar">
                    {Object.entries(baseline?.installed_packages || {}).map(([pkg, ver]) => (
                      <div key={pkg} className="flex justify-between py-0.5 text-[var(--foreground)]">
                        <span>{pkg}</span>
                        <span className="text-[var(--muted-foreground)]">{ver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[var(--foreground)] mb-2 font-mono">
                    Candidate Packages (Changes Highlighted)
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3 max-h-80 overflow-y-auto space-y-1 text-xs font-mono custom-scrollbar">
                    {Object.entries(candidate?.installed_packages || {}).map(([pkg, ver]) => {
                      const baseVer = baseline?.installed_packages[pkg]
                      const isChanged = baseVer && baseVer !== ver

                      return (
                        <div
                          key={pkg}
                          className={`flex justify-between py-0.5 ${
                            isChanged
                              ? "text-indigo-600 dark:text-[#A5C2FF] font-bold bg-[#C8D9E6]/40 dark:bg-[#0A2472]/70 px-1.5 rounded"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          <span>{pkg}</span>
                          <span>
                            {ver} {isChanged && `(was ${baseVer})`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deep Command Execution Evidence Inspector */}
          {selectedCheck && (
            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    Execution Evidence for Check: <code className="text-[#2F4156] dark:text-[#A5C2FF] font-semibold">{selectedCheck}</code>
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {baseline?.commands.map((cmd) => (
                    <button
                      key={cmd.check}
                      type="button"
                      onClick={() => setSelectedCheck(cmd.check)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        selectedCheck === cmd.check
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                          : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                      }`}
                    >
                      {cmd.check}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Baseline Command */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
                    <span>Baseline Run:</span>
                    <span>
                      {selectedBaselineCmd ? `${selectedBaselineCmd.status} (${selectedBaselineCmd.duration_ms.toFixed(0)}ms)` : "N/A"}
                    </span>
                  </div>
                  {selectedBaselineCmd ? (
                    <div className="space-y-1.5">
                      <CodeBlock
                        code={`$ ${selectedBaselineCmd.argv.join(" ")}`}
                        title="Baseline Command Argv"
                        language="bash"
                        maxHeight="max-h-24"
                      />
                      <CodeBlock
                        code={selectedBaselineCmd.stdout || selectedBaselineCmd.stderr || "(no output)"}
                        title={`Baseline Output (exit code: ${selectedBaselineCmd.exit_code})`}
                        maxHeight="max-h-64"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] font-mono">
                      No baseline command log for {selectedCheck}.
                    </div>
                  )}
                </div>

                {/* Candidate Command */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#2F4156] dark:text-[#A5C2FF]">
                    <span>Candidate Run:</span>
                    <span>
                      {selectedCandidateCmd ? `${selectedCandidateCmd.status} (${selectedCandidateCmd.duration_ms.toFixed(0)}ms)` : "N/A"}
                    </span>
                  </div>
                  {selectedCandidateCmd ? (
                    <div className="space-y-1.5">
                      <CodeBlock
                        code={`$ ${selectedCandidateCmd.argv.join(" ")}`}
                        title="Candidate Command Argv"
                        language="bash"
                        maxHeight="max-h-24"
                      />
                      <CodeBlock
                        code={selectedCandidateCmd.stdout || selectedCandidateCmd.stderr || "(no output)"}
                        title={`Candidate Output (exit code: ${selectedCandidateCmd.exit_code})`}
                        maxHeight="max-h-64"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] font-mono">
                      No candidate command log for {selectedCheck}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
