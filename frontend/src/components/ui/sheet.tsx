import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      {/* Drawer */}
      <div
        className={cn(
          "relative z-50 h-full w-full max-w-xl border-l border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-6 shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-200 ease-out animate-slide-left",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function SheetHeader({
  className,
  children,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div className={cn("flex items-start justify-between pb-4 border-b border-[var(--border)]", className)} {...props}>
      <div className="flex-1 pr-4">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          aria-label="Close sheet"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-[var(--foreground)] tracking-tight", className)} {...props} />
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed", className)} {...props} />
}

export function SheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-4 flex-1 overflow-y-auto space-y-4", className)} {...props} />
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2", className)} {...props} />
}
