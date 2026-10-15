import { useState, useMemo, useCallback } from "react"
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useTheme } from "@/lib/theme"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Box, FileCode, GitFork, AlertTriangle, ShieldCheck, X } from "lucide-react"
import type { ExitCapsule, UsageLocation, DetectedRisk } from "@/types/gemforge"

interface DependencyGraphProps {
  capsule: ExitCapsule
}

export function DependencyGraph({ capsule }: DependencyGraphProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Build nodes and edges strictly from real AST usages and declared dependencies
  const { initialNodes, initialEdges, nodeDetailsMap } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    const details = new Map<string, {
      title: string
      type: "package" | "file"
      risks: DetectedRisk[]
      usages: UsageLocation[]
      constraint?: string
      sourceFile?: string
      symbols?: string[]
    }>()

    // 1. Group usages by package and source file
    const packageUsages = new Map<string, UsageLocation[]>()
    for (const u of capsule.usages) {
      const pkg = u.package.toLowerCase()
      if (!packageUsages.has(pkg)) packageUsages.set(pkg, [])
      packageUsages.get(pkg)!.push(u)
    }

    // Map of unique source files
    const fileUsages = new Map<string, UsageLocation[]>()
    for (const u of capsule.usages) {
      const file = u.source.file
      if (!fileUsages.has(file)) fileUsages.set(file, [])
      fileUsages.get(file)!.push(u)
    }

    // Package risks lookup
    const packageRisks = new Map<string, DetectedRisk[]>()
    for (const r of capsule.risks) {
      const pkg = r.package.toLowerCase()
      if (!packageRisks.has(pkg)) packageRisks.set(pkg, [])
      packageRisks.get(pkg)!.push(r)
    }

    // Layout configuration
    const col1X = 50
    const col2X = 450
    let pkgY = 40
    let fileY = 40
    const rowGap = 90

    // Add Package Nodes
    const activePackages = Array.from(packageUsages.keys())
    // Also include dependencies with detected risks even if no source usages found
    for (const dep of capsule.dependencies) {
      const pkg = dep.package.toLowerCase()
      if (!activePackages.includes(pkg) && packageRisks.has(pkg)) {
        activePackages.push(pkg)
      }
    }

    activePackages.forEach((pkgName) => {
      const risks = packageRisks.get(pkgName) || []
      const usages = packageUsages.get(pkgName) || []
      const depDecl = capsule.dependencies.find((d) => d.package.toLowerCase() === pkgName)
      const hasConflict = risks.some((r) => r.kind === "constraint_conflict")
      const hasUncertainty = risks.some((r) => r.kind === "constraint_uncertainty")

      const nodeId = `pkg-${pkgName}`

      details.set(nodeId, {
        title: depDecl ? depDecl.package : pkgName,
        type: "package",
        risks,
        usages,
        constraint: depDecl?.constraint,
        sourceFile: depDecl?.source.file,
      })

      const borderColor = hasConflict
        ? isDark ? "#FDA4AF" : "#9F1239"
        : hasUncertainty
        ? isDark ? "#FCD34D" : "#92400E"
        : isDark ? "#0A2472" : "#D2DFEB"

      const bgColor = isDark ? "#051650" : "#FFFFFF"
      const textColor = isDark ? "#F0F4FF" : "#2F4156"

      nodes.push({
        id: nodeId,
        type: "default",
        data: {
          label: (
            <div className="text-left select-none p-1 font-sans">
              <div className="flex items-center gap-1.5 font-semibold text-xs tracking-tight">
                <Box className="h-3.5 w-3.5 shrink-0 text-[var(--accent-teal)]" />
                <span>{depDecl ? depDecl.package : pkgName}</span>
                {depDecl?.constraint && (
                  <span className="text-[10px] font-mono opacity-70">
                    {depDecl.constraint}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1">
                {hasConflict ? (
                  <Badge variant="conflict" className="text-[10px] py-0 px-1.5 h-4">
                    Conflict
                  </Badge>
                ) : hasUncertainty ? (
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-4">
                    Uncertain
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                    Clean
                  </Badge>
                )}
                <span className="text-[10px] text-[var(--muted-foreground)] ml-auto font-mono">
                  {usages.length} uses
                </span>
              </div>
            </div>
          ),
        },
        position: { x: col1X, y: pkgY },
        style: {
          background: bgColor,
          color: textColor,
          border: `1.5px solid ${borderColor}`,
          borderRadius: "8px",
          padding: "6px 10px",
          width: 220,
          boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.06)",
        },
      })

      pkgY += rowGap
    })

    // Add Source File Nodes
    Array.from(fileUsages.keys()).forEach((filePath) => {
      const usages = fileUsages.get(filePath) || []
      const nodeId = `file-${filePath.replace(/[^a-zA-Z0-9_-]/g, "_")}`
      const symbols = Array.from(new Set(usages.map((u) => u.symbol))).filter(Boolean)

      details.set(nodeId, {
        title: filePath,
        type: "file",
        risks: [],
        usages,
        symbols,
      })

      nodes.push({
        id: nodeId,
        type: "default",
        data: {
          label: (
            <div className="text-left select-none p-1 font-sans">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-tight text-[var(--foreground)]">
                <FileCode className="h-3.5 w-3.5 shrink-0 text-[var(--accent-teal)]" />
                <span className="truncate max-w-[190px]" title={filePath}>
                  {filePath.split("/").pop() || filePath}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                <span>{filePath.split("/").slice(0, -1).join("/") || "."}</span>
                <span className="font-mono">{usages.length} imports</span>
              </div>
            </div>
          ),
        },
        position: { x: col2X, y: fileY },
        style: {
          background: isDark ? "#0A2472" : "#E9F1F6",
          color: isDark ? "#F0F4FF" : "#2F4156",
          border: `1px solid ${isDark ? "#123499" : "#C8D9E6"}`,
          borderRadius: "8px",
          padding: "6px 10px",
          width: 250,
          boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4)" : "0 2px 6px rgba(0,0,0,0.05)",
        },
      })

      fileY += rowGap
    })

    // Build Edges: Connect Package Nodes to Source File Nodes based on AST Usages
    const edgeSet = new Set<string>()
    for (const u of capsule.usages) {
      const pkg = u.package.toLowerCase()
      const sourcePkgId = `pkg-${pkg}`
      const targetFileId = `file-${u.source.file.replace(/[^a-zA-Z0-9_-]/g, "_")}`
      const edgeKey = `${sourcePkgId}->${targetFileId}`

      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey)
        const risks = packageRisks.get(pkg) || []
        const isConflict = risks.some((r) => r.kind === "constraint_conflict")

        edges.push({
          id: edgeKey,
          source: sourcePkgId,
          target: targetFileId,
          animated: isConflict,
          style: {
            stroke: isConflict
              ? isDark ? "#FDA4AF" : "#9F1239"
              : isDark ? "#38BDF8" : "#567C8D",
            strokeWidth: isConflict ? 2 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isConflict
              ? isDark ? "#FDA4AF" : "#9F1239"
              : isDark ? "#38BDF8" : "#567C8D",
            width: 14,
            height: 14,
          },
        })
      }
    }

    return { initialNodes: nodes, initialEdges: edges, nodeDetailsMap: details }
  }, [capsule, isDark])

  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)

  // Keep nodes & edges synchronized when capsule or theme changes
  useMemo(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const selectedDetails = selectedNodeId ? nodeDetailsMap.get(selectedNodeId) : null

  if (capsule.usages.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-xs text-[var(--muted-foreground)]">
        <GitFork className="mx-auto h-8 w-8 mb-3 opacity-40" />
        <p className="font-medium text-[var(--foreground)]">No AST Usage Evidence Available</p>
        <p className="mt-1 max-w-md mx-auto">
          The scanned repository has not recorded any active Python AST imports or references in the capsule.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3 bg-[var(--card)]/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--foreground)]">
        <span className="font-semibold flex items-center gap-1.5">
          <GitFork className="h-4 w-4 text-[var(--accent-teal)]" />
          AST Dependency Graph
        </span>
        <span className="text-[var(--border)]">|</span>
        <span className="text-[var(--muted-foreground)] text-[11px]">
          {nodes.length} Nodes &bull; {edges.length} Import Relationships
        </span>
      </div>

      {/* Selected Node Details Drawer / Popover */}
      {selectedDetails && (
        <div className="absolute top-3 right-4 z-10 w-80 max-h-[550px] overflow-y-auto animate-fade-in">
          <Card className="border-[var(--border)] bg-[var(--card)] shadow-xl">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
                  {selectedDetails.type === "package" ? "Package Details" : "Source File Usage"}
                </span>
                <CardTitle className="text-sm font-semibold truncate max-w-[200px]" title={selectedDetails.title}>
                  {selectedDetails.title}
                </CardTitle>
                {selectedDetails.constraint && (
                  <p className="text-xs font-mono text-[var(--muted-foreground)]">
                    Constraint: {selectedDetails.constraint}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3 text-xs">
              {/* Risks if any */}
              {selectedDetails.risks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-[11px] text-[var(--status-error-text)] flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Detected Risks ({selectedDetails.risks.length})
                  </span>
                  {selectedDetails.risks.map((r, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[11px] text-[var(--status-error-text)] font-mono leading-tight"
                    >
                      <div className="font-semibold">{r.kind}</div>
                      <div className="text-[10px] mt-0.5 opacity-90">{r.evidence}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AST Import Locations */}
              <div className="space-y-1.5">
                <span className="font-semibold text-[11px] text-[var(--foreground)] flex items-center gap-1">
                  <FileCode className="h-3.5 w-3.5 text-[var(--accent-teal)]" />
                  AST Import Locations ({selectedDetails.usages.length})
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {selectedDetails.usages.map((u, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[var(--muted)] border border-[var(--border)] text-[11px] font-mono space-y-0.5"
                    >
                      <div className="text-[var(--foreground)] font-semibold truncate" title={u.source.file}>
                        {u.source.file}:{u.source.line ?? "?"}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">
                        Symbol: <span className="text-[var(--foreground)] font-bold">{u.symbol}</span> (module: {u.module})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        colorMode={isDark ? "dark" : "light"}
      >
        <Background color={isDark ? "#0A2472" : "#D2DFEB"} gap={16} />
        <Controls
          className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] fill-[var(--foreground)]"
        />
        <MiniMap
          nodeColor={() => (isDark ? "#123499" : "#567C8D")}
          maskColor={isDark ? "rgba(0, 7, 45, 0.7)" : "rgba(245, 239, 235, 0.7)"}
          className="border-[var(--border)] bg-[var(--card)]"
        />
      </ReactFlow>
    </div>
  )
}
