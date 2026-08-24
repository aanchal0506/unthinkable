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
    <div className="rounded-md border border-line bg-surface p-5">
      <p className="eyebrow">Appointment summary</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong bg-pine-wash font-display font-medium text-pine-deep">
          {doctor.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-display text-[16px] text-ink">{doctor.name}</p>
          <p className="text-[13px] text-pine">{doctor.specialization}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-line pt-5">
        <div>
          <p className="eyebrow">Date</p>
          <p className="mt-1 text-sm text-ink">{formatDate(date)}</p>
        </div>

        <div>
          <p className="eyebrow">Time</p>
          <p className="mt-1 font-mono text-sm text-ink">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-sm bg-paper p-3">
        <p className="text-xs leading-5 text-ink-soft">
          This slot is held for you while you complete the booking. If you
          don't finish within a few minutes, it may be released.
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="mt-5 w-full rounded-sm bg-pine px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Securing appointment…" : "Continue"}
      </button>
    </div>
  );
}
