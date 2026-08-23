"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [confirmation, setConfirmation] =
    useState<Confirmation | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(
      "appointmentConfirmation"
    );

    if (!stored) {
      return;
    }

    try {
      setConfirmation(
        JSON.parse(stored) as Confirmation
      );
    } catch {
      sessionStorage.removeItem(
        "appointmentConfirmation"
      );
    }
  }, []);

  if (!confirmation) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-[#e4e7ec] bg-white p-8 text-center">
            <h1 className="text-xl font-semibold text-[#172033]">
              Appointment information unavailable
            </h1>

            <p className="mt-2 text-sm text-[#687386]">
              You can check your appointments from your
              dashboard.
            </p>

            <Link
              href="/appointments"
              className="mt-6 inline-block rounded-lg bg-[#176b87] px-5 py-2.5 text-sm font-medium text-white"
            >
              View appointments
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-[#e4e7ec] bg-white p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5ed] text-xl text-[#287a4b]">
            ✓
          </div>

          <p className="mt-6 text-sm font-medium text-[#287a4b]">
            Appointment confirmed
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[#172033]">
            Your appointment is booked
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#687386]">
            Your symptoms have also been shared with the
            doctor. You can view the appointment details
            from your appointments page.
          </p>

          <div className="mt-7 rounded-xl border border-[#e4e7ec] bg-[#fafbfc] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f2f5] font-semibold text-[#176b87]">
                {confirmation.doctorName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-[#172033]">
                  {confirmation.doctorName}
                </p>

                <p className="text-sm text-[#176b87]">
                  {confirmation.specialization}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-[#e4e7ec] pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#98a2b3]">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium text-[#344054]">
                  {formatDate(
                    confirmation.date
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#98a2b3]">
                  Time
                </p>

                <p className="mt-1 text-sm font-medium text-[#344054]">
                  {formatTime(
                    confirmation.startTime
                  )}{" "}
                  –{" "}
                  {formatTime(
                    confirmation.endTime
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/appointments"
              className="flex-1 rounded-lg bg-[#176b87] px-5 py-3 text-center text-sm font-medium text-white hover:bg-[#11556b]"
            >
              View my appointments
            </Link>

            <Link
              href="/doctors"
              className="flex-1 rounded-lg border border-[#d9dee7] px-5 py-3 text-center text-sm font-medium text-[#344054] hover:bg-[#f7f8fa]"
            >
              Find another doctor
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}