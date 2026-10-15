import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-xl",
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-150 z-10 my-auto text-[var(--foreground)]",
          maxWidth,
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
            {description && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
