import { useState } from "react"
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  title?: string
  badge?: string
  sha256?: string | null
  language?: string
  maxHeight?: string
  collapsible?: boolean
  className?: string
}

export function CodeBlock({
  code,
  title,
  badge,
  sha256,
  language,
  maxHeight = "max-h-80",
  collapsible = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-[#1e2333] bg-[#090b10] text-xs font-mono overflow-hidden shadow-inner",
        className,
      )}
    >
      {(title || badge || sha256 || collapsible) && (
        <div className="flex items-center justify-between border-b border-[#1b1f2e] bg-[#0d0f17] px-3 py-1.5 text-slate-400">
          <div className="flex items-center gap-2 truncate">
            {title && <span className="font-medium text-slate-300">{title}</span>}
            {language && (
              <span className="rounded bg-[#171a26] px-1.5 py-0.5 text-[10px] text-slate-400">
                {language}
              </span>
            )}
            {badge && (
              <span className="rounded bg-indigo-950/70 border border-indigo-800/50 px-1.5 py-0.5 text-[10px] text-indigo-300">
                {badge}
              </span>
            )}
            {sha256 && (
              <span
                title={`SHA-256: ${sha256}`}
                className="text-[10px] text-slate-500 truncate max-w-[140px]"
              >
                sha:{sha256.slice(0, 8)}…
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {collapsible && (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 hover:text-slate-200 transition-colors cursor-pointer"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-[#1a1e2c] hover:text-slate-200 transition-colors cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {!collapsed && (
        <pre
          className={cn(
            "p-3 overflow-x-auto text-slate-300 leading-relaxed font-mono whitespace-pre",
            maxHeight,
          )}
        >
          <code>{code || "(empty)"}</code>
        </pre>
      )}
    </div>
  )
}
