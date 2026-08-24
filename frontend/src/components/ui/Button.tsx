import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-pine text-white border border-pine hover:bg-pine-deep hover:border-pine-deep",
    secondary: "bg-surface text-ink border border-line-strong hover:border-pine hover:text-pine",
    danger: "bg-surface text-clay border border-clay/40 hover:bg-clay-wash",
    ghost: "bg-transparent text-ink-soft border border-transparent hover:bg-pine-wash hover:text-pine",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-sm px-4 py-2.5 text-sm font-medium
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        active:translate-y-[1px]
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
