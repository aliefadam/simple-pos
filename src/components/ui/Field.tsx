import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const baseInput =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-indigo-500";

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrapper({ label, hint, error, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, required, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <input className={cn(baseInput, error && "border-red-400", className)} {...props} />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, required, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <textarea className={cn(baseInput, "min-h-[90px] resize-none", error && "border-red-400", className)} {...props} />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, hint, error, className, required, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <select className={cn(baseInput, "appearance-none bg-no-repeat pr-8", error && "border-red-400", className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
