"use client";

import { cn } from "@/lib/utils";

export interface NativeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

export function NativeButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: NativeButtonProps) {
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    outline: "border border-border bg-background hover:bg-muted hover:text-foreground",
    ghost: "hover:bg-muted hover:text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
