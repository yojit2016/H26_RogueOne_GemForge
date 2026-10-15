import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  expanded: Set<string>
  toggle: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

export function Accordion({
  children,
  className,
  type = "single",
  defaultValue,
}: {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  defaultValue?: string | string[]
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set()
    return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
  })

  const toggle = React.useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(type === "single" ? [] : prev)
        if (prev.has(id)) {
          if (type !== "single") next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    [type],
  )

  return (
    <AccordionContext.Provider value={{ expanded, toggle }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-item={value}
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] overflow-hidden transition-colors",
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass value down
          return React.cloneElement(child, { _itemValue: value } as Record<string, unknown>)
        }
        return child
      })}
    </div>
  )
}

export function AccordionTrigger({
  children,
  className,
  _itemValue,
  ...props
}: {
  children: React.ReactNode
  className?: string
  _itemValue?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AccordionContext)
  if (!context || !_itemValue) throw new Error("AccordionTrigger must be inside AccordionItem")

  const isOpen = context.expanded.has(_itemValue)

  return (
    <button
      type="button"
      onClick={() => context.toggle(_itemValue)}
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left text-sm font-semibold transition-all hover:bg-[var(--muted)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 cursor-pointer select-none",
        className,
      )}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  )
}

export function AccordionContent({
  children,
  className,
  _itemValue,
  ...props
}: {
  children: React.ReactNode
  className?: string
  _itemValue?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AccordionContext)
  if (!context || !_itemValue) throw new Error("AccordionContent must be inside AccordionItem")

  const isOpen = context.expanded.has(_itemValue)
  if (!isOpen) return null

  return (
    <div
      className={cn("p-4 pt-0 border-t border-[var(--border-subtle)] text-xs text-[var(--foreground)] animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  )
}
