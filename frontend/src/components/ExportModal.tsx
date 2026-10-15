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
      <div className="space-y-4">
        <div className="rounded-xl border border-[#1e2333] bg-[#0a0c12] p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Schema Version:</span>
            <span className="font-mono text-slate-200">{capsule.schema_version}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Target Repository:</span>
            <span className="font-mono text-slate-200 truncate max-w-[200px]" title={capsule.repository}>
              {capsule.repository.split(/[/\\]/).pop() || capsule.repository}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Verification Verdict:</span>
            <span className="font-mono text-indigo-300">{capsule.verification.verdict}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Generated At:</span>
            <span className="font-mono text-slate-400">
              {new Date(capsule.generated_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleDownloadJson}
            className="w-full justify-between h-11 bg-[#141824] hover:bg-[#1c2234] border border-[#272f44] text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <FileJson size={16} className="text-indigo-400" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download Machine JSON</div>
                <div className="text-[10px] text-slate-400 font-normal">Full machine-readable ExitCapsule payload</div>
              </div>
            </div>
            <Download size={14} className="text-slate-400" />
          </Button>

          <Button
            onClick={handleDownloadMarkdown}
            className="w-full justify-between h-11 bg-[#141824] hover:bg-[#1c2234] border border-[#272f44] text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-blue-400" />
              <div className="text-left">
                <div className="text-xs font-semibold">Download Human Markdown Report</div>
                <div className="text-[10px] text-slate-400 font-normal">Formatted evidence report for PR review</div>
              </div>
            </div>
            <Download size={14} className="text-slate-400" />
          </Button>
        </div>

        <div className="pt-2 border-t border-[#1c202e] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyJson}
            className="text-xs gap-1.5 text-slate-400 hover:text-slate-200"
          >
            {copied ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
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
