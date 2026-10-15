import { useState } from "react"
import {
  FileCheck2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Sparkles,
  GitCompare,
  Terminal,
  ShieldAlert,
  HelpCircle,
  FileText,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import type { ExitCapsule } from "@/types/gemforge"

interface ExitCapsulePageProps {
  capsule: ExitCapsule | null
  onOpenExport: () => void
}

export function ExitCapsulePage({ capsule, onOpenExport }: ExitCapsulePageProps) {
  const [activeTab, setActiveTab] = useState<"structured" | "evidence" | "raw">("structured")
  const [copiedJson, setCopiedJson] = useState(false)

  if (!capsule) {
    return (
      <div className="py-16 text-center text-[var(--muted-foreground)] text-xs">
        No active capsule loaded. Scan a repository to view its Exit Capsule report.
      </div>
    )
  }

  const ver = capsule.verification
  const plan = ver.plan
  const baseline = ver.baseline
  const candidate = ver.candidate

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(capsule, null, 2))
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Report Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#567C8D] dark:text-[#7DD3FC]">
                Audit Certificate
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Schema {capsule.schema_version}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Dependency Exit Capsule
            </h1>
            <p className="font-mono text-xs text-[var(--muted-foreground)] break-all">
              {capsule.repository}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="gap-1.5 text-xs"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </Button>
            <Button
              onClick={onOpenExport}
              size="sm"
              className="gap-1.5 text-xs shadow-xs"
            >
              <Download size={14} />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Report Overview Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">Generated At</span>
            <span className="text-[var(--foreground)]">
              {new Date(capsule.generated_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">Verification Verdict</span>
            <span
              className={
                ver.verdict === "regression_detected"
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : ver.verdict === "verified_for_selected_checks"
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-[var(--foreground)]"
              }
            >
              {ver.verdict.toUpperCase().replace(/_/g, " ")}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">AI Analysis Status</span>
            <span className="text-[#2F4156] dark:text-[#A5C2FF] font-semibold uppercase">
              {capsule.ai_status}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">Audited Evidence</span>
            <span className="text-[var(--foreground)] font-semibold">
              {capsule.evidence.length} evidence items
            </span>
          </div>
        </div>
      </div>

      {/* Tabs View Switcher */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="structured">Structured Audit Report</TabsTrigger>
          <TabsTrigger value="evidence">Evidence & Provenance ({capsule.evidence.length})</TabsTrigger>
          <TabsTrigger value="raw">Raw Capsule JSON</TabsTrigger>
        </TabsList>

        {/* TAB 1: Structured Audit Report */}
        <TabsContent value="structured" className="space-y-6">
          <Accordion type="multiple" defaultValue={["sec-deps", "sec-risks", "sec-rec", "sec-ver"]}>
            {/* 1. Declared Dependencies */}
            <AccordionItem value="sec-deps">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--accent-teal)]" />
                  <span>1. Declared Dependencies ({capsule.dependencies.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {capsule.dependencies.map((dep, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 font-mono text-xs space-y-0.5"
                    >
                      <div className="flex justify-between font-bold text-[var(--foreground)]">
                        <span>{dep.package}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">{dep.group}</span>
                      </div>
                      <div className="text-[11px] text-[#2F4156] dark:text-[#A5C2FF]">
                        {dep.raw}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">
                        {dep.source.file}:{dep.source.line || 1}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Risk Indicators */}
            <AccordionItem value="sec-risks">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>2. Risk Indicators ({capsule.risks.length} findings)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {capsule.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)]/40 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--status-error-text)]">
                          {risk.package} &bull; {risk.kind}
                        </span>
                        <Badge variant="conflict" className="text-[10px]">
                          {risk.certainty}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-[var(--foreground)] opacity-90">
                        {risk.evidence}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">
                        Sources: {risk.sources.map((s) => `${s.file}:${s.line || 1}`).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Source Usage Locations */}
            <AccordionItem value="sec-usages">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[var(--accent-teal)]" />
                  <span>3. AST Import & Usage Inventory ({capsule.usages.length} sites)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea maxHeight="280px" className="space-y-1.5 pt-2">
                  {capsule.usages.map((u, i) => (
                    <div
                      key={i}
                      className="p-2 rounded border border-[var(--border)] bg-[var(--muted)]/40 text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--foreground)]">{u.symbol}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] ml-2">
                          (module: {u.module} &bull; {u.mapping})
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        {u.source.file}:{u.source.line || "?"}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>

            {/* 4. AI Migration Recommendations */}
            <AccordionItem value="sec-rec">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--accent-teal)]" />
                  <span>4. Gemma 4 Migration Recommendations ({capsule.recommendations.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {capsule.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                        <span className="font-bold font-mono text-sm text-[var(--foreground)]">
                          {rec.package} → {rec.replacement || "(none)"}
                        </span>
                        <Badge variant="indigo" className="text-[10px]">
                          Unverified AI Hypothesis
                        </Badge>
                      </div>

                      {rec.risk_explanation && (
                        <p className="text-xs text-[var(--foreground)] leading-relaxed">
                          <strong>Risk:</strong> {rec.risk_explanation}
                        </p>
                      )}

                      {rec.migration_steps.length > 0 && (
                        <div>
                          <span className="font-semibold block mb-1">Recommended Sequence:</span>
                          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[var(--foreground)]">
                            {rec.migration_steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {rec.limitations.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
                          <strong>Limitations:</strong> {rec.limitations.join(" ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Verification Laboratory Outcomes */}
            <AccordionItem value="sec-ver">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-[var(--accent-teal)]" />
                  <span>5. Empirical Verification Laboratory Outcomes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)]/40 font-mono space-y-1">
                    <div className="font-bold text-[var(--status-error-text)]">
                      Overall Verdict: {ver.verdict.toUpperCase()}
                    </div>
                    <div className="text-[11px] text-[var(--foreground)]">{ver.reason}</div>
                  </div>

                  {ver.comparisons.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-xs block text-[var(--foreground)]">
                        Check Comparisons ({ver.comparisons.length})
                      </span>
                      {ver.comparisons.map((c, i) => (
                        <div
                          key={i}
                          className="p-2 rounded border border-[var(--border)] bg-[var(--muted)]/40 font-mono text-xs flex items-center justify-between"
                        >
                          <span>{c.check}</span>
                          <Badge
                            variant={c.status === "regression" ? "conflict" : "secondary"}
                            className="text-[10px]"
                          >
                            {c.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Limitations & Caveats */}
            <AccordionItem value="sec-limitations">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <span>6. Methodological Limitations ({capsule.limitations.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--muted-foreground)] pt-2 leading-relaxed">
                  {capsule.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* TAB 2: Evidence & Provenance */}
        <TabsContent value="evidence" className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[var(--accent-teal)]" />
              Audited Evidence Provenance
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              SHA-256 anchored excerpts captured during AST scanning and runtime testing.
            </p>
          </div>

          <div className="space-y-2.5">
            {capsule.evidence.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[var(--foreground)]">{ev.id}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {ev.kind}
                    </Badge>
                    <span className="text-[var(--muted-foreground)]">{ev.package}</span>
                  </div>
                  {ev.source && (
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      {ev.source.file}:{ev.source.line || 1}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--foreground)] leading-relaxed">
                  {ev.description}
                </p>

                {ev.excerpt && (
                  <CodeBlock
                    code={ev.excerpt}
                    language="python"
                    maxHeight="max-h-36"
                    title={`Excerpt (${ev.excerpt_sha256?.substring(0, 12)}...)`}
                  />
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: Raw Capsule JSON */}
        <TabsContent value="raw" className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Machine-readable Exit Capsule payload (schema version 1.0)</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="h-7 text-xs gap-1.5"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </Button>
          </div>

          <ScrollArea maxHeight="500px">
            <pre className="font-mono text-[11px] leading-relaxed text-[var(--foreground)] select-all whitespace-pre-wrap">
              {JSON.stringify(capsule, null, 2)}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
