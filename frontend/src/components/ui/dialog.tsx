import * as React from "react"
import { Modal } from "./modal"

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  if (!open) return null
  return <>{children}</>
}

export { Modal as DialogContent }
