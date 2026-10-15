import { useState } from "react"
import {
  FileCheck2,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Sparkles,
  GitCompare,
  Terminal,
  ShieldAlert,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import type { ExitCapsule } from "@/types/gemforge"

interface ExitCapsulePageProps {
  capsule: ExitCapsule | null
  onOpenExport: () => void
}

export function ExitCapsulePage({ capsule, onOpenExport }: ExitCapsulePageProps) {
  const [activeSection, setActiveSection] = useState<string>("section-1")

  if (!capsule) {
    return (
      <div className="py-16 text-center text-[var(--muted-foreground)] text-xs">
        No active capsule loaded. Scan a repository to view its Exit Capsule report.
      </div>
    )
  }

  const sections = [
    { id: "section-1", title: "1. Dependency Details", icon: FileText },
    { id: "section-2", title: "2. Risk Indicators", icon: AlertTriangle },
    { id: "section-3", title: "3. Source Usage Locations", icon: Code2 },
    { id: "section-4", title: "4. AI Migration Recommendation", icon: Sparkles },
    { id: "section-5", title: "5. Migration Plan & Diff", icon: GitCompare },
    { id: "section-6", title: "6. Baseline Execution Evidence", icon: Terminal },
    { id: "section-7", title: "7. Candidate Execution Evidence", icon: Terminal },
    { id: "section-8", title: "8. Compatibility Gaps", icon: ShieldAlert },
    { id: "section-9", title: "9. Remaining Limitations", icon: HelpCircle },
  ]

  const ver = capsule.verification
  const plan = ver.plan
  const baseline = ver.baseline
  const candidate = ver.candidate

  return (
    <div className="space-y-6 pb-16">
      {/* Report Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#567C8D] dark:text-[#7DD3FC]">
                Official Report
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
              onClick={onOpenExport}
              className="gap-2 shadow-xs"
            >
              <Download size={14} />
              <span>Download Report</span>
            </Button>
          </div>
        </div>

        {/* Report Overview Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">Generated At</span>
            <span className="text-[var(--foreground)]">{new Date(capsule.generated_at).toLocaleString()}</span>
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
              {ver.verdict}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">AI Analysis Status</span>
            <span className="text-[#2F4156] dark:text-[#A5C2FF] font-semibold uppercase">{capsule.ai_status}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-[11px] block">Total Evidence Items</span>
            <span className="text-[var(--foreground)]">{capsule.evidence.length} audited items</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sticky Sidebar Nav + 9 Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Table of Contents */}
        <div className="lg:col-span-3 space-y-2 sticky top-20 hidden lg:block">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] px-2 uppercase tracking-wider">
            Report Sections
          </div>
          <nav className="space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon
              const isActive = activeSection === sec.id
              return (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[var(--card)] text-[var(--foreground)] font-semibold border border-[var(--border)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-[#567C8D] dark:text-[#7DD3FC]" : "text-[var(--muted-foreground)]"} />
                  <span className="truncate">{sec.title}</span>
                </a>
              )
            })}
          </nav>
        </div>

        {/* Right 9 Content Sections */}
        <div className="lg:col-span-9 space-y-8">
          {/* SECTION 1: Dependency Details */}
          <section id="section-1" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">1. Dependency Details</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {capsule.dependencies.length} declarations
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {capsule.dependencies.map((dep, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--foreground)]">{dep.package}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] uppercase">{dep.group}</span>
                    </div>
                    <div className="text-[11px] text-[#2F4156] dark:text-[#A5C2FF] font-medium">{dep.raw}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      Source: {dep.source.file}:{dep.source.line || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 2: Risk Indicators */}
          <section id="section-2" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">2. Risk Indicators</h2>
              </div>
              <Badge variant="warning" className="text-[10px] font-mono">
                {capsule.risks.length} findings
              </Badge>
            </div>

            <div className="space-y-3">
              {capsule.risks.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">No risks detected by static checks.</p>
              ) : (
                capsule.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-2 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-[var(--foreground)]">{risk.package}</span>
                        <Badge variant="conflict" className="text-[10px]">
                          {risk.kind}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {risk.certainty}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                        {risk.sources.map((s) => `${s.file}:${s.line || 1}`).join(", ")}
                      </span>
                    </div>
                    <p className="text-xs font-mono leading-relaxed bg-[var(--code-bg)] text-[var(--code-text)] p-2 rounded border border-[var(--code-border)]">
                      {risk.evidence}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SECTION 3: Source Usage Locations */}
          <section id="section-3" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">3. Source Usage Locations</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {capsule.usages.length} AST sites
              </Badge>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {capsule.usages.map((u, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs font-mono flex items-center justify-between"
                >
                  <div>
                    <span className="text-[#2F4156] dark:text-[#A5C2FF] font-semibold">{u.symbol}</span>
                    <span className="text-[var(--muted-foreground)] ml-2">({u.kind} · {u.mapping})</span>
                  </div>
                  <span className="text-[var(--muted-foreground)] text-[11px]">
                    {u.source.file}:{u.source.line || 1}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: AI Migration Recommendation */}
          <section id="section-4" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">4. AI Migration Recommendation</h2>
              </div>
              <Badge variant="indigo" className="text-[10px] font-mono">
                Gemma 4 IT
              </Badge>
            </div>

            {capsule.recommendations.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">No AI recommendations requested for this scan.</p>
            ) : (
              capsule.recommendations.map((rec, idx) => (
                <div key={idx} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between font-mono p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]">
                    <div>
                      <span className="text-[var(--muted-foreground)]">Target Package:</span>{" "}
                      <span className="font-bold text-[var(--foreground)]">{rec.package}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)]">Proposed:</span>{" "}
                      <span className="font-bold text-[#2F4156] dark:text-[#A5C2FF]">{rec.replacement}</span>
                    </div>
                  </div>

                  {rec.risk_explanation && (
                    <div className="space-y-1">
                      <span className="text-[var(--foreground)] font-semibold">Risk Explanation:</span>
                      <p className="text-[var(--muted-foreground)] leading-relaxed font-sans">{rec.risk_explanation}</p>
                    </div>
                  )}

                  {rec.migration_steps.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[var(--foreground)] font-semibold">Recommended Steps:</span>
                      <ol className="list-decimal pl-5 space-y-1 text-[var(--foreground)] font-sans">
                        {rec.migration_steps.map((s, si) => (
                          <li key={si}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* SECTION 5: Migration Plan & Unified Diff */}
          <section id="section-5" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <GitCompare size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">5. Migration Plan & Unified Diff</h2>
              </div>
              {plan && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {plan.dependency} → {plan.target}
                </Badge>
              )}
            </div>

            {plan ? (
              <div className="space-y-3">
                <CodeBlock
                  code={plan.unified_diff}
                  title="Manifest Unified Diff"
                  language="diff"
                  maxHeight="max-h-72"
                />

                {plan.edits.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]">Manifest Edits:</span>
                    {plan.edits.map((edit, ei) => (
                      <div
                        key={ei}
                        className="p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-mono space-y-1 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-[var(--foreground)]">
                          <span className="font-bold text-[#2F4156] dark:text-[#A5C2FF]">{edit.file}</span>
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            sha:{edit.before_sha256.slice(0, 10)}…
                          </span>
                        </div>
                        <div className="text-rose-600 dark:text-rose-400 font-semibold">- {edit.before}</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">+ {edit.after}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">No migration plan or diff available in capsule.</p>
            )}
          </section>

          {/* SECTION 6: Baseline Execution Evidence */}
          <section id="section-6" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-[var(--muted-foreground)]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">6. Baseline Execution Evidence</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {baseline?.commands.length || 0} commands
              </Badge>
            </div>

            {baseline ? (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[var(--muted-foreground)]">
                  Python Version: <code className="text-[var(--foreground)] font-bold">{baseline.python_version}</code> · Installed: {Object.keys(baseline.installed_packages).length} packages
                </div>
                {baseline.commands.map((cmd) => (
                  <CodeBlock
                    key={cmd.check}
                    code={cmd.stdout || cmd.stderr || "(no output)"}
                    title={`Check: ${cmd.check} (exit: ${cmd.exit_code}, duration: ${cmd.duration_ms.toFixed(0)}ms)`}
                    badge={cmd.status}
                    maxHeight="max-h-40"
                    collapsible
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">Baseline execution not run.</p>
            )}
          </section>

          {/* SECTION 7: Candidate Execution Evidence */}
          <section id="section-7" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">7. Candidate Execution Evidence</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {candidate?.commands.length || 0} commands
              </Badge>
            </div>

            {candidate ? (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[var(--muted-foreground)]">
                  Python Version: <code className="text-[var(--foreground)] font-bold">{candidate.python_version}</code> · Installed: {Object.keys(candidate.installed_packages).length} packages
                </div>
                {candidate.commands.map((cmd) => (
                  <CodeBlock
                    key={cmd.check}
                    code={cmd.stdout || cmd.stderr || "(no output)"}
                    title={`Check: ${cmd.check} (exit: ${cmd.exit_code}, duration: ${cmd.duration_ms.toFixed(0)}ms)`}
                    badge={cmd.status}
                    maxHeight="max-h-40"
                    collapsible
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">Candidate execution not run.</p>
            )}
          </section>

          {/* SECTION 8: Compatibility Gaps */}
          <section id="section-8" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">8. Compatibility Gaps & Unresolved Risks</h2>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {ver.compatibility_gaps.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Observed Gaps:</span>
                  <ul className="list-disc pl-5 space-y-1 text-[var(--foreground)] font-sans">
                    {ver.compatibility_gaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {ver.unresolved_risks.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Unresolved Risks:</span>
                  <ul className="list-disc pl-5 space-y-1 text-[var(--foreground)] font-sans">
                    {ver.unresolved_risks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 9: Remaining Limitations */}
          <section id="section-9" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[var(--muted-foreground)]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">9. Remaining Analysis Limitations</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {capsule.limitations.length} items
              </Badge>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--muted-foreground)] font-sans leading-relaxed">
              {capsule.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
