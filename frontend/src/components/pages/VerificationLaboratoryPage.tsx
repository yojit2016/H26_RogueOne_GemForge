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
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import type { ExitCapsule, CommandResult, CheckComparison, EnvironmentResult } from "@/types/gemforge"

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
      <div className="py-16 text-center text-slate-400 text-xs">
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

  // Find command result for selected check in baseline and candidate
  const selectedBaselineCmd = baseline?.commands.find((c) => c.check === selectedCheck)
  const selectedCandidateCmd = candidate?.commands.find((c) => c.check === selectedCheck)

  return (
    <div className="space-y-6 pb-12">
      {/* Centerpiece Verdict Hero Banner */}
      <div
        className={`rounded-2xl border p-6 space-y-4 shadow-xl ${
          isRegression
            ? "border-rose-900/60 bg-gradient-to-b from-[#180e14] to-[#0d0910]"
            : isVerified
            ? "border-emerald-900/60 bg-gradient-to-b from-[#0c1813] to-[#090e0c]"
            : verdict === "not_run"
            ? "border-[#1e2333] bg-[#0c0e16]"
            : "border-amber-900/50 bg-[#16120b]"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
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
                className="text-xs font-mono font-bold py-1 px-3"
              >
                {verdict.toUpperCase().replace(/_/g, " ")}
              </Badge>

              {ver.cleanup_completed && (
                <Badge variant="outline" className="text-[10px] text-slate-400 py-0.5">
                  Ephemeral Virtualenvs Purged
                </Badge>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-200 leading-relaxed max-w-3xl">
              {ver.reason}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <Button
              onClick={onOpenVerificationModal}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
            >
              <Play size={14} />
              <span>Run Laboratory Verification</span>
            </Button>
          </div>
        </div>

        {/* Execution Metadata Bar */}
        {(ver.started_at || ver.completed_at || ver.snapshot_sha256) && (
          <div className="pt-3 border-t border-[#23283c] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-slate-400">
            {ver.started_at && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-500" />
                <span>Started: {new Date(ver.started_at).toLocaleTimeString()}</span>
              </div>
            )}
            {ver.completed_at && ver.started_at && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-500" />
                <span>
                  Duration:{" "}
                  {(
                    (new Date(ver.completed_at).getTime() - new Date(ver.started_at).getTime()) /
                    1000
                  ).toFixed(1)}
                  s
                </span>
              </div>
            )}
            {ver.snapshot_sha256 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Snapshot:</span>
                <span className="text-slate-300" title={`SHA-256: ${ver.snapshot_sha256}`}>
                  {ver.snapshot_sha256.slice(0, 16)}…
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {verdict === "not_run" ? (
        <div className="rounded-xl border border-[#1e2333] bg-[#0c0e15] p-12 text-center space-y-4">
          <FlaskConical size={32} className="mx-auto text-slate-600" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">
              No Repository Code Has Been Executed
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
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
          {/* Side-by-Side Baseline vs Candidate Environment Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Environment */}
            <div className="rounded-xl border border-[#1e2333] bg-[#0c0e16] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2030]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Baseline Environment
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-slate-400">
                  Status: {ver.original_status}
                </Badge>
              </div>

              {baseline ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Python Version:</span>
                    <span className="text-slate-200 font-semibold">{baseline.python_version || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Installed Packages:</span>
                    <span className="text-slate-200">{Object.keys(baseline.installed_packages).length} packages</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Test Suite Outcomes:</span>
                    <span className="text-slate-200">
                      {Object.values(baseline.test_outcomes).filter((s) => s === "passed").length} passed,{" "}
                      <span className="text-rose-400 font-semibold">
                        {Object.values(baseline.test_outcomes).filter((s) => s === "failed").length} failed
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Model Probes:</span>
                    <span className="text-emerald-400 font-semibold">
                      {Object.values(baseline.probe_outcomes).filter((s) => s === "passed").length} of{" "}
                      {Object.keys(baseline.probe_outcomes).length} passed
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#181c28] space-y-1">
                    <span className="text-[11px] text-slate-500 font-mono uppercase">
                      Baseline Requirements
                    </span>
                    <div className="p-2 rounded bg-[#090b10] border border-[#1b1f2e] max-h-24 overflow-y-auto text-[11px] font-mono text-slate-300 space-y-0.5">
                      {baseline.install_requirements.map((req, i) => (
                        <div key={i}>{req}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">Baseline data not available.</div>
              )}
            </div>

            {/* Candidate Environment */}
            <div className="rounded-xl border border-indigo-950/60 bg-[#0d0f1a] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-900/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Candidate Environment
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
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Python Version:</span>
                    <span className="text-slate-200 font-semibold">{candidate.python_version || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Installed Packages:</span>
                    <span className="text-slate-200">{Object.keys(candidate.installed_packages).length} packages</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Test Suite Outcomes:</span>
                    <span className="text-slate-200">
                      {Object.values(candidate.test_outcomes).filter((s) => s === "passed").length} passed,{" "}
                      <span className="text-rose-400 font-semibold">
                        {Object.values(candidate.test_outcomes).filter((s) => s === "failed").length} failed
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>Model Probes:</span>
                    <span className={isRegression ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {Object.values(candidate.probe_outcomes).filter((s) => s === "passed").length} of{" "}
                      {Object.keys(candidate.probe_outcomes).length} passed
                      {isRegression && " (Regression detected!)"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-indigo-900/30 space-y-1">
                    <span className="text-[11px] text-slate-500 font-mono uppercase">
                      Candidate Requirements & Constraints
                    </span>
                    <div className="p-2 rounded bg-[#090b10] border border-[#1e2336] max-h-24 overflow-y-auto text-[11px] font-mono text-indigo-300 space-y-0.5">
                      {candidate.install_requirements.map((req, i) => (
                        <div key={i}>{req}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">Candidate data not available.</div>
              )}
            </div>
          </div>

          {/* Navigation Tabs for Deep Dive */}
          <div className="flex items-center gap-2 border-b border-[#1c202e] pb-1">
            {[
              { id: "matrix", label: `Comparisons Matrix (${ver.comparisons.length})`, icon: GitCompare },
              { id: "probes", label: "Model Probes Evidence", icon: Cpu },
              { id: "tests", label: "Existing Pytest Results", icon: FileCode },
              { id: "packages", label: "Installed Distribution Diff", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#161a29] text-indigo-300 border border-[#272e45]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-indigo-400" : "text-slate-500"} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* TAB 1: Comparison Matrix */}
          {activeTab === "matrix" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="font-semibold text-slate-300">Filters:</span>
                {regressions.length > 0 && (
                  <Badge variant="conflict" className="text-[10px]">
                    {regressions.length} Regression(s)
                  </Badge>
                )}
                <Badge variant="success" className="text-[10px]">
                  {passedBoth.length} Passed Both
                </Badge>
                {baselineFailures.length > 0 && (
                  <Badge variant="warning" className="text-[10px]">
                    {baselineFailures.length} Baseline Failures
                  </Badge>
                )}
              </div>

              <div className="rounded-xl border border-[#1e2333] bg-[#0c0e16] divide-y divide-[#171b28] overflow-hidden">
                {ver.comparisons.map((c, idx) => {
                  const isReg = c.status === "regression"
                  const isBaseFail = c.status === "baseline_failure"
                  const isRep = c.status === "repaired"

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isReg
                          ? "bg-rose-950/20 hover:bg-rose-950/30"
                          : "hover:bg-[#10131f]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isReg ? (
                          <XCircle size={16} className="text-rose-400 shrink-0" />
                        ) : isBaseFail ? (
                          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                        ) : isRep ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <CheckCircle2 size={16} className="text-slate-500 shrink-0" />
                        )}

                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-slate-200">
                            {c.check}
                          </div>
                          <div className="text-[11px] text-slate-400">
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
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
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
              <div className="p-4 rounded-xl border border-[#1e2333] bg-[#0c0e15] text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Cpu size={14} className="text-indigo-400" />
                  Dynamic Model Probes
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
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
                      className={`rounded-xl border p-4 space-y-3 ${
                        isRegressionProbe
                          ? "border-rose-900/60 bg-rose-950/15"
                          : "border-[#1e2333] bg-[#0c0e16]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-100">
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
                            <span className="text-slate-500">Baseline:</span>
                            <span className={baselinePassed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {baseline?.probe_outcomes[probe.name] || "not_run"}
                            </span>
                          </div>
                          <span className="text-slate-600">→</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Candidate:</span>
                            <span className={candidatePassed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {candidate?.probe_outcomes[probe.name] || "not_run"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-[#090b10] p-3 rounded-lg border border-[#191d2a]">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">Target Class:</span>
                          <div className="text-slate-200">
                            {probe.module}.{probe.class_name}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">Kwargs Input:</span>
                          <div className="text-slate-300 truncate" title={JSON.stringify(probe.kwargs)}>
                            {JSON.stringify(probe.kwargs)}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">Expected Attributes:</span>
                          <div className="text-slate-300">
                            {JSON.stringify(probe.expected_attributes)}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">Expected Exception:</span>
                          <div className="text-slate-300">
                            {probe.expected_exception || "None (expected valid)"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Pytest Results */}
          {activeTab === "tests" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#1e2333] bg-[#0c0e15] text-xs text-slate-300">
                <span className="font-semibold text-slate-200">
                  Target Repository Pytest Suite Results
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Full test breakdown from executed pytest JUnit XML reports in both baseline and candidate virtual environments.
                </p>
              </div>

              {baseline && (
                <div className="rounded-xl border border-[#1e2333] bg-[#0c0e16] divide-y divide-[#171b28]">
                  {Object.entries(baseline.test_outcomes).map(([testName, baseOutcome]) => {
                    const candOutcome = candidate?.test_outcomes[testName]
                    const isFailed = baseOutcome === "failed" || candOutcome === "failed"

                    return (
                      <div
                        key={testName}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                      >
                        <span className="text-slate-300 truncate max-w-xl" title={testName}>
                          {testName}
                        </span>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-slate-500">
                            Base:{" "}
                            <span className={baseOutcome === "passed" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {baseOutcome}
                            </span>
                          </span>
                          <span className="text-slate-600">→</span>
                          <span className="text-[11px] text-slate-500">
                            Candidate:{" "}
                            <span className={candOutcome === "passed" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {candOutcome}
                            </span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Installed Distribution Diff */}
          {activeTab === "packages" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Baseline pip list */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 font-mono">
                    Baseline Virtualenv Packages ({Object.keys(baseline?.installed_packages || {}).length})
                  </div>
                  <div className="rounded-xl border border-[#1e2333] bg-[#090b10] p-3 max-h-96 overflow-y-auto space-y-1 text-xs font-mono">
                    {Object.entries(baseline?.installed_packages || {}).map(([pkg, ver]) => (
                      <div key={pkg} className="flex items-center justify-between text-slate-300 py-0.5">
                        <span className="text-slate-400">{pkg}</span>
                        <span className="text-slate-200">{ver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate pip list */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-indigo-300 font-mono">
                    Candidate Virtualenv Packages ({Object.keys(candidate?.installed_packages || {}).length})
                  </div>
                  <div className="rounded-xl border border-[#1e2333] bg-[#090b10] p-3 max-h-96 overflow-y-auto space-y-1 text-xs font-mono">
                    {Object.entries(candidate?.installed_packages || {}).map(([pkg, ver]) => {
                      const baseVer = baseline?.installed_packages[pkg]
                      const isChanged = baseVer && baseVer !== ver
                      const isNew = !baseVer

                      return (
                        <div
                          key={pkg}
                          className={`flex items-center justify-between py-0.5 ${
                            isChanged
                              ? "text-indigo-300 font-bold bg-indigo-950/30 px-1 rounded"
                              : isNew
                              ? "text-emerald-300 font-medium bg-emerald-950/30 px-1 rounded"
                              : "text-slate-300"
                          }`}
                        >
                          <span>{pkg}</span>
                          <span>
                            {ver} {isChanged && `(was ${baseVer})`} {isNew && "(new)"}
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
            <div className="space-y-3 pt-4 border-t border-[#1c202e]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Execution Evidence for Check: <code className="text-indigo-300">{selectedCheck}</code>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {baseline?.commands.map((cmd) => (
                    <button
                      key={cmd.check}
                      type="button"
                      onClick={() => setSelectedCheck(cmd.check)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        selectedCheck === cmd.check
                          ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700/60"
                          : "bg-[#121522] text-slate-400 hover:text-slate-200"
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
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
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
                    <div className="p-4 rounded-lg border border-[#1e2333] bg-[#090b10] text-xs text-slate-500 font-mono">
                      No baseline command log for {selectedCheck}.
                    </div>
                  )}
                </div>

                {/* Candidate Command */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
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
                    <div className="p-4 rounded-lg border border-[#1e2333] bg-[#090b10] text-xs text-slate-500 font-mono">
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
