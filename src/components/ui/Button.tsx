import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger:
      "rounded-lg bg-status-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90",
  };

  return <button className={cn(variants[variant], className)} {...props} />;
}
