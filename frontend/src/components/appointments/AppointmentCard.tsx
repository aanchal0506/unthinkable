"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import AppointmentStatus from "./AppointmentStatus";

interface AppointmentCardProps {
  appointment: any;
  onCancel?: (appointmentId: number) => void;
  cancelling?: boolean;
  /** "doctor" shows the patient's name instead of the doctor's — used on doctor-portal lists */
  viewerRole?: "patient" | "doctor";
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
};

const formatWeekday = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
  }).format(new Date(date));
};

const formatTime = (time: string) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function AppointmentCard({
  appointment,
  onCancel,
  cancelling = false,
  viewerRole = "patient",
}: AppointmentCardProps) {
  const counterpartName =
    viewerRole === "patient"
      ? appointment.doctor?.user?.name || appointment.doctor?.name || "Doctor"
      : appointment.patient?.user?.name || "Patient";

  const counterpartLabel = viewerRole === "patient" ? "Doctor" : "Patient";

  const specialization = appointment.doctor?.specialization;

  const appointmentDate = appointment.date || appointment.appointmentDate;

  const detailHref =
    viewerRole === "patient"
      ? `/appointments/${appointment.id}`
      : `/doctor/appointments/${appointment.id}`;

  const isBooked = appointment.status === "BOOKED";

  return (
    <div className="ticket mx-2 flex flex-col shadow-card transition-shadow hover:shadow-raised sm:flex-row sm:items-stretch">
      <div className="flex shrink-0 flex-row items-center gap-2 border-b border-line px-5 py-3 sm:w-20 sm:flex-col sm:justify-center sm:gap-0.5 sm:border-b-0 sm:py-4">
        <span className="font-display text-xl leading-none text-ink sm:text-2xl">
          {appointmentDate ? formatDate(appointmentDate) : "—"}
        </span>
        <span className="eyebrow">
          {appointmentDate ? formatWeekday(appointmentDate) : ""}
        </span>
      </div>

      <div className="ticket-tear flex flex-1 flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow mb-1">{counterpartLabel}</p>
          <p className="truncate font-display text-[17px] text-ink">{counterpartName}</p>
          {specialization && (
            <p className="mt-0.5 text-[13px] text-pine">{specialization}</p>
          )}
          <p className="mt-1.5 font-mono text-[12.5px] text-ink-soft">
            {formatTime(appointment.startTime)}
            {appointment.endTime && ` – ${formatTime(appointment.endTime)}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <AppointmentStatus status={appointment.status} />

          <Link
            href={detailHref}
            className="flex items-center gap-1 rounded-sm border border-line-strong px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-pine hover:text-pine"
          >
            Details
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          {isBooked && onCancel && (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel(appointment.id)}
              className="rounded-sm border border-clay/30 px-3 py-1.5 text-[13px] font-medium text-clay hover:bg-clay-wash disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
