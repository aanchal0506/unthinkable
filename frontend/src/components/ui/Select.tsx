import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}

      <select
        className={`
          w-full appearance-none rounded-sm border border-line-strong
          bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%234B5A50%22 stroke-width=%221.4%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')]
          bg-[length:16px] bg-[right_10px_center] bg-no-repeat
          px-3.5 py-2.5 pr-8 text-sm text-ink
          outline-none transition-colors
          focus:border-pine focus:ring-1 focus:ring-pine
          disabled:bg-paper disabled:text-ink-faint
          ${error ? "border-clay" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-xs text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
