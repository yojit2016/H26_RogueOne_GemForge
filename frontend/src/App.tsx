import { useState, useEffect, useCallback } from "react"
import { Navbar, type ActivePage } from "@/components/Navbar"
import { OverviewPage } from "@/components/pages/OverviewPage"
import { DependencyExplorerPage } from "@/components/pages/DependencyExplorerPage"
import { MigrationIntelligencePage } from "@/components/pages/MigrationIntelligencePage"
import { VerificationLaboratoryPage } from "@/components/pages/VerificationLaboratoryPage"
import { ExitCapsulePage } from "@/components/pages/ExitCapsulePage"
import { ScanModal } from "@/components/ScanModal"
import { VerificationModal } from "@/components/VerificationModal"
import { ExportModal } from "@/components/ExportModal"
import { api } from "@/lib/api"
import { LINKWATCH_DEMO_CAPSULE } from "@/lib/fixtures"
import type { ExitCapsule, HealthResponse } from "@/types/gemforge"

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>("overview")
  const [railCollapsed, setRailCollapsed] = useState(false)
  // In development, initialize with the authentic LinkWatch Phase 3 fixture for immediate rich dashboard review
  const [capsule, setCapsule] = useState<ExitCapsule | null>(LINKWATCH_DEMO_CAPSULE)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | undefined>()
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true)
  const [isHistorical, setIsHistorical] = useState<boolean>(false)
  const [migrationBusy, setMigrationBusy] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)

  // Modals
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // Preselected verification items
  const [selectedVerifyDep, setSelectedVerifyDep] = useState<string>("pydantic")
  const [selectedVerifyTarget, setSelectedVerifyTarget] = useState<string>("pydantic>=2,<3")

  // Backend connection
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null)
  const [isBackendChecking, setIsBackendChecking] = useState(true)

  // Check health on mount and periodically
  const checkBackend = useCallback(async () => {
    setIsBackendChecking(true)
    try {
      const health = await api.checkHealth()
      setBackendHealth(health)
    } catch {
      setBackendHealth(null)
    } finally {
      setIsBackendChecking(false)
    }
  }, [])

  useEffect(() => {
    checkBackend()
    const timer = setInterval(checkBackend, 15000)
    return () => clearInterval(timer)
  }, [checkBackend])

  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      setCapsule(null)
      setCurrentAnalysisId(undefined)
      setIsDemoMode(false)
      setIsHistorical(false)
    } else {
      setCapsule(LINKWATCH_DEMO_CAPSULE)
      setCurrentAnalysisId(undefined)
      setIsDemoMode(true)
      setIsHistorical(false)
    }
  }

  const handleScanSuccess = (
    newCapsule: ExitCapsule,
    analysisId?: string,
    historical = false,
  ) => {
    setCapsule(newCapsule)
    setCurrentAnalysisId(analysisId)
    setIsDemoMode(false)
    setIsHistorical(historical)
    setActivePage("overview")
  }

  const handleVerificationSuccess = (updatedCapsule: ExitCapsule, analysisId?: string) => {
    setCapsule(updatedCapsule)
    setCurrentAnalysisId(analysisId)
    setIsDemoMode(false)
    setIsHistorical(false)
    setActivePage("verification")
  }

  const handleRequestMigration = async (allowHosted: boolean) => {
    if (!capsule || !allowHosted) return
    setMigrationBusy(true)
    setMigrationError(null)
    try {
      const response = await api.analyze({
        path: capsule.repository,
        source_commit: capsule.source_commit,
        ai: true,
        allow_hosted: true,
        import_map: capsule.import_map ?? {},
      })
      setCapsule(response.capsule)
      setCurrentAnalysisId(response.id)
      setIsDemoMode(false)
      setIsHistorical(false)
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : "Gemma 4 analysis failed.")
    } finally {
      setMigrationBusy(false)
    }
  }

  const handleSendToVerification = (pkg: string, target?: string) => {
    setSelectedVerifyDep(pkg)
    if (target) setSelectedVerifyTarget(target)
    setVerificationModalOpen(true)
  }

  return (
    <div
      className={`workbench-shell font-sans ${
        railCollapsed ? "rail-collapsed" : ""
      }`}
    >
      <Navbar
        activePage={activePage}
        onSelectPage={setActivePage}
        backendHealth={backendHealth}
        isBackendChecking={isBackendChecking}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenScanModal={() => setScanModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        repositoryName={capsule?.repository}
        hasCapsule={Boolean(capsule)}
        railCollapsed={railCollapsed}
        onToggleRail={() => setRailCollapsed((collapsed) => !collapsed)}
      />

      <main className="workbench-main min-w-0 px-4 py-4 sm:px-6">
        {(isHistorical || isDemoMode) && (
          <div className="historical-notice mb-3 rounded border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-3 py-2 text-xs text-[var(--status-warning-text)]">
            {isDemoMode
              ? "Historical LinkWatch demonstration fixture. These path-redacted results are from a previous run, not a live repository scan."
              : "Historical imported capsule. Its recorded results are from a previous run; importing did not rescan, rerun inference, or repeat verification."}
          </div>
        )}
        {activePage === "overview" && (
          <OverviewPage
            capsule={capsule}
            isDemo={isDemoMode}
            onNavigate={setActivePage}
            onOpenScanModal={() => setScanModalOpen(true)}
            onOpenVerificationModal={() => setVerificationModalOpen(true)}
          />
        )}

        {activePage === "explorer" && (
          <DependencyExplorerPage
            capsule={capsule}
            onNavigate={setActivePage}
            onSelectForVerification={(pkg) => handleSendToVerification(pkg)}
          />
        )}

        {activePage === "migration" && (
          <MigrationIntelligencePage
            capsule={capsule}
            isDemo={isDemoMode}
            onNavigate={setActivePage}
            onSendToVerification={handleSendToVerification}
            onRequestAI={handleRequestMigration}
            requestBusy={migrationBusy}
            requestError={migrationError}
          />
        )}

        {activePage === "verification" && (
          <VerificationLaboratoryPage
            capsule={capsule}
            onOpenVerificationModal={() => setVerificationModalOpen(true)}
          />
        )}

        {activePage === "capsule" && (
          <ExitCapsulePage
            capsule={capsule}
            onOpenExport={() => setExportModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <ScanModal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onSuccess={handleScanSuccess}
        defaultPath={isDemoMode ? "targets/LinkWatch" : capsule?.repository || ""}
      />

      {capsule && (
        <VerificationModal
          open={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          onSuccess={handleVerificationSuccess}
          currentRepoPath={isDemoMode ? "targets/LinkWatch" : capsule.repository}
          currentAnalysisId={currentAnalysisId}
          dependencies={Array.from(new Set(capsule.dependencies.map((d) => d.package)))}
          sourceCommit={capsule.source_commit}
          defaultDependency={selectedVerifyDep}
          defaultTarget={selectedVerifyTarget}
        />
      )}

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        capsule={capsule}
        analysisId={currentAnalysisId}
      />
    </div>
  )
}
