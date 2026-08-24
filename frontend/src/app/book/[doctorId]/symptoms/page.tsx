"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

import {
  bookAppointment,
  submitSymptoms,
} from "@/lib/api/appointments";

interface BookingData {
  doctorId: number;
  doctorName: string;
  specialization: string;
  date: string;
  startTime: string;
  endTime: string;
  holdId: number;
  expiresAt: string;
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

export default function SymptomsPage() {
  const params = useParams();
  const router = useRouter();

  const doctorId = Number(params.doctorId);

  const [booking, setBooking] = useState<BookingData | null>(null);

  const [symptoms, setSymptoms] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("bookingData");

    if (!stored) {
      router.replace(`/book/${doctorId}`);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as BookingData;

      setBooking(parsed);
    } catch {
      sessionStorage.removeItem("bookingData");

      router.replace(`/book/${doctorId}`);
    } finally {
      setLoading(false);
    }
  }, [doctorId, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!booking) {
      return;
    }

    if (!symptoms.trim()) {
      setError("Please describe your symptoms before continuing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * Step 1: Create the appointment using the held slot.
       */
      const appointment = await bookAppointment(
        booking.doctorId,
        booking.date,
        booking.startTime
      );

      /*
       * Step 2: Attach symptoms to the appointment. The backend generates an
       * AI pre-visit summary (urgency, chief complaint, suggested
       * questions) from this in the background.
       */
      await submitSymptoms(appointment.id, symptoms.trim());

      sessionStorage.removeItem("bookingData");

      sessionStorage.setItem(
        "appointmentConfirmation",
        JSON.stringify({
          appointmentId: appointment.id,
          doctorName: booking.doctorName,
          specialization: booking.specialization,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })
      );

      router.push(`/book/${doctorId}/success`);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "We couldn't complete your booking. The selected slot may no longer be available."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell allow={["PATIENT"]}>
        <Loading />
      </AppShell>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <AppShell allow={["PATIENT"]}>
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/book/${doctorId}`}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to appointment selection
        </Link>

        <div className="mt-6 mb-8">
          <p className="eyebrow mb-2">Almost there</p>
          <h1 className="font-display text-[26px] text-ink">
            Tell your doctor what's going on
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-soft">
            Sharing your symptoms beforehand gives your doctor useful context
            — and lets us prepare a short AI summary with suggested
            questions before your visit.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-md border border-line bg-surface p-6 sm:p-7"
          >
            <div>
              <label htmlFor="symptoms" className="text-sm font-medium text-ink">
                What symptoms are you experiencing?
              </label>

              <p className="mt-1 text-xs text-ink-faint">
                Include when they started, how they feel, and anything that
                makes them better or worse.
              </p>

              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                placeholder="For example: I've had a persistent headache since yesterday..."
                rows={8}
                className="mt-3 w-full resize-none rounded-sm border border-line-strong px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-pine focus:ring-1 focus:ring-pine"
              />
            </div>

            {error && <Alert tone="error" className="mt-5">{error}</Alert>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/book/${doctorId}`}
                className="rounded-sm border border-line-strong px-5 py-2.5 text-center text-sm font-medium text-ink hover:bg-paper"
              >
                Go back
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-sm bg-pine px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Booking appointment…" : "Confirm appointment"}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-md border border-line bg-surface p-5">
            <p className="eyebrow">Appointment</p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong bg-pine-wash font-display font-medium text-pine-deep">
                {booking.doctorName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-display text-[16px] text-ink">{booking.doctorName}</p>
                <p className="text-[13px] text-pine">{booking.specialization}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 border-t border-line pt-5">
              <div>
                <p className="eyebrow">Date</p>
                <p className="mt-1 text-sm text-ink">{formatDate(booking.date)}</p>
              </div>

              <div>
                <p className="eyebrow">Time</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-sm bg-paper p-3">
              <p className="text-xs leading-5 text-ink-soft">
                Your slot is held while you complete this form.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
