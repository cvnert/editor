import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/tiptap-utils"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

const buttonGroupVariants = cva(
  "tiptap-button-group flex w-fit items-stretch has-[[data-slot=tiptap-button-group]]:gap-0.5 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>input]:flex-1 [&>[data-slot=select-trigger]:not([class*=w-])]:w-fit",
  {
  variants: {
    orientation: {
      horizontal:
        "tiptap-button-group-horizontal [&>[data-slot]]:rounded-r-none [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0 [&>[data-slot]:not(:has(~[data-slot]))]:!rounded-r-[var(--tt-radius-lg)] [&:has(select[aria-hidden=true]:last-child)>[data-slot=select-trigger]:last-of-type]:rounded-r-[var(--tt-radius-lg)]",
      vertical:
        "tiptap-button-group-vertical flex-col [&>[data-slot]]:rounded-b-none [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0 [&>[data-slot]:not(:has(~[data-slot]))]:!rounded-b-[var(--tt-radius-lg)]",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
}
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="tiptap-button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      { className: cn("tiptap-button-group-text", className) },
      props
    ),
    render,
    state: { slot: "tiptap-button-group-text" },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="tiptap-button-group-separator"
      orientation={orientation}
      className={cn(
        "tiptap-button-group-separator relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
