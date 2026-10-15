import React, { useState, useMemo, Suspense } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Box,
  FileCode,
  FileText,
  AlertTriangle,
  Code2,
  ExternalLink,
  Sparkles,
  FlaskConical,
  GitFork,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  HelpCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodeBlock } from "@/components/ui/code-block"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import type {
  ExitCapsule,
  Dependency,
  DetectedRisk,
  UsageLocation,
  EvidenceItem,
} from "@/types/gemforge"
import type { ActivePage } from "@/components/Navbar"

// Lazy-load React Flow dependency graph
const DependencyGraph = React.lazy(() =>
  import("@/components/dependency-graph/DependencyGraph").then((m) => ({
    default: m.DependencyGraph,
  })),
)

interface DependencyExplorerPageProps {
  capsule: ExitCapsule | null
  onNavigate: (page: ActivePage) => void
  onSelectForVerification?: (pkg: string) => void
}

type FilterRiskType = "all" | "conflict" | "uncertainty" | "direct_ref" | "clean"

export interface DependencyRowData {
  pkg: string
  declarations: Dependency[]
  constraints: string[]
  manifestLocations: string[]
  risks: DetectedRisk[]
  usages: UsageLocation[]
  evidence: EvidenceItem[]
  hasRecommendation: boolean
  highestRiskLevel: "conflict" | "uncertainty" | "direct_ref" | "clean"
  riskScore: number // For sorting (3 = conflict, 2 = direct_ref, 1 = uncertainty, 0 = clean)
  usageCount: number
}

export function DependencyExplorerPage({
  capsule,
  onNavigate,
  onSelectForVerification,
}: DependencyExplorerPageProps) {
  const [activeTab, setActiveTab] = useState<"table" | "graph">("table")
  const [globalFilter, setGlobalFilter] = useState("")
  const [riskFilter, setRiskFilter] = useState<FilterRiskType>("all")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "riskScore", desc: true },
  ])
  const [selectedPackage, setSelectedPackage] = useState<DependencyRowData | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Derive rows from actual capsule evidence
  const tableData = useMemo<DependencyRowData[]>(() => {
    if (!capsule) return []

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
          hasRecommendation: capsule.recommendations.some(
            (r) => r.package.toLowerCase() === key,
          ),
        })
      }
      map.get(key)!.declarations.push(dep)
    }

    // Attach risks
    for (const risk of capsule.risks) {
      const key = risk.package.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.risks.push(risk)
      }
    }

    // Attach usages
    for (const usage of capsule.usages) {
      const key = usage.package.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.usages.push(usage)
      }
    }

    // Attach evidence items
    for (const ev of capsule.evidence) {
      const key = ev.package.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.evidence.push(ev)
      }
    }

    return Array.from(map.values()).map((item) => {
      let highestRiskLevel: DependencyRowData["highestRiskLevel"] = "clean"
      let riskScore = 0

      if (item.risks.some((r) => r.kind === "constraint_conflict")) {
        highestRiskLevel = "conflict"
        riskScore = 3
      } else if (item.risks.some((r) => r.kind === "direct_reference")) {
        highestRiskLevel = "direct_ref"
        riskScore = 2
      } else if (item.risks.some((r) => r.kind === "constraint_uncertainty")) {
        highestRiskLevel = "uncertainty"
        riskScore = 1
      }

      const constraints = Array.from(
        new Set(item.declarations.map((d) => d.constraint).filter(Boolean)),
      )
      const manifestLocations = Array.from(
        new Set(
          item.declarations.map(
            (d) => `${d.source.file}${d.source.line ? `:${d.source.line}` : ""}`,
          ),
        ),
      )

      return {
        pkg: item.pkg,
        declarations: item.declarations,
        constraints,
        manifestLocations,
        risks: item.risks,
        usages: item.usages,
        evidence: item.evidence,
        hasRecommendation: item.hasRecommendation,
        highestRiskLevel,
        riskScore,
        usageCount: item.usages.length,
      }
    })
  }, [capsule])

  // Filter rows by risk category dropdown
  const filteredData = useMemo(() => {
    if (riskFilter === "all") return tableData
    return tableData.filter((row) => row.highestRiskLevel === riskFilter)
  }, [tableData, riskFilter])

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<DependencyRowData>[]>(
    () => [
      {
        accessorKey: "pkg",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Package
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="rounded-md p-1.5 bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)]">
                <Box className="h-4 w-4 text-[var(--accent-teal)]" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage(item)
                    setSheetOpen(true)
                  }}
                  className="font-semibold text-xs text-[var(--foreground)] hover:text-[var(--primary)] hover:underline text-left cursor-pointer flex items-center gap-1.5"
                >
                  {item.pkg}
                  {item.hasRecommendation && (
                    <Badge variant="indigo" className="text-[10px] py-0 px-1.5 h-4">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      AI
                    </Badge>
                  )}
                </button>
                <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
                  {item.declarations[0]?.group || "runtime"}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "constraints",
        header: "Declared Constraint",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div>
              <div className="flex flex-wrap gap-1">
                {item.constraints.length > 0 ? (
                  item.constraints.map((c, i) => (
                    <span
                      key={i}
                      className="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] bg-[var(--code-bg)] border border-[var(--code-border)] text-[var(--code-text)] font-semibold"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[var(--muted-foreground)] italic text-[11px]">unpinned</span>
                )}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-mono mt-0.5 truncate max-w-[200px]" title={item.manifestLocations.join(", ")}>
                {item.manifestLocations[0] || "manifest"}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "riskScore",
        id: "riskScore",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Risk Category
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original
          if (item.highestRiskLevel === "conflict") {
            return (
              <Badge variant="conflict" className="gap-1 font-semibold">
                <AlertTriangle className="h-3 w-3" />
                Proven Conflict ({item.risks.length})
              </Badge>
            )
          }
          if (item.highestRiskLevel === "direct_ref") {
            return (
              <Badge variant="warning" className="gap-1 font-semibold">
                <AlertTriangle className="h-3 w-3" />
                Direct Ref ({item.risks.length})
              </Badge>
            )
          }
          if (item.highestRiskLevel === "uncertainty") {
            return (
              <Badge variant="warning" className="gap-1">
                <HelpCircle className="h-3 w-3" />
                Uncertain ({item.risks.length})
              </Badge>
            )
          }
          return (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Clean
            </Badge>
          )
        },
      },
      {
        accessorKey: "usageCount",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            AST Usages
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original
          const uniqueFiles = new Set(item.usages.map((u) => u.source.file)).size
          return (
            <div>
              <div className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {item.usageCount} {item.usageCount === 1 ? "import" : "imports"}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                across {uniqueFiles} {uniqueFiles === 1 ? "file" : "files"}
              </div>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => {
                  setSelectedPackage(item)
                  setSheetOpen(true)
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                Inspect
              </Button>
              {onSelectForVerification && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => {
                    onSelectForVerification(item.pkg)
                    onNavigate("verification")
                  }}
                  title="Verify in Laboratory"
                >
                  <FlaskConical className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [onNavigate, onSelectForVerification],
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (!capsule) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-16 text-center text-xs text-[var(--muted-foreground)]">
        No active capsule loaded. Scan a repository to explore dependencies.
      </div>
    )
  }

  const recommendationForSelected = selectedPackage
    ? capsule.recommendations.find(
        (r) => r.package.toLowerCase() === selectedPackage.pkg.toLowerCase(),
      )
    : null

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Dependency Explorer
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Inspect declared packages, AST usage locations, version constraints, and proven risks.
          </p>
        </div>

        {/* View Switcher: Table vs Interactive Graph */}
        <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-lg border border-[var(--border)] select-none">
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Table View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("graph")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "graph"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <GitFork className="h-3.5 w-3.5" />
            Relationship Graph
          </button>
        </div>
      </div>

      {activeTab === "graph" ? (
        <Suspense
          fallback={
            <div className="h-[600px] w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full max-w-xl" />
              <p className="text-xs text-[var(--muted-foreground)] animate-pulse">
                Loading interactive AST dependency relationship graph...
              </p>
            </div>
          }
        >
          <DependencyGraph capsule={capsule} />
        </Suspense>
      ) : (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search dependencies..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Risk Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter:
              </span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as FilterRiskType)}
                aria-label="Filter dependencies by risk"
                className="h-9 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs text-[var(--foreground)] shadow-xs focus-visible:outline-none focus-visible:ring-1 cursor-pointer"
              >
                <option value="all">All Packages ({tableData.length})</option>
                <option value="conflict">Proven Conflicts</option>
                <option value="uncertainty">Uncertainties</option>
                <option value="direct_ref">Direct References</option>
                <option value="clean">Clean / No Risk</option>
              </select>
            </div>
          </div>

          {/* TanStack Table Container */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-[var(--muted)]/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-xs text-[var(--muted-foreground)]"
                    >
                      No dependencies match the current search and filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--muted)]/30 text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <span>Showing</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    (table.getFilteredRowModel().rows.length > 0 ? 1 : 0)}
                  -
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}
                </span>
                <span>of</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {table.getFilteredRowModel().rows.length}
                </span>
                <span>packages</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-2">
                  <span>Page</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount() || 1}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Detail Sheet / Slide-over Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        {selectedPackage && (
          <>
            <SheetHeader onClose={() => setSheetOpen(false)}>
              <div className="flex items-center gap-2 mb-1">
                <Box className="h-5 w-5 text-[var(--accent-teal)]" />
                <SheetTitle className="text-lg">{selectedPackage.pkg}</SheetTitle>
                {selectedPackage.highestRiskLevel === "conflict" ? (
                  <Badge variant="conflict">Proven Conflict</Badge>
                ) : selectedPackage.highestRiskLevel === "uncertainty" ? (
                  <Badge variant="warning">Uncertainty</Badge>
                ) : (
                  <Badge variant="success">Clean</Badge>
                )}
              </div>
              <SheetDescription>
                Declared in{" "}
                <span className="font-mono text-[var(--foreground)] font-semibold">
                  {selectedPackage.manifestLocations.join(", ")}
                </span>
              </SheetDescription>
            </SheetHeader>

            <SheetContent className="space-y-5">
              {/* Declared Specifications */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2">
                  Declared Constraints
                </h4>
                <div className="space-y-1.5">
                  {selectedPackage.declarations.map((d, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)]">{d.raw}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {d.group}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        File: {d.source.file}:{d.source.line ?? "?"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Risks */}
              {selectedPackage.risks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--status-error-text)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Detected Risks ({selectedPackage.risks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPackage.risks.map((risk, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-xs text-[var(--status-error-text)] font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{risk.kind}</span>
                          <span className="text-[10px] uppercase font-semibold">
                            {risk.certainty}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-90">{risk.evidence}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AST Usage Inventory */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-[var(--accent-teal)]" />
                  AST Import Locations ({selectedPackage.usages.length})
                </h4>
                {selectedPackage.usages.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {selectedPackage.usages.map((u, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-mono space-y-0.5"
                      >
                        <div className="text-[var(--foreground)] font-semibold truncate" title={u.source.file}>
                          {u.source.file}:{u.source.line ?? "?"}
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-2">
                          <span>
                            symbol: <strong className="text-[var(--foreground)]">{u.symbol}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>module: {u.module}</span>
                          <span>&bull;</span>
                          <span>{u.mapping}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    No direct AST import statements detected for this package in scanned files.
                  </p>
                )}
              </div>

              {/* Gemma 4 Migration Status */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent-teal)]" />
                  Gemma 4 Migration Advice
                </h4>
                {recommendationForSelected ? (
                  <div className="p-3 rounded-lg border border-[#C8D9E6] dark:border-[#123499] bg-[#C8D9E6]/20 dark:bg-[#0A2472]/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--foreground)]">
                        Suggested: {recommendationForSelected.replacement || "See steps"}
                      </span>
                      <Badge variant="indigo" className="text-[10px]">
                        Unverified AI Hypothesis
                      </Badge>
                    </div>
                    {recommendationForSelected.migration_steps.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[var(--foreground)]">
                        {recommendationForSelected.migration_steps.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    No Gemma 4 migration advice generated for this dependency.
                  </p>
                )}
              </div>
            </SheetContent>

            <SheetFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSheetOpen(false)
                  onNavigate("migration")
                }}
              >
                Inspect Migration
              </Button>
              {onSelectForVerification && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSheetOpen(false)
                    onSelectForVerification(selectedPackage.pkg)
                    onNavigate("verification")
                  }}
                >
                  <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                  Test in Lab
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </Sheet>
    </div>
  )
}
