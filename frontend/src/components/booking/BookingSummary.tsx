import type { Doctor } from "@/types/doctor";
import type { TimeSlot } from "@/types/appointment";

interface BookingSummaryProps {
  doctor: Doctor;
  date: string;
  slot: TimeSlot;
  loading?: boolean;
  onConfirm: () => void;
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
};

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

export default function BookingSummary({
  doctor,
  date,
  slot,
  loading = false,
  onConfirm,
}: BookingSummaryProps) {
  return (
    <div className="rounded-xl border border-[#e4e7ec] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#98a2b3]">
        Appointment summary
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f2f5] font-semibold text-[#176b87]">
          {doctor.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-semibold text-[#172033]">
            {doctor.name}
          </p>

          <p className="text-sm text-[#176b87]">
            {doctor.specialization}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-[#e4e7ec] pt-5">
        <div>
          <p className="text-xs text-[#98a2b3]">
            Date
          </p>

          <p className="mt-1 text-sm text-[#344054]">
            {formatDate(date)}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#98a2b3]">
            Time
          </p>

          <p className="mt-1 text-sm text-[#344054]">
            {formatTime(slot.startTime)} –{" "}
            {formatTime(slot.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-[#f8fafb] p-3">
        <p className="text-xs leading-5 text-[#687386]">
          Your selected slot will be temporarily held while
          you complete the booking.
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-[#176b87] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#11556b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Securing appointment..." : "Continue"}
      </button>
    </div>
  );
}