import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-auto w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-1 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#0165F0]/40 [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-[#0165F0] text-white",
        secondary: "bg-[#EAF2FF] text-[#062244]",
        verified: "bg-[#E6F4EA] text-[#0B7A4B]",
        amber: "bg-[#FEF6E6] text-[#062244]",
        destructive: "bg-[#FCE8E8] text-[#D93A3F]",
        outline: "border border-[#D0D9E8] bg-white text-[#062244]",
        ghost: "hover:bg-[#EAF2FF] text-[#062244]",
        link: "text-[#0165F0] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
