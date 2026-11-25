import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./button.module.css";

type Variant = "primary" | "ghost" | "outline" | "danger" | "subtle";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({ variant = "primary", size = "md", fullWidth, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(styles.button, styles[variant], styles[size], fullWidth && styles.full, className)}
      {...props}
    />
  );
}
