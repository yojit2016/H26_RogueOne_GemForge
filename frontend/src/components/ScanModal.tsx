import { useState, type FormEvent, type ChangeEvent } from "react"
import { Sparkles, Terminal, AlertCircle, Plus, Trash2, Upload, FileJson } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import type { ExitCapsule } from "@/types/gemforge"

interface ScanModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (capsule: ExitCapsule, analysisId?: string) => void
  defaultPath?: string
}

export function ScanModal({ open, onClose, onSuccess, defaultPath = "" }: ScanModalProps) {
  const [modalMode, setModalMode] = useState<"scan" | "import">("scan")
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

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBusy(true)
    setError(null)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as ExitCapsule

      if (!parsed.dependencies || !parsed.verification) {
        throw new Error("Invalid Exit Capsule format. Missing required fields.")
      }

      // Try importing to backend via POST /analyses/import
      try {
        const res = await api.importAnalysis(parsed)
        onSuccess(res.capsule, res.id)
      } catch (backendErr) {
        // If backend offline or unreachable, load directly client-side
        console.warn("Backend import endpoint unavailable, loading capsule locally:", backendErr)
        onSuccess(parsed, "imported-" + Date.now())
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse capsule file")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Repository Analysis & Capsule Import"
      description="Scan local repository declarations or import a pre-computed Exit Capsule."
    >
      <div className="space-y-4 text-[var(--foreground)]">
        <Tabs value={modalMode} onValueChange={(v) => setModalMode(v as typeof modalMode)}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="scan">Local Repository Scan</TabsTrigger>
            <TabsTrigger value="import">Import Capsule JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                  Path is read by the local FastAPI backend. In demo mode this
                  defaults to <code className="font-semibold text-[var(--foreground)]">targets/LinkWatch</code>.
                  Manifests and Python source are inspected without executing repository code.
                </p>
              </div>

              {/* Analysis Mode Toggles */}
              <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[var(--foreground)] select-none">
                  <input
                    type="checkbox"
                    checked={runAi}
                    onChange={(e) => setRunAi(e.target.checked)}
                    disabled={busy}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-1"
                  />
                  <span>Enable Gemma 4 Migration Intelligence</span>
                </label>

                {runAi && (
                  <div className="pl-6 space-y-2 pt-1 border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowHosted}
                        onChange={(e) => setAllowHosted(e.target.checked)}
                        disabled={busy}
                        className="rounded border-[var(--border)]"
                      />
                      <span>Allow hosted Gemma 4 inference (requires GEMINI_API_KEY)</span>
                    </label>

                    <div className="flex items-center justify-between pt-1">
                      <span>Max AI package analyses:</span>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={maxAiPackages}
                        onChange={(e) => setMaxAiPackages(Number(e.target.value))}
                        disabled={busy}
                        className="w-16 h-7 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Distribution Import Mappings */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--foreground)]">Custom AST Distribution Mappings</span>
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
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
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
          </TabsContent>

          <TabsContent value="import">
            <div className="space-y-4 pt-2 text-xs">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-3 text-[var(--status-error-text)]">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center space-y-3 bg-[var(--muted)]/20 hover:border-[var(--primary)] transition-colors">
                <FileJson className="mx-auto h-8 w-8 text-[var(--accent-teal)] opacity-80" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-[var(--foreground)]">
                    Upload Dependency Exit Capsule
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] max-w-sm mx-auto">
                    Select a previously exported <code className="font-mono">.json</code> capsule to import verified historical evidence without re-executing virtualenvs.
                  </p>
                </div>

                <label className="inline-flex">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    disabled={busy}
                    className="sr-only"
                  />
                  <Button variant="outline" size="sm" asChild disabled={busy} className="cursor-pointer">
                    <span className="gap-2">
                      <Upload size={14} />
                      <span>Select JSON Capsule</span>
                    </span>
                  </Button>
                </label>
              </div>

              <div className="text-[11px] text-[var(--muted-foreground)] text-center leading-relaxed">
                Connects to <code className="font-mono text-[var(--foreground)]">POST /analyses/import</code> on backend with fallback to offline evaluation.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  )
}
