/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "../../lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return <textarea className={cn("ui-input ui-textarea", className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";
