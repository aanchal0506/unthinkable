"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";

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

  const [booking, setBooking] =
    useState<BookingData | null>(null);

  const [symptoms, setSymptoms] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(
      "bookingData"
    );

    if (!stored) {
      router.replace(`/book/${doctorId}`);
      return;
    }

    try {
      const parsed = JSON.parse(
        stored
      ) as BookingData;

      setBooking(parsed);
    } catch {
      sessionStorage.removeItem("bookingData");

      router.replace(`/book/${doctorId}`);
    } finally {
      setLoading(false);
    }
  }, [doctorId, router]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!booking) {
      return;
    }

    if (!symptoms.trim()) {
      setError(
        "Please describe your symptoms before continuing."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * Step 1:
       * Create the appointment using the held slot.
       */
      const appointment =
        await bookAppointment(
          booking.doctorId,
          booking.date,
          booking.startTime
        );

      /*
       * Step 2:
       * Attach symptoms to the appointment.
       */
      await submitSymptoms(
        appointment.id,
        symptoms.trim()
      );

      /*
       * Clear temporary booking state.
       */
      sessionStorage.removeItem(
        "bookingData"
      );

      /*
       * Store confirmation temporarily so
       * the confirmation page can display it.
       */
      sessionStorage.setItem(
        "appointmentConfirmation",
        JSON.stringify({
          appointmentId: appointment.id,
          doctorName: booking.doctorName,
          specialization:
            booking.specialization,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })
      );

      router.push(
        `/book/${doctorId}/success`
      );
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
      <AppShell>
        <Loading />
      </AppShell>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/book/${doctorId}`}
          className="text-sm text-[#687386] hover:text-[#176b87]"
        >
          ← Back to appointment selection
        </Link>

        <div className="mt-6 mb-8">
          <p className="text-sm font-medium text-[#176b87]">
            Almost there
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[#172033]">
            Tell your doctor what’s going on
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687386]">
            Sharing your symptoms beforehand gives your
            doctor some context before the appointment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-[#e4e7ec] bg-white p-6 sm:p-7"
          >
            <div>
              <label
                htmlFor="symptoms"
                className="text-sm font-medium text-[#344054]"
              >
                What symptoms are you experiencing?
              </label>

              <p className="mt-1 text-xs text-[#98a2b3]">
                Include when they started, how they feel,
                and anything that makes them better or
                worse.
              </p>

              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(event) =>
                  setSymptoms(event.target.value)
                }
                placeholder="For example: I've had a persistent headache since yesterday..."
                rows={8}
                className="mt-3 w-full resize-none rounded-lg border border-[#d9dee7] px-4 py-3 text-sm text-[#344054] outline-none transition placeholder:text-[#98a2b3] focus:border-[#176b87] focus:ring-2 focus:ring-[#176b87]/10"
              />
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/book/${doctorId}`}
                className="rounded-lg border border-[#d9dee7] px-5 py-2.5 text-center text-sm font-medium text-[#344054] hover:bg-[#f7f8fa]"
              >
                Go back
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#176b87] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#11556b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Booking appointment..."
                  : "Confirm appointment"}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-xl border border-[#e4e7ec] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#98a2b3]">
              Appointment
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f2f5] font-semibold text-[#176b87]">
                {booking.doctorName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-[#172033]">
                  {booking.doctorName}
                </p>

                <p className="text-sm text-[#176b87]">
                  {booking.specialization}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 border-t border-[#e4e7ec] pt-5">
              <div>
                <p className="text-xs text-[#98a2b3]">
                  Date
                </p>

                <p className="mt-1 text-sm text-[#344054]">
                  {formatDate(booking.date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#98a2b3]">
                  Time
                </p>

                <p className="mt-1 text-sm text-[#344054]">
                  {formatTime(
                    booking.startTime
                  )}{" "}
                  –{" "}
                  {formatTime(
                    booking.endTime
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-[#f8fafb] p-3">
              <p className="text-xs leading-5 text-[#687386]">
                Your slot is temporarily held while
                you complete this form.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}