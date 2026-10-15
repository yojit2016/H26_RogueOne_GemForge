import { useState, type FormEvent } from "react"
import { ShieldAlert, Play, AlertCircle, FileCode } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { ExitCapsule, ModelProbe } from "@/types/gemforge"

interface VerificationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (capsule: ExitCapsule, analysisId?: string) => void
  currentRepoPath: string
  currentAnalysisId?: string
  dependencies: string[]
  defaultDependency?: string
  defaultTarget?: string
}

export function VerificationModal({
  open,
  onClose,
  onSuccess,
  currentRepoPath,
  currentAnalysisId,
  dependencies,
  defaultDependency = "",
  defaultTarget = "",
}: VerificationModalProps) {
  const [dependency, setDependency] = useState(defaultDependency || dependencies[0] || "")
  const [target, setTarget] = useState(defaultTarget)
  const [importModule, setImportModule] = useState("")
  const [timeout, setTimeoutSeconds] = useState(60)
  const [installTimeout, setInstallTimeout] = useState(180)
  const [probesJson, setProbesJson] = useState("")
  const [confirmExecution, setConfirmExecution] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!confirmExecution) {
      setError("Explicit consent is required to execute repository code in isolated virtual environments.")
      return
    }

    setBusy(true)
    setError(null)

    let parsedProbes: ModelProbe[] = []
    if (probesJson.trim()) {
      try {
        parsedProbes = JSON.parse(probesJson)
        if (!Array.isArray(parsedProbes)) {
          throw new Error("Probes must be a JSON array of ModelProbe objects")
        }
      } catch (err) {
        setError(`Invalid probes JSON: ${err instanceof Error ? err.message : String(err)}`)
        setBusy(false)
        return
      }
    }

    try {
      const res = await api.verify({
        path: currentRepoPath,
        dependency: dependency.trim(),
        target: target.trim() || undefined,
        analysis_id: currentAnalysisId || undefined,
        confirm_execution: true,
        import_module: importModule.trim() || undefined,
        timeout,
        install_timeout: installTimeout,
        probes: parsedProbes,
      })
      onSuccess(res.capsule, res.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification execution failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Execute Isolated Verification"
      description="Compare baseline vs candidate environments in ephemeral virtual environments. Consent required."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-[var(--foreground)]">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-3 text-xs text-[var(--status-error-text)]">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="verify-dep" className="block text-xs font-semibold text-[var(--foreground)]">
              Dependency to migrate
            </label>
            <Input
              id="verify-dep"
              required
              placeholder="e.g. pydantic"
              value={dependency}
              onChange={(e) => setDependency(e.target.value)}
              disabled={busy}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="verify-target" className="block text-xs font-semibold text-[var(--foreground)]">
              Candidate target constraint
            </label>
            <Input
              id="verify-target"
              placeholder="e.g. pydantic>=2"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={busy}
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="import-mod" className="block text-xs font-semibold text-[var(--foreground)]">
              Import probe module
            </label>
            <Input
              id="import-mod"
              placeholder="e.g. linkwatch.config"
              value={importModule}
              onChange={(e) => setImportModule(e.target.value)}
              disabled={busy}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="timeout-sec" className="block text-xs font-semibold text-[var(--foreground)]">
              Command timeout (s)
            </label>
            <Input
              id="timeout-sec"
              type="number"
              min={5}
              max={300}
              value={timeout}
              onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
              disabled={busy}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inst-timeout-sec" className="block text-xs font-semibold text-[var(--foreground)]">
              Pip install timeout (s)
            </label>
            <Input
              id="inst-timeout-sec"
              type="number"
              min={30}
              max={600}
              value={installTimeout}
              onChange={(e) => setInstallTimeout(Number(e.target.value))}
              disabled={busy}
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="probes-json" className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
              <FileCode size={13} className="text-[var(--muted-foreground)]" />
              Custom Model Probes JSON (optional)
            </label>
            <span className="text-[10px] text-[var(--muted-foreground)] font-mono">ModelProbe[]</span>
          </div>
          <textarea
            id="probes-json"
            rows={3}
            placeholder='[{"name": "site_strips_whitespace", "module": "linkwatch.config", "class_name": "Site", "kwargs": {"name": " alpha ", "url": "https://example.test"}, "expected_attributes": {"name": "alpha"}}]'
            value={probesJson}
            onChange={(e) => setProbesJson(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Security & Explicit Consent Banner */}
        <div className="rounded-xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-xs text-[var(--status-warning-text)]">
            <ShieldAlert size={15} />
            Security & Execution Consent Gate
          </div>
          <p className="text-[11px] text-[var(--status-warning-text)]/90 leading-relaxed font-sans">
            Running verification will build two isolated ephemeral virtual environments (baseline and candidate), invoke pip install, and execute test commands / probes against the target codebase.
          </p>
          <label className="flex items-start gap-2 pt-1 text-xs text-[var(--foreground)] cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={confirmExecution}
              onChange={(e) => setConfirmExecution(e.target.checked)}
              disabled={busy}
              className="mt-0.5 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)] focus:ring-0 cursor-pointer"
            />
            <span className="font-semibold text-[var(--status-warning-text)]">
              I authorize GemForge to execute repository tests and compatibility checks in isolated environments on this machine.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={busy || !confirmExecution || !dependency.trim()}
            className="gap-2"
          >
            {busy ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Running Verification (this may take 1-3m)…</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Execute Verification</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
