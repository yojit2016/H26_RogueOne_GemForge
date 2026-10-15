import { useMemo } from "react"
import {
  Package,
  Layers,
  AlertTriangle,
  Sparkles,
  FlaskConical,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Clock,
  Terminal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ExitCapsule } from "@/types/gemforge"
import type { ActivePage } from "@/components/Navbar"

interface OverviewPageProps {
  capsule: ExitCapsule | null
  isDemo: boolean
  onNavigate: (page: ActivePage) => void
  onOpenScanModal: () => void
  onOpenVerificationModal: () => void
}

export function OverviewPage({
  capsule,
  isDemo,
  onNavigate,
  onOpenScanModal,
  onOpenVerificationModal,
}: OverviewPageProps) {
  // If no capsule loaded, show an elegant empty state with clear action
  if (!capsule) {
    return (
      <div className="py-16 px-4 max-w-4xl mx-auto text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
          <Layers size={28} />
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            No Repository Analysis Loaded
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Run a local repository scan or load the verified LinkWatch Phase 3 regression fixture to inspect dependency resilience.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={onOpenScanModal} className="gap-2">
            <Terminal size={14} />
            <span>Scan Local Repository</span>
          </Button>
        </div>
      </div>
    )
  }

  // Derive stats strictly from real data
  const uniquePackages = useMemo(() => {
    return Array.from(new Set(capsule.dependencies.map((d) => d.package.toLowerCase())))
  }, [capsule.dependencies])

  const manifestFiles = useMemo(() => {
    return Array.from(new Set(capsule.dependencies.map((d) => d.source.file)))
  }, [capsule.dependencies])

  const riskCounts = useMemo(() => {
    let conflict = 0
    let uncertainty = 0
    let directRef = 0
    let proven = 0

    for (const r of capsule.risks) {
      if (r.kind === "constraint_conflict") conflict++
      if (r.kind === "constraint_uncertainty") uncertainty++
      if (r.kind === "direct_reference") directRef++
      if (r.certainty === "proven") proven++
    }

    return { conflict, uncertainty, directRef, proven, total: capsule.risks.length }
  }, [capsule.risks])

  const verdict = capsule.verification.verdict
  const isRegression = verdict === "regression_detected"
  const isVerified = verdict === "verified_for_selected_checks"

  return (
    <div className="space-y-6 pb-12">
      {/* Repository Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--foreground)]">Current Target</span>
            {isDemo && (
              <Badge variant="indigo" className="text-[10px] py-0">
                Demo Fixture · LinkWatch
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] py-0 text-[var(--muted-foreground)] font-mono">
              Schema {capsule.schema_version}
            </Badge>
          </div>
          <div className="font-mono text-xs text-[#2F4156] dark:text-[#A5C2FF] font-semibold break-all">
            {capsule.repository}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenScanModal}
            className="text-xs h-8"
          >
            Re-scan Target
          </Button>
          <Button
            size="sm"
            onClick={onOpenVerificationModal}
            className="text-xs h-8"
          >
            Run Verification
          </Button>
        </div>
      </div>

      {/* Primary Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Declarations & Unique Packages */}
        <Card className="theme-card-hover border-[var(--border)] bg-[var(--card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Declared Packages</span>
              <Package size={15} className="text-[var(--muted-foreground)]" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-[var(--foreground)]">
                {uniquePackages.length}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({capsule.dependencies.length} total specs)
              </span>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-[var(--muted-foreground)] pt-1">
            <div className="flex items-center gap-1.5 text-[11px] truncate">
              <FileText size={12} className="text-[var(--muted-foreground)] shrink-0" />
              <span>Across {manifestFiles.length} manifests ({manifestFiles.join(", ")})</span>
            </div>
          </CardContent>
        </Card>

        {/* Identified Risks */}
        <Card
          className={`theme-card-hover border-[var(--border)] bg-[var(--card)] ${
            riskCounts.total > 0 ? "border-amber-400/50 dark:border-amber-500/40" : ""
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Identified Risks</span>
              <AlertTriangle
                size={15}
                className={riskCounts.total > 0 ? "text-amber-500" : "text-[var(--muted-foreground)]"}
              />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {riskCounts.total}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({riskCounts.proven} proven)
              </span>
            </div>
          </CardHeader>
          <CardContent className="text-xs pt-1">
            <div className="flex items-center gap-2 text-[11px] flex-wrap">
              {riskCounts.conflict > 0 && (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">{riskCounts.conflict} conflicts</span>
              )}
              {riskCounts.uncertainty > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{riskCounts.uncertainty} uncertain</span>
              )}
              {riskCounts.directRef > 0 && (
                <span className="text-blue-600 dark:text-sky-400 font-semibold">{riskCounts.directRef} direct refs</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Status */}
        <Card className="theme-card-hover border-[var(--border)] bg-[var(--card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Gemma 4 Intelligence</span>
              <Sparkles size={15} className="text-[#567C8D] dark:text-[#7DD3FC]" />
            </div>
            <div className="pt-1">
              <Badge
                variant={
                  capsule.ai_status === "generated"
                    ? "indigo"
                    : capsule.ai_status === "partial"
                    ? "warning"
                    : "secondary"
                }
                className="text-xs uppercase font-mono tracking-wider py-0.5"
              >
                {capsule.ai_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-[var(--muted-foreground)] pt-2">
            <div className="text-[11px] truncate">
              {capsule.recommendations.length > 0
                ? `${capsule.recommendations.length} migration proposal(s) generated`
                : "No AI migrations requested"}
            </div>
          </CardContent>
        </Card>

        {/* Verification Verdict */}
        <Card
          className={`theme-card-hover border-[var(--border)] bg-[var(--card)] ${
            isRegression
              ? "border-rose-400/60 dark:border-rose-500/50"
              : isVerified
              ? "border-emerald-400/60 dark:border-emerald-500/50"
              : ""
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Verification Laboratory</span>
              <FlaskConical
                size={15}
                className={
                  isRegression
                    ? "text-rose-500"
                    : isVerified
                    ? "text-emerald-500"
                    : "text-[var(--muted-foreground)]"
                }
              />
            </div>
            <div className="pt-1">
              <Badge
                variant={
                  isRegression
                    ? "conflict"
                    : isVerified
                    ? "success"
                    : capsule.verification.verdict === "not_run"
                    ? "secondary"
                    : "warning"
                }
                className="text-xs font-mono py-0.5"
              >
                {verdict.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-[var(--muted-foreground)] pt-2">
            <div className="text-[11px] truncate">
              {capsule.verification.comparisons.length > 0
                ? `${capsule.verification.comparisons.length} baseline-vs-candidate checks`
                : "No isolated execution run yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Verdict Highlight Banner (Critical Evidence Callout) */}
      {isRegression && (
        <div className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--status-error-border)] text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 shadow-xs">
              <ShieldAlert size={18} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--status-error-text)]">
                  Regression Detected During Compatibility Verification
                </span>
                <Badge variant="conflict" className="text-[10px]">
                  Action Required
                </Badge>
              </div>
              <p className="text-xs text-[var(--status-error-text)]/90 leading-relaxed max-w-2xl">
                Baseline checks passed, but candidate virtual environment exhibited behavior regressions on model compatibility probes. This demonstrates why AI-generated recommendations must not be trusted without execution evidence.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onNavigate("verification")}
            className="shrink-0 gap-1.5 text-xs shadow-xs"
          >
            <span>Inspect Evidence</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      )}

      {/* Two-Column Deep Dive: Risk Breakdown + Repository Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Risk Finding Inventory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Discovered Dependency Risks
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Empirical manifest findings categorized by certainty and conflict type
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("explorer")}
              className="text-xs gap-1"
            >
              <span>Explore all</span>
              <ArrowRight size={12} />
            </Button>
          </div>

          <div className="space-y-2.5">
            {capsule.risks.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-xs text-[var(--muted-foreground)]">
                No risks detected by the implemented static checks. This does not establish universal safety.
              </div>
            ) : (
              capsule.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--muted-foreground)] space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[var(--foreground)]">
                        {risk.package}
                      </span>
                      <Badge
                        variant={
                          risk.kind === "constraint_conflict"
                            ? "conflict"
                            : risk.kind === "constraint_uncertainty"
                            ? "warning"
                            : "info"
                        }
                        className="text-[10px] font-mono"
                      >
                        {risk.kind.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        variant={risk.certainty === "proven" ? "conflict" : "secondary"}
                        className="text-[10px]"
                      >
                        {risk.certainty}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
                      {risk.sources.map((s) => `${s.file}:${s.line || 1}`).join(", ")}
                    </div>
                  </div>

                  <p className="text-xs font-mono text-[11px] leading-relaxed bg-[var(--code-bg)] text-[var(--code-text)] p-2.5 rounded-lg border border-[var(--code-border)]">
                    {risk.evidence}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: AI & Verification Status Summary */}
        <div className="space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Resilience Pipeline
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Stages of the GemForge verification lifecycle
            </p>
          </div>

          <Card className="border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] shadow-xs">
            {/* Stage 1: Static AST & Manifest Scan */}
            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  1. Manifest & AST Parsing
                </span>
                <Badge variant="success" className="text-[10px] py-0">
                  Completed
                </Badge>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {capsule.dependencies.length} declared packages scanned, {capsule.usages.length} Python AST usage locations resolved.
              </p>
            </div>

            {/* Stage 2: Gemma 4 Migration Inference */}
            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Sparkles size={14} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                  2. Gemma 4 Inference
                </span>
                <Badge
                  variant={capsule.ai_status === "generated" ? "indigo" : "secondary"}
                  className="text-[10px] py-0"
                >
                  {capsule.ai_status}
                </Badge>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {capsule.inferences.length > 0
                  ? `Executed ${capsule.inferences.length} inference cycle(s) with prompt & response SHA-256 telemetry.`
                  : "AI recommendations not requested for this scan."}
              </p>
              {capsule.recommendations.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNavigate("migration")}
                  className="text-xs h-6 px-0 font-medium"
                >
                  View migration proposals →
                </Button>
              )}
            </div>

            {/* Stage 3: Isolated Virtualenv Verification */}
            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <FlaskConical
                    size={14}
                    className={
                      isRegression ? "text-rose-500" : isVerified ? "text-emerald-500" : "text-[var(--muted-foreground)]"
                    }
                  />
                  3. Isolated Laboratory
                </span>
                <Badge
                  variant={isRegression ? "conflict" : isVerified ? "success" : "secondary"}
                  className="text-[10px] py-0"
                >
                  {capsule.verification.status}
                </Badge>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {capsule.verification.reason}
              </p>
              {capsule.verification.status !== "not_run" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNavigate("verification")}
                  className="text-xs h-6 px-0 font-medium"
                >
                  Inspect side-by-side execution →
                </Button>
              )}
            </div>

            {/* Timestamp & Limitations note */}
            <div className="p-4 bg-[var(--muted)]/50 text-[11px] text-[var(--muted-foreground)] space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-[var(--muted-foreground)]" />
                <span>Generated: {new Date(capsule.generated_at).toLocaleString()}</span>
              </div>
              <div className="text-[10px] leading-normal">
                {capsule.limitations.length} analysis limitations noted in capsule contract.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
