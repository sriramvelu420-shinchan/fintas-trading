import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./input.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <select id={inputId} className={cn(styles.input, error && styles.error, className)} {...props}>
        {children}
      </select>
      {error ? <span className={styles.errorText}>{error}</span> : hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
