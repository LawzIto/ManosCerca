import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 min-h-12 w-full min-w-0 rounded-2xl border-[1.5px] border-[#D0D9E8] bg-white px-4 py-2 text-base text-[#062244] placeholder:text-[#5B6B7F] transition-all outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#062244] focus-visible:border-2 focus-visible:border-[#0165F0] focus-visible:ring-2 focus-visible:ring-[#0165F0]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F6FA] disabled:text-[#5B6B7F] disabled:opacity-70 aria-invalid:border-2 aria-invalid:border-[#D93A3F] aria-invalid:ring-2 aria-invalid:ring-[#D93A3F]/20 md:text-sm dark:bg-[#062244] dark:border-[#1D4577] dark:text-white dark:placeholder:text-[#8EA0B8]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
