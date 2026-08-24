"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";

interface Confirmation {
  appointmentId: number;
  doctorName: string;
  specialization: string;
  date: string;
  startTime: string;
  endTime: string;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
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

export default function BookingSuccessPage() {
  const router = useRouter();

  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("appointmentConfirmation");

    if (!stored) {
      router.replace("/appointments");
      return;
    }

    try {
      setConfirmation(JSON.parse(stored));
    } catch {
      router.replace("/appointments");
    } finally {
      sessionStorage.removeItem("appointmentConfirmation");
    }
  }, [router]);

  if (!confirmation) {
    return null;
  }

  return (
    <AppShell allow={["PATIENT"]}>
      <div className="mx-auto max-w-lg py-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-pine/30 bg-pine-wash text-pine">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
          </div>

          <p className="eyebrow mt-5">Booking confirmed</p>

          <h1 className="mt-2 font-display text-[26px] text-ink">
            You're all set
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-ink-soft">
            We've sent a confirmation to your email, and a reminder will
            follow closer to your appointment.
          </p>
        </div>

        <div className="ticket mx-2 mt-8 shadow-card">
          <div className="ticket-tear flex flex-col items-center gap-1 px-6 py-6">
            <p className="eyebrow">Appointment with</p>
            <p className="font-display text-xl text-ink">{confirmation.doctorName}</p>
            <p className="text-sm text-pine">{confirmation.specialization}</p>

            <div className="mt-5 flex w-full items-center justify-around border-t border-dashed border-line-strong pt-5">
              <div className="text-center">
                <p className="eyebrow">Date</p>
                <p className="mt-1 text-sm text-ink">{formatDate(confirmation.date)}</p>
              </div>

              <div className="text-center">
                <p className="eyebrow">Time</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {formatTime(confirmation.startTime)} – {formatTime(confirmation.endTime)}
                </p>
              </div>
            </div>

            <p className="mt-5 font-mono text-[11px] uppercase tracking-label text-ink-faint">
              Appointment #{confirmation.appointmentId}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/appointments/${confirmation.appointmentId}`}
            className="rounded-sm bg-pine px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-pine-deep"
          >
            View appointment
          </Link>

          <Link
            href="/dashboard"
            className="rounded-sm border border-line-strong px-5 py-2.5 text-center text-sm font-medium text-ink hover:bg-paper"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
