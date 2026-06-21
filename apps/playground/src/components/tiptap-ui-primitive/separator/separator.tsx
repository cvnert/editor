import { cn } from "@/lib/tiptap-utils"

export type Orientation = "horizontal" | "vertical"

export function Separator({
  decorative,
  orientation = "vertical",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: Orientation
  decorative?: boolean
}) {
  const ariaOrientation = orientation === "vertical" ? orientation : undefined
  const semanticProps = decorative
    ? { role: "none" }
    : { "aria-orientation": ariaOrientation, role: "separator" }

  return (
    <div
      className={cn(
        "tiptap-separator shrink-0 bg-[var(--tt-link-border-color)] [--tt-link-border-color:var(--tt-gray-light-a-200)] [.dark_&]:[--tt-link-border-color:var(--tt-gray-dark-a-200)]",
        orientation === "horizontal" ? "my-2 h-px w-full" : "h-6 w-px",
        className
      )}
      data-orientation={orientation}
      {...semanticProps}
      {...props}
    />
  )
}
