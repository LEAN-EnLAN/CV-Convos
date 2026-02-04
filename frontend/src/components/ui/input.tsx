import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  placeholder,
  ...props
}: React.ComponentProps<"input">) {
  const safeValue = props.value === null ? "" : props.value
  const ariaLabel =
    props["aria-label"] ??
    (props["aria-labelledby"] ? undefined : placeholder)
  return (
    <input
      type={type}
      data-slot="input"
      aria-label={ariaLabel}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/80 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-10 w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      placeholder={placeholder}
      {...props}
      value={safeValue}
    />
  )
}

export { Input }
