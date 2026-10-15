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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme()

  const navItems: { id: ActivePage; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "explorer", label: "Dependency Explorer", icon: Search },
    { id: "migration", label: "Gemma 4 Intelligence", icon: Sparkles },
    { id: "verification", label: "Verification Lab", icon: FlaskConical },
    { id: "capsule", label: "Exit Capsule", icon: FileCheck2 },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md transition-colors duration-200">
      {/* Top utility row */}
      <div className="flex h-13 items-center justify-between px-4 sm:px-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#567C8D]/20 border border-[#567C8D]/40 text-[#2F4156] dark:bg-[#123499]/30 dark:border-[#123499]/60 dark:text-[#7DD3FC] font-bold text-xs shadow-xs">
              GF
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight text-[var(--foreground)] text-sm">
                GemForge
              </span>
              <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
                Track 1 · Hacktoberfest 2026
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />

          <Badge variant="indigo" className="hidden sm:inline-flex text-[10px] py-0 px-2 gap-1 font-mono">
            <Sparkles size={10} className="text-teal-600 dark:text-[#7DD3FC]" />
            <span>Gemma 4 IT</span>
          </Badge>

          {repositoryName && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/60 px-2.5 py-1 rounded-md border border-[var(--border)]">
              <FolderGit2 size={13} className="text-[var(--muted-foreground)]" />
              <span className="truncate max-w-[260px] font-mono text-[11px] text-[var(--foreground)]">
                {repositoryName}
              </span>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Backend Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border border-[var(--border)] bg-[var(--card)]"
            title={
              backendHealth
                ? `Connected to local FastAPI backend (Phase ${backendHealth.phase})`
                : "Backend offline at 127.0.0.1:8000"
            }
          >
            <Server size={12} className="text-[var(--muted-foreground)]" />
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                backendHealth
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  : isBackendChecking
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-400 dark:bg-slate-600"
              }`}
            />
            <span className="text-[var(--muted-foreground)] hidden sm:inline">
              {backendHealth
                ? `FastAPI: Phase ${backendHealth.phase}`
                : isBackendChecking
                ? "Connecting…"
                : "Backend Offline"}
            </span>
          </div>

          {/* Demo toggle */}
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              isDemoMode
                ? "bg-[#C8D9E6]/40 border-[#567C8D]/40 text-[#2F4156] dark:bg-[#0A2472]/60 dark:border-[#123499] dark:text-[#D6E2FF]"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
            title={
              isDemoMode
                ? "Displaying authentic LinkWatch Phase 3 regression fixture. Click to toggle live mode."
                : "Load authentic LinkWatch Phase 3 capsule demo fixture"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isDemoMode ? "bg-[#567C8D] dark:bg-[#38BDF8]" : "bg-slate-400 dark:bg-slate-600"
              }`}
            />
            <span>{isDemoMode ? "Demo Fixture Active" : "Load LinkWatch Demo"}</span>
          </button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer shadow-xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={14} className="text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon size={14} className="text-[#2F4156] transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Scan Action */}
          <Button
            size="sm"
            onClick={onOpenScanModal}
            className="text-xs h-7 gap-1.5"
          >
            <Terminal size={12} />
            <span className="hidden sm:inline">Scan / Analyze</span>
            <span className="sm:hidden">Scan</span>
          </Button>

          {/* Export Action */}
          {hasCapsule && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenExport}
              className="text-xs h-7 gap-1.5"
              title="Download Exit Capsule (JSON or Markdown)"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-1 px-4 sm:px-6 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPage(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-xs border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-transparent"
              }`}
            >
              <Icon
                size={14}
                className={
                  isActive
                    ? "text-[#567C8D] dark:text-[#7DD3FC]"
                    : "text-[var(--muted-foreground)]"
                }
              />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
