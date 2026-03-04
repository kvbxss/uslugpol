import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "ui-badge",
  {
    variants: {
      variant: {
        default: "ui-badge-info",
        info: "ui-badge-info",
        success: "ui-badge-success",
        warning: "ui-badge-warning",
        danger: "ui-badge-danger",
        neutral: "ui-badge-neutral",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
