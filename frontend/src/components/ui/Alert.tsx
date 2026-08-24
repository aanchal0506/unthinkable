interface AlertProps {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

const toneStyles = {
  error: "border-clay/40 bg-clay-wash text-clay",
  success: "border-pine/40 bg-pine-wash text-pine-deep",
  info: "border-slate/40 bg-slate-wash text-slate",
};

export default function Alert({ tone = "info", children, className = "" }: AlertProps) {
  return (
    <div className={`rounded-sm border px-4 py-3 text-sm leading-5 ${toneStyles[tone]} ${className}`}>
      {children}
    </div>
  );
}
