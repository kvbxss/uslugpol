/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select className={cn("ui-input ui-select", className)} ref={ref} {...props}>
      {children}
    </select>
  );
});
Select.displayName = "Select";
