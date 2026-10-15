import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]",
        secondary:
          "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--foreground)]",
        conflict:
          "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)] font-semibold",
        warning:
          "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] font-semibold",
        success:
          "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)] font-semibold",
        info:
          "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
        indigo:
          "border-[#C8D9E6] bg-[#C8D9E6]/30 text-[#2F4156] dark:border-[#123499] dark:bg-[#0A2472]/60 dark:text-[#A5C2FF]",
        purple:
          "border-[#567C8D] bg-[#567C8D]/15 text-[#2F4156] dark:border-[#38BDF8]/40 dark:bg-[#0A2472]/80 dark:text-[#7DD3FC]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
