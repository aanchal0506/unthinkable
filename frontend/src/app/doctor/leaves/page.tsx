"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, CalendarOff, ArrowRight, Sunrise } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import AppointmentCard from "@/components/appointments/AppointmentCard";

import { getMyDoctorAppointments } from "@/lib/api/appointments";
import { getStoredUser } from "@/lib/auth";

const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DoctorDashboardPage() {
  const user = getStoredUser();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyDoctorAppointments();

        setAppointments(data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Unable to load your appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const today = todayISO();

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          String(appointment.date).slice(0, 10) === today &&
          appointment.status === "BOOKED"
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, today]);

  const upcomingCount = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "BOOKED" && String(a.date).slice(0, 10) >= today
      ).length,
    [appointments, today]
  );

  return (
    <AppShell allow={["DOCTOR"]}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow mb-2">Doctor portal</p>
          <h1 className="font-display text-[28px] text-ink">
            Welcome back, Dr. {user?.name?.split(" ")[0] || ""}
          </h1>
          <p className="mt-1.5 text-[14.5px] text-ink-soft">
            Here's a look at your schedule.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-surface p-5">
            <p className="eyebrow">Today</p>
            <p className="mt-2 font-display text-3xl text-ink">
              {todaysAppointments.length}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">appointments scheduled</p>
          </div>

          <div className="rounded-md border border-line bg-surface p-5">
            <p className="eyebrow">Upcoming</p>
            <p className="mt-2 font-display text-3xl text-ink">{upcomingCount}</p>
            <p className="mt-1 text-[13px] text-ink-soft">booked appointments</p>
          </div>

          <Link
            href="/doctor/leaves"
            className="group flex flex-col justify-between rounded-md border border-line bg-surface p-5 hover:border-pine"
          >
            <div className="flex items-center justify-between">
              <CalendarOff className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
              <ArrowRight className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="mt-3 font-display text-[15px] text-ink">Manage leave</p>
              <p className="mt-1 text-[13px] text-ink-soft">Mark unavailable dates</p>
            </div>
          </Link>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-[18px] text-ink">
              <Sunrise className="h-4 w-4 text-pine" strokeWidth={1.75} />
              Today's schedule
            </h2>

            <Link
              href="/doctor/appointments"
              className="flex items-center gap-1 text-sm font-medium text-pine hover:underline"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <Alert tone="error">{error}</Alert>
          ) : todaysAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line-strong bg-surface/50 px-6 py-12 text-center">
              <ClipboardList className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
              <p className="font-display text-[16px] text-ink">Nothing scheduled today</p>
              <p className="text-sm text-ink-soft">Enjoy the quiet — check back tomorrow.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  viewerRole="doctor"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
