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
  // In development, initialize with the authentic LinkWatch Phase 3 fixture for immediate rich dashboard review
  const [capsule, setCapsule] = useState<ExitCapsule | null>(LINKWATCH_DEMO_CAPSULE)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | undefined>("linkwatch-phase3")
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true)

  // Modals
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // Preselected verification items
  const [selectedVerifyDep, setSelectedVerifyDep] = useState<string>("pydantic")
  const [selectedVerifyTarget, setSelectedVerifyTarget] = useState<string>("pydantic>=2")

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
    } else {
      setCapsule(LINKWATCH_DEMO_CAPSULE)
      setCurrentAnalysisId("linkwatch-phase3")
      setIsDemoMode(true)
    }
  }

  const handleScanSuccess = (newCapsule: ExitCapsule, analysisId?: string) => {
    setCapsule(newCapsule)
    setCurrentAnalysisId(analysisId)
    setIsDemoMode(false)
    setActivePage("overview")
  }

  const handleVerificationSuccess = (updatedCapsule: ExitCapsule, analysisId?: string) => {
    setCapsule(updatedCapsule)
    setCurrentAnalysisId(analysisId)
    setIsDemoMode(false)
    setActivePage("verification")
  }

  const handleSendToVerification = (pkg: string, target?: string) => {
    setSelectedVerifyDep(pkg)
    if (target) setSelectedVerifyTarget(target)
    setVerificationModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
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
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
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
            onNavigate={setActivePage}
            onSendToVerification={handleSendToVerification}
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
        defaultPath={capsule?.repository || ""}
      />

      {capsule && (
        <VerificationModal
          open={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          onSuccess={handleVerificationSuccess}
          currentRepoPath={capsule.repository}
          currentAnalysisId={currentAnalysisId}
          dependencies={Array.from(new Set(capsule.dependencies.map((d) => d.package)))}
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
