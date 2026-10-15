import { useState, type FormEvent, type ChangeEvent } from "react"
import { Terminal, AlertCircle, Plus, Trash2, Upload, FileJson } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import type { ExitCapsule } from "@/types/gemforge"

interface ScanModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (capsule: ExitCapsule, analysisId?: string, historical?: boolean) => void
  defaultPath?: string
}

export function ScanModal({ open, onClose, onSuccess, defaultPath = "" }: ScanModalProps) {
  const [modalMode, setModalMode] = useState<"scan" | "import">("scan")
  const [path, setPath] = useState(defaultPath)
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
        mapObj[item.mod.trim()] = item.pkg.trim()
      }
    }

    try {
      const res = await api.analyze({
        path: path.trim(),
        ai: false,
        import_map: mapObj,
      })
      onSuccess(res.capsule, res.id)
      onClose()
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
      const res = await api.importAnalysis(parsed)
      onSuccess(res.capsule, res.id, true)
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
      title="Analyze Python Repository"
      description="Inspect a local or public GitHub source for dependency constraints, Python usage, and evidence-backed risks. No repository code is executed during scanning."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 text-[var(--foreground)]">
        <Tabs value={modalMode} onValueChange={(v) => setModalMode(v as typeof modalMode)}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="scan">Repository Scan</TabsTrigger>
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
                  Repository path or public GitHub HTTPS URL
                </label>
                <Input
                  id="repo-path"
                  required
                  placeholder="https://github.com/rishrek/LinkWatch or C:/path/to/project"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  disabled={busy}
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Accepts a local directory or public <code className="font-semibold text-[var(--foreground)]">https://github.com/owner/repository</code>.
                  GitHub sources are shallow-checked out to a temporary directory, pinned to the recorded commit, and removed after each request.
                  Scanning reads manifests and Python source without executing repository code.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3.5 text-xs text-[var(--muted-foreground)]">
                This first stage is an offline dependency scan. Findings are shown before any optional hosted Gemma 4 request or verification.
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
                      <span>Scan Dependencies</span>
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
                Imports the capsule through <code className="font-mono text-[var(--foreground)]">POST /analyses/import</code>. Imported evidence is identified as historical; it is not rerun or independently attested.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  )
}
