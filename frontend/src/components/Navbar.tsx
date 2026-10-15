import {
  Layers,
  Search,
  Sparkles,
  FlaskConical,
  FileCheck2,
  Terminal,
  Download,
  Server,
  FolderGit2,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme"
import type { HealthResponse } from "@/types/gemforge"

export type ActivePage = "overview" | "explorer" | "migration" | "verification" | "capsule"

interface NavbarProps {
  activePage: ActivePage
  onSelectPage: (page: ActivePage) => void
  backendHealth: HealthResponse | null
  isBackendChecking: boolean
  isDemoMode: boolean
  onToggleDemoMode: () => void
  onOpenScanModal: () => void
  onOpenExport: () => void
  repositoryName?: string
  hasCapsule: boolean
  railCollapsed: boolean
  onToggleRail: () => void
}

export function Navbar({
  activePage,
  onSelectPage,
  backendHealth,
  isBackendChecking,
  isDemoMode,
  onToggleDemoMode,
  onOpenScanModal,
  onOpenExport,
  repositoryName,
  hasCapsule,
  railCollapsed,
  onToggleRail,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme()

  const navItems: { id: ActivePage; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "explorer", label: "Dependency Explorer", icon: Search },
    { id: "migration", label: "Gemma 4 Intelligence", icon: Sparkles },
    { id: "verification", label: "Verification Lab", icon: FlaskConical },
    { id: "capsule", label: "Exit Capsule", icon: FileCheck2 },
  ]
  const pageLabels: Record<ActivePage, string> = {
    overview: "Overview",
    explorer: "Dependency Explorer",
    migration: "Gemma 4 Intelligence",
    verification: "Verification Laboratory",
    capsule: "Dependency Exit Capsule",
  }
  const repositoryLabel = repositoryName
    ? repositoryName.split(/[\\/]/).filter(Boolean).slice(-2).join("/")
    : "No repository selected"

  return (
    <>
      <header className="workbench-utility">
        <div className="utility-brand">
          <span className="brand-mark" aria-hidden="true">
            <Layers size={15} />
          </span>
          <span className="brand-name">GemForge</span>
          <span className="brand-version">Track 1</span>
        </div>

        <div className="utility-context" title={repositoryName || undefined}>
          <FolderGit2 size={14} aria-hidden="true" />
          <span className="utility-repository">{repositoryLabel}</span>
        </div>

        <div className="utility-controls">
          <div
            className="utility-status"
            title={
              backendHealth
                ? `Connected to local FastAPI backend (Phase ${backendHealth.phase})`
                : "Backend offline at 127.0.0.1:8000"
            }
            aria-label={
              backendHealth
                ? `FastAPI backend connected, phase ${backendHealth.phase}`
                : isBackendChecking
                  ? "Checking FastAPI backend connection"
                  : "FastAPI backend offline"
            }
            aria-live="polite"
          >
            <span
              className={`status-bead ${
                backendHealth
                  ? "status-bead-online"
                  : isBackendChecking
                    ? "status-bead-checking"
                    : "status-bead-offline"
              }`}
            />
            <Server size={13} aria-hidden="true" />
            <span className="utility-status-label">
              {backendHealth ? "API connected" : isBackendChecking ? "Connecting" : "API offline"}
            </span>
          </div>

          <div className="gemma-indicator" title="Hosted Gemma 4 analysis is opt-in">
            <Sparkles size={14} aria-hidden="true" />
            <span>Gemma 4</span>
            <span className="gemma-mode">on demand</span>
          </div>

          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`evidence-toggle ${isDemoMode ? "evidence-toggle-historical" : ""}`}
            aria-label={
              isDemoMode
                ? "Historical LinkWatch demo is active. Click to leave demo mode."
                : "Load historical LinkWatch demo"
            }
            title={
              isDemoMode
                ? "Displaying the historical LinkWatch demonstration fixture. Click to leave demo mode."
                : "Load the historical LinkWatch demonstration fixture"
            }
          >
            <span className="status-bead" aria-hidden="true" />
            <span>{isDemoMode ? "Historical demo" : "Load demo"}</span>
          </button>

          <Button
            size="sm"
            onClick={onOpenScanModal}
            aria-label="Analyze repository"
            className="utility-scan-button h-8 gap-2 rounded"
          >
            <Terminal size={13} aria-hidden="true" />
            <span>Analyze repository</span>
          </Button>

          {hasCapsule && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenExport}
              aria-label="Export capsule"
              className="utility-export-button h-8 gap-1.5 rounded"
              title="Download Exit Capsule (JSON or Markdown)"
            >
              <Download size={13} aria-hidden="true" />
              <span>Export</span>
            </Button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="utility-icon-button"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="workbench-context">
        <span className="context-route">
          <span className="context-bead" aria-hidden="true" />
          <span className="context-prefix">Workspace</span>
          <span className="context-divider" aria-hidden="true">/</span>
          <span>{pageLabels[activePage]}</span>
        </span>
        <span className={`context-evidence ${isDemoMode ? "context-evidence-historical" : ""}`}>
          {isDemoMode ? "Previous run · historical evidence" : "Current workspace"}
        </span>
      </div>

      <aside className="workbench-rail" aria-label="GemForge workspace navigation">
        <div className="rail-project">
          <span className="rail-project-icon" aria-hidden="true">
            <FolderGit2 size={15} />
          </span>
          <span className="rail-project-text">
            <span className="rail-project-name">{repositoryLabel}</span>
            <span className="rail-project-caption">Active workspace</span>
          </span>
          <button
            type="button"
            className="rail-collapse-button"
            onClick={onToggleRail}
            aria-label={railCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!railCollapsed}
            title={railCollapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {railCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        <nav className="rail-navigation" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPage(item.id)}
                className={`rail-nav-item ${isActive ? "rail-nav-item-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={17} aria-hidden="true" />
                <span className="rail-nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="rail-footer">
          <span className={`status-bead ${backendHealth ? "status-bead-online" : "status-bead-offline"}`} />
          <span className="rail-footer-label">
            {backendHealth ? "Backend connected" : "Backend unavailable"}
          </span>
        </div>
      </aside>
    </>
  )
}
