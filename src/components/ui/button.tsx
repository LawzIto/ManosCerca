import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-[#0165F0]/40 active:not-aria-[haspopup]:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#5B6B7F] disabled:border-transparent aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#0165F0] text-white hover:brightness-95 shadow-sm active:scale-[0.99]",
        outline:
          "border-2 border-[#062244] bg-white text-[#062244] hover:bg-[#EAF2FF] active:scale-[0.99]",
        secondary:
          "bg-[#EAF2FF] text-[#062244] hover:bg-[#d8e7ff] active:scale-[0.99]",
        ghost:
          "hover:bg-[#EAF2FF] text-[#062244] active:scale-[0.99]",
        destructive:
          "bg-[#D93A3F] text-white hover:brightness-95 focus-visible:ring-[#D93A3F]/30",
        link: "text-[#0165F0] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 min-h-12 gap-2 px-6",
        sm: "h-9 min-h-9 gap-1.5 px-4 text-xs",
        lg: "h-14 min-h-14 gap-2.5 px-8 text-base",
        icon: "size-12 min-h-12 p-0 rounded-full",
        "icon-sm": "size-9 min-h-9 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

