import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  ArrowUpDown,
  FileCode,
  FileText,
  AlertTriangle,
  Code2,
  ExternalLink,
  Sparkles,
  FlaskConical,
  X,
  FileCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeBlock } from "@/components/ui/code-block"
import type { ExitCapsule, Dependency, DetectedRisk, UsageLocation, EvidenceItem } from "@/types/gemforge"
import type { ActivePage } from "@/components/Navbar"

interface DependencyExplorerPageProps {
  capsule: ExitCapsule | null
  onNavigate: (page: ActivePage) => void
  onSelectForVerification?: (pkg: string) => void
}

type FilterRiskType = "all" | "conflict" | "uncertainty" | "direct_ref" | "no_risk"
type SortOrder = "name_asc" | "name_desc" | "risk_high" | "usage_count"

export function DependencyExplorerPage({
  capsule,
  onNavigate,
  onSelectForVerification,
}: DependencyExplorerPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState<FilterRiskType>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("risk_high")
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  if (!capsule) {
    return (
      <div className="py-16 text-center text-[var(--muted-foreground)] text-xs">
        No active capsule loaded. Scan a repository to explore dependencies.
      </div>
    )
  }

  // Group dependencies by package name (since same package can appear in multiple manifests)
  const groupedDependencies = useMemo(() => {
    const map = new Map<
      string,
      {
        pkg: string
        declarations: Dependency[]
        risks: DetectedRisk[]
        usages: UsageLocation[]
        evidence: EvidenceItem[]
        hasRecommendation: boolean
      }
    >()

    for (const dep of capsule.dependencies) {
      const key = dep.package.toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          pkg: dep.package,
          declarations: [],
          risks: [],
          usages: [],
          evidence: [],
          hasRecommendation: capsule.recommendations.some((r) => r.package.toLowerCase() === key),
        })
      }
      map.get(key)!.declarations.push(dep)
    }

    // Associate risks
    for (const risk of capsule.risks) {
      const key = risk.package.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.risks.push(risk)
      }
    }

    // Associate usages
    for (const usage of capsule.usages) {
      const key = usage.package.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.usages.push(usage)
      }
    }

    // Associate evidence items
    for (const ev of capsule.evidence) {
      const key = ev.package.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.evidence.push(ev)
      }
    }

    return Array.from(map.values())
  }, [capsule])

  // Filter and sort
  const filteredDependencies = useMemo(() => {
    return groupedDependencies
      .filter((item) => {
        // Search filter
        const query = searchTerm.toLowerCase().trim()
        if (query) {
          const matchesPkg = item.pkg.toLowerCase().includes(query)
          const matchesManifest = item.declarations.some(
            (d) => d.source.file.toLowerCase().includes(query) || d.constraint.includes(query),
          )
          const matchesUsage = item.usages.some(
            (u) => u.module.toLowerCase().includes(query) || u.symbol.toLowerCase().includes(query),
          )
          if (!matchesPkg && !matchesManifest && !matchesUsage) return false
        }

        // Risk category filter
        if (riskFilter === "conflict") {
          return item.risks.some((r) => r.kind === "constraint_conflict")
        }
        if (riskFilter === "uncertainty") {
          return item.risks.some((r) => r.kind === "constraint_uncertainty")
        }
        if (riskFilter === "direct_ref") {
          return item.risks.some((r) => r.kind === "direct_reference")
        }
        if (riskFilter === "no_risk") {
          return item.risks.length === 0
        }

        return true
      })
      .sort((a, b) => {
        if (sortOrder === "name_asc") return a.pkg.localeCompare(b.pkg)
        if (sortOrder === "name_desc") return b.pkg.localeCompare(a.pkg)
        if (sortOrder === "usage_count") return b.usages.length - a.usages.length
        if (sortOrder === "risk_high") {
          const aConflict = a.risks.some((r) => r.kind === "constraint_conflict") ? 3 : a.risks.length > 0 ? 2 : 0
          const bConflict = b.risks.some((r) => r.kind === "constraint_conflict") ? 3 : b.risks.length > 0 ? 2 : 0
          if (bConflict !== aConflict) return bConflict - aConflict
          return a.pkg.localeCompare(b.pkg)
        }
        return 0
      })
  }, [groupedDependencies, searchTerm, riskFilter, sortOrder])

  // Detail item for drawer
  const activeDetail = useMemo(() => {
    if (!selectedPackage) return null
    return groupedDependencies.find((g) => g.pkg.toLowerCase() === selectedPackage.toLowerCase()) || null
  }, [selectedPackage, groupedDependencies])

  return (
    <div className="space-y-6 pb-12">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs transition-colors">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search dependencies, constraints, files, or symbols…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9 font-mono"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Filter Buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-1">
            <Filter size={12} className="text-[var(--muted-foreground)] mx-1.5" />
            {(
              [
                { id: "all", label: "All" },
                { id: "conflict", label: "Conflicts" },
                { id: "uncertainty", label: "Uncertain" },
                { id: "direct_ref", label: "Direct Refs" },
                { id: "no_risk", label: "Nominal" },
              ] as const
            ).map((rf) => (
              <button
                key={rf.id}
                type="button"
                onClick={() => setRiskFilter(rf.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                  riskFilter === rf.id
                    ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-xs border border-[var(--border)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={13} className="text-[var(--muted-foreground)]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
            >
              <option value="risk_high">Sort: Highest Risk</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="name_desc">Sort: Name (Z-A)</option>
              <option value="usage_count">Sort: Most Usages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split layout when drawer is open */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dependency Cards List */}
        <div className={selectedPackage ? "lg:col-span-7 space-y-3" : "lg:col-span-12 space-y-3"}>
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing {filteredDependencies.length} of {groupedDependencies.length} unique packages
            </span>
            {riskFilter !== "all" && (
              <button
                onClick={() => setRiskFilter("all")}
                className="text-[#567C8D] dark:text-[#7DD3FC] hover:underline cursor-pointer font-medium"
              >
                Clear risk filter
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {filteredDependencies.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-xs text-[var(--muted-foreground)]">
                No dependencies match the search criteria.
              </div>
            ) : (
              filteredDependencies.map((item) => {
                const isSelected = selectedPackage?.toLowerCase() === item.pkg.toLowerCase()
                const hasConflict = item.risks.some((r) => r.kind === "constraint_conflict")
                const hasUncertainty = item.risks.some((r) => r.kind === "constraint_uncertainty")

                return (
                  <div
                    key={item.pkg}
                    onClick={() => setSelectedPackage(isSelected ? null : item.pkg)}
                    className={`rounded-xl border p-4 transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? "border-[#567C8D] bg-[#EBF3F8] dark:border-[#123499] dark:bg-[#071d60] ring-1 ring-[#567C8D]/50 dark:ring-[#123499]/60"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Package Name & Constraints */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-[var(--foreground)]">
                            {item.pkg}
                          </span>

                          {hasConflict && (
                            <Badge variant="conflict" className="text-[10px]">
                              Conflict
                            </Badge>
                          )}
                          {!hasConflict && hasUncertainty && (
                            <Badge variant="warning" className="text-[10px]">
                              Uncertain
                            </Badge>
                          )}

                          {item.hasRecommendation && (
                            <Badge variant="indigo" className="text-[10px] gap-1">
                              <Sparkles size={9} />
                              Gemma Recommendation
                            </Badge>
                          )}
                        </div>

                        {/* Declarations chips */}
                        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                          {item.declarations.map((dec, i) => (
                            <span
                              key={i}
                              className="rounded bg-[var(--muted)]/60 border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--foreground)]"
                            >
                              {dec.raw}
                              <span className="text-[var(--muted-foreground)] ml-1">
                                ({dec.source.file}:{dec.source.line || 1})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right metadata badges */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-mono">
                          <Code2 size={13} className="text-[var(--muted-foreground)]" />
                          <span>{item.usages.length} usages</span>
                        </div>

                        {item.evidence.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-mono">
                            <FileCheck size={13} className="text-[var(--muted-foreground)]" />
                            <span>{item.evidence.length} evidence</span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-[#567C8D] dark:text-[#7DD3FC]"
                        >
                          {isSelected ? "Close" : "Inspect →"}
                        </Button>
                      </div>
                    </div>

                    {/* Quick risk summary if any */}
                    {item.risks.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[var(--border)] text-xs">
                        {item.risks.map((r, ri) => (
                          <div key={ri} className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                            <span>{r.evidence}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Detailed Inspector Drawer */}
        {activeDetail && (
          <div className="lg:col-span-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5 sticky top-20 shadow-lg transition-colors">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-base font-bold text-[var(--foreground)]">
                    {activeDetail.pkg}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {activeDetail.declarations[0]?.group || "runtime"}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Detailed manifest, AST usage, and empirical evidence
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {activeDetail.hasRecommendation && (
                <Button
                  size="sm"
                  onClick={() => onNavigate("migration")}
                  className="flex-1 text-xs h-8 gap-1.5"
                >
                  <Sparkles size={12} />
                  <span>Migration Intelligence</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (onSelectForVerification) onSelectForVerification(activeDetail.pkg)
                  onNavigate("verification")
                }}
                className="flex-1 text-xs h-8 gap-1.5"
              >
                <FlaskConical size={12} />
                <span>Verify in Lab</span>
              </Button>
            </div>

            {/* Manifest Declarations */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <FileText size={13} className="text-[var(--muted-foreground)]" />
                Declared Manifest Sources ({activeDetail.declarations.length})
              </span>
              <div className="space-y-1.5">
                {activeDetail.declarations.map((dec, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[var(--foreground)]">
                      <span className="font-bold text-[#2F4156] dark:text-[#A5C2FF]">{dec.raw}</span>
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        {dec.source.file}:{dec.source.line || 1}
                      </span>
                    </div>
                    {dec.constraint && (
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        Parsed Constraint: <code className="text-[var(--foreground)] font-semibold">{dec.constraint}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AST Usages */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <Code2 size={13} className="text-[var(--muted-foreground)]" />
                Python AST Usages ({activeDetail.usages.length})
              </span>
              {activeDetail.usages.length === 0 ? (
                <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 text-xs text-[var(--muted-foreground)]">
                  No imports or symbol references detected in scanned Python files.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeDetail.usages.map((u, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[var(--foreground)]">
                        <span className="font-semibold truncate max-w-[200px]" title={u.symbol}>
                          {u.symbol}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {u.kind} · {u.mapping}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {u.source.file}:{u.source.line || 1}
                        {u.alias && u.alias !== u.symbol && (
                          <span className="text-[var(--foreground)] font-medium ml-1.5">as {u.alias}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Items */}
            {activeDetail.evidence.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <FileCode size={13} className="text-[var(--muted-foreground)]" />
                  Evidence Items ({activeDetail.evidence.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeDetail.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#567C8D] dark:text-[#7DD3FC] font-semibold">
                          {ev.id}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)] uppercase">{ev.kind}</span>
                      </div>
                      <p className="text-[11px] text-[var(--foreground)] font-sans leading-relaxed">
                        {ev.description}
                      </p>
                      {ev.excerpt && (
                        <CodeBlock
                          code={ev.excerpt}
                          sha256={ev.excerpt_sha256}
                          title={ev.source ? `${ev.source.file}:${ev.source.line || 1}` : undefined}
                          maxHeight="max-h-28"
                          collapsible
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
