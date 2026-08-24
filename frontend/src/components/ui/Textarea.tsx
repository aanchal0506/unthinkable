import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}

      <textarea
        className={`
          w-full min-h-[100px] resize-y rounded-sm border border-line-strong
          bg-surface px-3.5 py-2.5 text-sm text-ink
          outline-none transition-colors
          placeholder:text-ink-faint
          focus:border-pine focus:ring-1 focus:ring-pine
          disabled:bg-paper disabled:text-ink-faint
          ${error ? "border-clay focus:border-clay focus:ring-clay" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
