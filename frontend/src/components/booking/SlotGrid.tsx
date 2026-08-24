"use client";

import { CalendarX } from "lucide-react";

import type { TimeSlot } from "@/types/appointment";

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function SlotGrid({
  slots,
  selectedSlot,
  onSelect,
}: SlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line-strong bg-surface/50 p-8 text-center">
        <CalendarX className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
        <p className="font-display text-[15px] text-ink">No available slots</p>
        <p className="text-sm text-ink-soft">
          This doctor doesn't have any openings on this date.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {slots.map((slot) => {
        const selected = selectedSlot?.startTime === slot.startTime;

        return (
          <button
            key={slot.startTime}
            type="button"
            onClick={() => onSelect(slot)}
            className={`
              rounded-sm border px-4 py-2.5 font-mono text-[13.5px] transition-colors
              ${
                selected
                  ? "border-pine bg-pine-wash text-pine-deep"
                  : "border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-paper"
              }
            `}
          >
            {formatTime(slot.startTime)}
          </button>
        );
      })}
    </div>
  );
}
