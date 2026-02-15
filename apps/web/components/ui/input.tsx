/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      className={cn("ui-input", className)}
      type={type}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
