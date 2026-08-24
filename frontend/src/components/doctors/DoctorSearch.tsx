"use client";

import { Search } from "lucide-react";

interface DoctorSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DoctorSearch({
  value,
  onChange,
}: DoctorSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by specialisation"
        className="w-full rounded-sm border border-line-strong bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-pine focus:ring-1 focus:ring-pine"
      />
    </div>
  );
}
