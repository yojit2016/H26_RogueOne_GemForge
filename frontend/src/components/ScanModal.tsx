import { useState, type FormEvent } from "react"
import { Sparkles, Terminal, AlertCircle, Plus, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { ExitCapsule } from "@/types/gemforge"

interface ScanModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (capsule: ExitCapsule, analysisId?: string) => void
  defaultPath?: string
}

export function ScanModal({ open, onClose, onSuccess, defaultPath = "" }: ScanModalProps) {
  const [path, setPath] = useState(defaultPath)
  const [runAi, setRunAi] = useState(true)
  const [allowHosted, setAllowHosted] = useState(true)
  const [maxAiPackages, setMaxAiPackages] = useState(10)
  const [importMaps, setImportMaps] = useState<{ pkg: string; mod: string }[]>([
    { pkg: "python-dateutil", mod: "dateutil" },
  ])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addImportMap = () => {
    setImportMaps([...importMaps, { pkg: "", mod: "" }])
  }

  const removeImportMap = (index: number) => {
    setImportMaps(importMaps.filter((_, i) => i !== index))
  }

  const updateImportMap = (index: number, field: "pkg" | "mod", val: string) => {
    const updated = [...importMaps]
    updated[index][field] = val
    setImportMaps(updated)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!path.trim()) return

    setBusy(true)
    setError(null)

    const mapObj: Record<string, string> = {}
    for (const item of importMaps) {
      if (item.pkg.trim() && item.mod.trim()) {
        mapObj[item.pkg.trim()] = item.mod.trim()
      }
    }

    try {
      if (runAi) {
        const res = await api.analyze({
          path: path.trim(),
          ai: true,
          allow_hosted: allowHosted,
          max_ai_packages: maxAiPackages,
          import_map: mapObj,
        })
        onSuccess(res.capsule, res.id)
        onClose()
      } else {
        const capsule = await api.scan({
          path: path.trim(),
          import_map: mapObj,
        })
        onSuccess(capsule)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scanning failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Initiate Repository Analysis"
      description="Inspect Python dependency declarations, AST usage locations, and generate migration intelligence."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-[var(--foreground)]">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-3 text-xs text-[var(--status-error-text)]">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="repo-path" className="block text-xs font-semibold text-[var(--foreground)]">
            Local repository root path
          </label>
          <Input
            id="repo-path"
            required
            placeholder="C:/path/to/python-project"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            disabled={busy}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Path is read by the local FastAPI backend. The fork includes
            <code className="font-semibold text-[var(--foreground)]"> targets/LinkWatch</code>
            as a default live scan target. Manifests and Python source are inspected
            without executing repository code.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={runAi}
                onChange={(e) => setRunAi(e.target.checked)}
                disabled={busy}
                className="rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#567C8D] dark:text-[#7DD3FC]" />
                Gemma 4 Migration Intelligence
              </span>
            </label>
            <span className="text-[10px] uppercase font-mono text-[#567C8D] dark:text-[#7DD3FC] font-semibold tracking-wider">
              {runAi ? "Enabled" : "Metadata Only"}
            </span>
          </div>

          {runAi && (
            <div className="pl-5 space-y-2.5 border-l border-[var(--border)] text-xs">
              <label className="flex items-center gap-2 text-[var(--foreground)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowHosted}
                  onChange={(e) => setAllowHosted(e.target.checked)}
                  disabled={busy}
                  className="rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-0 cursor-pointer"
                />
                <span>Allow Hosted Gemma 4 Inference via Google GenAI Developer API</span>
              </label>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-[var(--muted-foreground)] text-xs">Max AI Packages:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxAiPackages}
                  onChange={(e) => setMaxAiPackages(Math.max(1, Math.min(50, Number(e.target.value))))}
                  disabled={busy}
                  className="w-16 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-center font-mono text-[var(--foreground)]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--foreground)]">
              Custom Import Mappings (optional)
            </span>
            <button
              type="button"
              onClick={addImportMap}
              disabled={busy}
              className="flex items-center gap-1 text-[11px] text-[#567C8D] dark:text-[#7DD3FC] hover:underline cursor-pointer font-medium"
            >
              <Plus size={12} />
              Add mapping
            </button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {importMaps.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Distribution (e.g. python-dateutil)"
                  value={item.pkg}
                  onChange={(e) => updateImportMap(index, "pkg", e.target.value)}
                  disabled={busy}
                  className="text-xs font-mono h-7"
                />
                <span className="text-[var(--muted-foreground)] text-xs">→</span>
                <Input
                  placeholder="Import (e.g. dateutil)"
                  value={item.mod}
                  onChange={(e) => updateImportMap(index, "mod", e.target.value)}
                  disabled={busy}
                  className="text-xs font-mono h-7"
                />
                <button
                  type="button"
                  onClick={() => removeImportMap(index)}
                  disabled={busy}
                  className="p-1 text-[var(--muted-foreground)] hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !path.trim()} className="gap-2">
            {busy ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Terminal size={14} />
                <span>{runAi ? "Start Full Analysis" : "Run Fast Scan"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
