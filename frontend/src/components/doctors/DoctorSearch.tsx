"use client";

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
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]">
        ⌕
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by specialisation"
        className="w-full rounded-lg border border-[#d9dee7] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#176b87] focus:ring-2 focus:ring-[#176b87]/10"
      />
    </div>
  );
}