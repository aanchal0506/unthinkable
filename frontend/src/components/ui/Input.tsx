import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#344054]">
          {label}
        </label>
      )}

      <input
        className={`
          w-full rounded-lg border border-[#d9dee7]
          bg-white px-3.5 py-2.5 text-sm
          outline-none transition
          placeholder:text-[#98a2b3]
          focus:border-[#176b87]
          focus:ring-2 focus:ring-[#176b87]/10
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}