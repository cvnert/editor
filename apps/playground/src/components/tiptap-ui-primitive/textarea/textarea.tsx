import { cn } from "@/lib/tiptap-utils"
import "./textarea.css"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("textarea", className)}
      {...props}
    />
  )
}

export { Textarea }
