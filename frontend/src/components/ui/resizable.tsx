import * as React from "react"
import { GripVertical } from "lucide-react"
import { Group, Panel, Separator, type GroupProps, type PanelProps, type SeparatorProps } from "react-resizable-panels"
import { cn } from "@/lib/utils"

export function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: GroupProps) {
  return (
    <Group
      orientation={orientation}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}

export function ResizablePanel({
  className,
  ...props
}: PanelProps) {
  return (
    <Panel
      className={cn("overflow-auto min-w-0 transition-all", className)}
      {...props}
    />
  )
}

export function ResizableHandle({
  withHandle = true,
  className,
  ...props
}: SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-2 items-center justify-center bg-[var(--border)] transition-colors hover:bg-[var(--primary)] active:bg-[var(--primary)] cursor-col-resize focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 select-none",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-3 items-center justify-center rounded-xs border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <GripVertical className="h-3 w-3 text-[var(--muted-foreground)]" />
        </div>
      )}
    </Separator>
  )
}
