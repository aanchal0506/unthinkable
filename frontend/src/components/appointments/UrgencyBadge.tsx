interface UrgencyBadgeProps {
  urgency: "LOW" | "MEDIUM" | "HIGH" | string;
}

const config: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low urgency", className: "stamp-pine" },
  MEDIUM: { label: "Medium urgency", className: "stamp-amber" },
  HIGH: { label: "High urgency", className: "stamp-clay" },
};

export default function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const c = config[urgency] || { label: urgency, className: "stamp-neutral" };

  return <span className={`stamp ${c.className}`}>{c.label}</span>;
}
