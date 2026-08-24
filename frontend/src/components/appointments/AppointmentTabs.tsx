"use client";

interface AppointmentTabsProps {
  activeTab: "upcoming" | "past";
  onChange: (tab: "upcoming" | "past") => void;
  upcomingCount?: number;
  pastCount?: number;
}

export default function AppointmentTabs({
  activeTab,
  onChange,
  upcomingCount,
  pastCount,
}: AppointmentTabsProps) {
  const tabs: { key: "upcoming" | "past"; label: string; count?: number }[] = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "past", label: "Past", count: pastCount },
  ];

  return (
    <div className="border-b border-line">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-pine"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="font-mono text-[11px] text-ink-faint">{tab.count}</span>
            )}

            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-pine" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
