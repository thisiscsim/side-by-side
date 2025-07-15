import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default: "bg-neutral-900 text-white hover:bg-neutral-800",
    secondary: "border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700",
    ghost: "hover:bg-neutral-100 text-neutral-700",
    outline: "border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700",
  },
  size: {
    default: "px-3 py-1.5 text-sm",
    small: "px-1.5 py-1 text-sm",
    icon: "p-2",
  },
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

// Small button with icon - specialized component for toolbar buttons
export interface SmallButtonProps extends Omit<ButtonProps, 'size'> {
  icon?: React.ReactNode
  children?: React.ReactNode
}

const SmallButton = React.forwardRef<HTMLButtonElement, SmallButtonProps>(
  ({ className, variant = "secondary", icon, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          "gap-1 px-1.5 py-1",
          className
        )}
        style={{ fontSize: '14px' }}
        {...props}
      >
        {icon}
        {children}
      </Button>
    )
  }
)

SmallButton.displayName = "SmallButton"

export { Button, SmallButton, buttonVariants } 