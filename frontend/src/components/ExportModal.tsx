import { useState } from "react"
import { Download, Copy, Check, FileJson, FileText, CheckCircle2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { ExitCapsule } from "@/types/gemforge"

interface ExportModalProps {
  open: boolean
  onClose: () => void
  capsule: ExitCapsule | null
  analysisId?: string
}

export function ExportModal({ open, onClose, capsule, analysisId }: ExportModalProps) {
  const [copied, setCopied] = useState(false)

  if (!capsule) return null

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(capsule, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleDownloadJson = () => {
    if (analysisId) {
      window.open(api.getExportUrl(analysisId, "json"), "_blank")
      return
    }
    const blob = new Blob([JSON.stringify(capsule, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gemforge-capsule-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadMarkdown = () => {
    if (analysisId) {
      window.open(api.getExportUrl(analysisId, "markdown"), "_blank")
      return
    }
    // Generate readable client markdown if no server analysis ID
    const md = generateClientMarkdown(capsule)
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gemforge-capsule-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Dependency Exit Capsule"
      description="Download complete evidence-backed audit capsule for offline archiving or pull requests."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-[var(--foreground)]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Schema Version:</span>
            <span className="font-mono font-semibold">{capsule.schema_version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Target Repository:</span>
            <span className="font-mono truncate max-w-[200px]" title={capsule.repository}>
              {capsule.repository.split(/[/\\]/).pop() || capsule.repository}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Verification Verdict:</span>
            <span className="font-mono font-semibold text-[#567C8D] dark:text-[#7DD3FC]">{capsule.verification.verdict}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Generated At:</span>
            <span className="font-mono text-[var(--muted-foreground)]">
              {new Date(capsule.generated_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleDownloadJson}
            variant="outline"
            className="w-full justify-between h-12 border-[var(--border)] hover:bg-[var(--muted)]"
          >
            <div className="flex items-center gap-2.5">
              <FileJson size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download Machine JSON</div>
                <div className="text-[10px] text-[var(--muted-foreground)] font-normal">Full machine-readable ExitCapsule payload</div>
              </div>
            </div>
            <Download size={14} className="text-[var(--muted-foreground)]" />
          </Button>

          <Button
            onClick={handleDownloadMarkdown}
            variant="outline"
            className="w-full justify-between h-12 border-[var(--border)] hover:bg-[var(--muted)]"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-[#567C8D] dark:text-[#7DD3FC]" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download Human Markdown Report</div>
                <div className="text-[10px] text-[var(--muted-foreground)] font-normal">Formatted evidence report for PR review</div>
              </div>
            </div>
            <Download size={14} className="text-[var(--muted-foreground)]" />
          </Button>
        </div>

        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyJson}
            className="text-xs gap-1.5"
          >
            {copied ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Raw JSON</span>
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function generateClientMarkdown(capsule: ExitCapsule): string {
  return `# GemForge Dependency Exit Capsule

**Repository:** \`${capsule.repository}\`  
**Generated At:** ${capsule.generated_at}  
**Schema Version:** \`${capsule.schema_version}\`  
**AI Analysis Status:** \`${capsule.ai_status}\`  
**Verification Verdict:** \`${capsule.verification.verdict}\`  

---

## 1. Declarations & Risks Summary
- **Total Declarations:** ${capsule.dependencies.length}
- **Detected Risks:** ${capsule.risks.length}
- **AST Usages:** ${capsule.usages.length}
- **Evidence Items:** ${capsule.evidence.length}

${capsule.risks.map(r => `### Risk: \`${r.package}\` (${r.kind})
- **Certainty:** ${r.certainty}
- **Evidence:** ${r.evidence}
`).join("\n")}

## 2. Verification Laboratory Evidence
- **Verdict:** \`${capsule.verification.verdict}\`
- **Reason:** ${capsule.verification.reason}

${capsule.verification.comparisons.map(c => `- **${c.check}:** \`${c.status}\` — ${c.explanation}`).join("\n")}

## 3. Limitations
${capsule.limitations.map(l => `- ${l}`).join("\n")}
`
}
