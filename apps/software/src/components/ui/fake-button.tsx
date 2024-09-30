import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline:
          "border border-input bg-background",
        secondary:
          "bg-secondary text-secondary-foreground",
        ghost: "",
        link: "text-primary underline-offset-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fakeDisable: {
        "true": "cursor-default opacity-50 pointer-events-auto",
        "false": "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fakeDisable: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLDivElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(buttonVariants({ variant, size, className, fakeDisable: disabled }))}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button as FakeButton, buttonVariants }
