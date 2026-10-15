import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 border border-indigo-500/40",
        secondary:
          "bg-[#161922] text-slate-200 hover:bg-[#1f2432] active:bg-[#131620] border border-[#2b3042]",
        outline:
          "border border-slate-700/80 bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-white",
        ghost:
          "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white",
        danger:
          "bg-rose-950/40 text-rose-300 border border-rose-900/60 hover:bg-rose-900/60 active:bg-rose-950",
        subtle:
          "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/50",
      },
      size: {
        default: "h-9 px-3.5 py-1.5",
        sm: "h-7 px-2.5 text-xs rounded-md",
        lg: "h-10 px-5 text-base rounded-md",
        icon: "h-8 w-8 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
