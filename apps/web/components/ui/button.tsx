import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm";

const variantClass: Record<ButtonVariant, string> = {
  default: "ui-button ui-button-default",
  outline: "ui-button ui-button-outline",
  ghost: "ui-button ui-button-ghost",
};

const sizeClass: Record<ButtonSize, string> = {
  default: "ui-button-md",
  sm: "ui-button-sm",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(variantClass[variant], sizeClass[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
