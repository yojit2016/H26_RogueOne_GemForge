import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, maxHeight = "300px", style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{ maxHeight, ...style }}
        className={cn(
          "overflow-auto rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-xs custom-scrollbar",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ScrollArea.displayName = "ScrollArea"
