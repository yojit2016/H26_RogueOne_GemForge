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
        "rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)] text-xs font-mono overflow-hidden shadow-xs transition-colors",
        className,
      )}
    >
      {(title || badge || sha256 || collapsible) && (
        <div className="flex items-center justify-between border-b border-[var(--code-border)] bg-[var(--muted)]/50 px-3 py-1.5 text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2 truncate">
            {title && <span className="font-semibold text-[var(--foreground)]">{title}</span>}
            {language && (
              <span className="rounded bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] border border-[var(--border)]">
                {language}
              </span>
            )}
            {badge && (
              <span className="rounded bg-[#C8D9E6]/40 dark:bg-[#0A2472] border border-[#567C8D]/30 dark:border-[#123499] px-1.5 py-0.5 text-[10px] text-[var(--foreground)] dark:text-[#A5C2FF]">
                {badge}
              </span>
            )}
            {sha256 && (
              <span
                title={`SHA-256: ${sha256}`}
                className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[140px]"
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
                className="p-1 hover:text-[var(--foreground)] transition-colors cursor-pointer"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-[var(--card)] hover:text-[var(--foreground)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
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
            "p-3 overflow-x-auto text-[var(--code-text)] leading-relaxed font-mono whitespace-pre selection:bg-[#567C8D]/25 dark:selection:bg-[#123499]/50",
            maxHeight,
          )}
        >
          <code>{code || "(empty)"}</code>
        </pre>
      )}
    </div>
  )
}
