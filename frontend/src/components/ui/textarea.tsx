import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  placeholder,
  ...props
}: React.ComponentProps<"textarea">) {
  const safeValue = props.value === null ? "" : props.value
  const ariaLabel =
    props["aria-label"] ??
    (props["aria-labelledby"] ? undefined : placeholder)
  return (
    <textarea
      data-slot="textarea"
      aria-label={ariaLabel}
      className={cn(
        "border-input placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      placeholder={placeholder}
      {...props}
      value={safeValue}
    />
  )
}

export { Textarea }
