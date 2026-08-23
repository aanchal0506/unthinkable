"use client";

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
      <div className="rounded-lg border border-[#e4e7ec] bg-white p-8 text-center">
        <p className="font-medium text-[#344054]">
          No available slots
        </p>

        <p className="mt-1 text-sm text-[#98a2b3]">
          This doctor doesn't have any available
          appointments on this date.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {slots.map((slot) => {
        const selected =
          selectedSlot?.startTime === slot.startTime;

        return (
          <button
            key={slot.startTime}
            type="button"
            onClick={() => onSelect(slot)}
            className={`
              rounded-lg border px-4 py-3 text-sm
              font-medium transition
              ${
                selected
                  ? "border-[#176b87] bg-[#edf6f8] text-[#176b87]"
                  : "border-[#e4e7ec] bg-white text-[#344054] hover:border-[#b8d5dc] hover:bg-[#f9fbfc]"
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