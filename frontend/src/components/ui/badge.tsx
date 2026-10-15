import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-800 text-slate-200",
        secondary: "border-slate-800 bg-slate-900/60 text-slate-400",
        outline: "border-slate-700 text-slate-300",
        conflict: "border-red-900/60 bg-red-950/40 text-red-300",
        warning: "border-amber-900/60 bg-amber-950/40 text-amber-300",
        success: "border-emerald-900/60 bg-emerald-950/40 text-emerald-300",
        info: "border-blue-900/60 bg-blue-950/40 text-blue-300",
        indigo: "border-indigo-900/60 bg-indigo-950/40 text-indigo-300",
        purple: "border-purple-900/60 bg-purple-950/40 text-purple-300",
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
