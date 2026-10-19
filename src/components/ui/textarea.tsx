import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-2xl border-[1.5px] border-[#D0D9E8] bg-white px-4 py-3 text-base text-[#062244] placeholder:text-[#5B6B7F] transition-all outline-none focus-visible:border-2 focus-visible:border-[#0165F0] focus-visible:ring-2 focus-visible:ring-[#0165F0]/20 disabled:cursor-not-allowed disabled:bg-[#F3F6FA] disabled:text-[#5B6B7F] disabled:opacity-70 aria-invalid:border-2 aria-invalid:border-[#D93A3F] aria-invalid:ring-2 aria-invalid:ring-[#D93A3F]/20 md:text-sm dark:bg-[#062244] dark:border-[#1D4577] dark:text-white dark:placeholder:text-[#8EA0B8]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
