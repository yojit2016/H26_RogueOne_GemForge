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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  const navItems: { id: ActivePage; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "explorer", label: "Dependency Explorer", icon: Search },
    { id: "migration", label: "Gemma 4 Intelligence", icon: Sparkles },
    { id: "verification", label: "Verification Lab", icon: FlaskConical },
    { id: "capsule", label: "Exit Capsule", icon: FileCheck2 },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1b1f2e] bg-[#090a0f]/90 backdrop-blur-md">
      {/* Top utility row */}
      <div className="flex h-13 items-center justify-between px-4 sm:px-6 border-b border-[#141724]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-xs shadow-inner">
              GF
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight text-slate-100 text-sm">
                GemForge
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Track 1 · Hacktoberfest 2026
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-[#202538] hidden sm:block" />

          <Badge variant="indigo" className="hidden sm:inline-flex text-[10px] py-0 px-2 gap-1">
            <Sparkles size={10} className="text-indigo-400" />
            <span>Gemma 4 IT</span>
          </Badge>

          {repositoryName && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-[#10131d] px-2.5 py-1 rounded-md border border-[#1e2333]">
              <FolderGit2 size={13} className="text-slate-500" />
              <span className="truncate max-w-[260px] font-mono text-[11px] text-slate-300">
                {repositoryName}
              </span>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Backend Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border border-[#1e2333] bg-[#0c0e15]"
            title={
              backendHealth
                ? `Connected to local FastAPI backend (Phase ${backendHealth.phase})`
                : "Backend offline at 127.0.0.1:8000"
            }
          >
            <Server size={12} className="text-slate-500" />
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                backendHealth
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : isBackendChecking
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-slate-400 hidden sm:inline">
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
                ? "bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/40"
                : "bg-[#111420] border-[#22273a] text-slate-400 hover:text-slate-200 hover:bg-[#161a29]"
            }`}
            title={
              isDemoMode
                ? "Displaying authentic LinkWatch Phase 3 regression fixture. Click to toggle live mode."
                : "Load authentic LinkWatch Phase 3 capsule demo fixture"
            }
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-purple-400" : "bg-slate-600"}`} />
            <span>{isDemoMode ? "Demo Fixture Active" : "Load LinkWatch Demo"}</span>
          </button>

          {/* Scan Action */}
          <Button
            size="sm"
            onClick={onOpenScanModal}
            className="text-xs h-7 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
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
              className="text-xs h-7 gap-1.5 border-[#282d40] text-slate-300 hover:text-white"
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
                  ? "bg-[#181c2b] text-indigo-300 shadow-xs border border-[#2b3147]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#121522] border border-transparent"
              }`}
            >
              <Icon
                size={14}
                className={isActive ? "text-indigo-400" : "text-slate-500"}
              />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
