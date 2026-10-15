import React, { useState } from "react"
import { DiffEditor } from "@monaco-editor/react"
import { useTheme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Copy, Check, FileCode } from "lucide-react"

interface MonacoDiffViewerProps {
  original: string
  modified: string
  language?: string
  height?: string | number
  fileName?: string
}

export function MonacoDiffViewer({
  original,
  modified,
  language = "python",
  height = "380px",
  fileName,
}: MonacoDiffViewerProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [copied, setCopied] = useState(false)

  const handleCopyModified = async () => {
    try {
      await navigator.clipboard.writeText(modified)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)]/50 text-xs">
        <div className="flex items-center gap-2 text-[var(--foreground)] font-mono font-medium">
          <FileCode className="h-4 w-4 text-[var(--accent-teal)]" />
          <span>{fileName || "Diff View"}</span>
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase">
            ({language})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
            Read-only side-by-side inspection
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5"
            onClick={handleCopyModified}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Proposed</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Side-by-side Labels */}
      <div className="grid grid-cols-2 text-[11px] font-mono font-semibold border-b border-[var(--border)] bg-[var(--card)]">
        <div className="px-4 py-1.5 text-[var(--status-error-text)] border-r border-[var(--border)] flex items-center justify-between">
          <span>&minus; Original Baseline Code</span>
          <span className="text-[10px] font-normal text-[var(--muted-foreground)]">read-only</span>
        </div>
        <div className="px-4 py-1.5 text-[var(--status-success-text)] flex items-center justify-between">
          <span>+ Proposed Candidate Migration</span>
          <span className="text-[10px] font-normal text-[var(--muted-foreground)]">unapplied</span>
        </div>
      </div>

      {/* Monaco DiffEditor */}
      <div style={{ height }}>
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={isDark ? "vs-dark" : "vs"}
          options={{
            readOnly: true,
            renderSideBySide: true,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            automaticLayout: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
          loading={
            <div className="h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
              Loading Monaco Diff Editor...
            </div>
          }
        />
      </div>
    </div>
  )
}
export default MonacoDiffViewer
