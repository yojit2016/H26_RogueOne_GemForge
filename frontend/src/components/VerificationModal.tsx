import { useEffect, useState, type FormEvent } from "react"
import { ShieldAlert, Play, AlertCircle, FileCode } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { AnalysisResponse, ExitCapsule, ModelProbe } from "@/types/gemforge"

interface VerificationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (capsule: ExitCapsule, analysisId?: string) => void
  currentRepoPath: string
  sourceCommit?: string | null
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
  sourceCommit,
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
  const [preview, setPreview] = useState<AnalysisResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPreview(null)
      setConfirmExecution(false)
      setError(null)
    }
  }, [open])

  const clearPreview = () => {
    setPreview(null)
    setConfirmExecution(false)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const execute = Boolean(preview)
    if (execute && !confirmExecution) {
      setError("Review the migration plan and provide explicit execution consent.")
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
        source_commit: sourceCommit,
        dependency: dependency.trim(),
        target: target.trim() || undefined,
        analysis_id: preview?.id || currentAnalysisId || undefined,
        confirm_execution: execute,
        import_module: importModule.trim() || undefined,
        timeout,
        install_timeout: installTimeout,
        probes: parsedProbes,
      })
      if (!execute) {
        setPreview(res)
        setConfirmExecution(false)
        return
      }
      onSuccess(res.capsule, res.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification request failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review & Execute Migration Verification"
      description="Prepare and review the manifest-only candidate first. Repository code runs only after explicit approval."
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
              onChange={(e) => {
                clearPreview()
                setDependency(e.target.value)
              }}
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
              onChange={(e) => {
                clearPreview()
                setTarget(e.target.value)
              }}
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
              onChange={(e) => {
                clearPreview()
                setImportModule(e.target.value)
              }}
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
              onChange={(e) => {
                clearPreview()
                setTimeoutSeconds(Number(e.target.value))
              }}
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
              onChange={(e) => {
                clearPreview()
                setInstallTimeout(Number(e.target.value))
              }}
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
            onChange={(e) => {
              clearPreview()
              setProbesJson(e.target.value)
            }}
            disabled={busy}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {preview && (
          <div className="rounded-xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-3.5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-xs text-[var(--status-warning-text)]">
              <FileCode size={15} />
              Review migration plan — no repository code has run
            </div>
            <p className="text-[11px] text-[var(--status-warning-text)]/90 leading-relaxed">
              This is the actual manifest-only candidate diff returned by the backend. AI-suggested shell commands and source edits are never executed or applied.
            </p>
            <pre className="max-h-48 overflow-auto rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-[10px] text-[var(--foreground)]">
              {preview.capsule.verification.plan?.unified_diff || "No manifest edits were proposed for this request."}
            </pre>
            <p className="text-[11px] text-[var(--status-warning-text)]/90 leading-relaxed">
              If approved, GemForge installs the reviewed baseline/candidate requirements and runs selected tests/probes. Ephemeral Python environments are not a security sandbox; target code may access the host filesystem and network.
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
                I reviewed this plan and authorize test and compatibility execution on this machine.
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={busy || !dependency.trim() || Boolean(preview && !confirmExecution)}
            className="gap-2"
          >
            {busy ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>{preview ? "Running Verification (this may take 1-3m)…" : "Preparing Plan…"}</span>
              </>
            ) : (
              <>
                {preview ? <Play size={14} /> : <FileCode size={14} />}
                <span>{preview ? "Execute Approved Verification" : "Prepare Plan (No Execution)"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
