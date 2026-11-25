import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={cn(styles.input, error && styles.error, className)} {...props} />
      {error ? <span className={styles.errorText}>{error}</span> : hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
