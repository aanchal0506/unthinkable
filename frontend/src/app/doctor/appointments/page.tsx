"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarCheck2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

import AppointmentCard from "@/components/appointments/AppointmentCard";
import AppointmentTabs from "@/components/appointments/AppointmentTabs";

import { getMyDoctorAppointments } from "@/lib/api/appointments";

const getAppointmentDate = (appointment: any) =>
  appointment.date || appointment.appointmentDate;

const isUpcoming = (appointment: any) => {
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    return false;
  }

  const date = getAppointmentDate(appointment);
  if (!date) return false;

  const appointmentDate = String(date).slice(0, 10);

  const today = new Date();
  const todayDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (appointmentDate > todayDate) return true;
  if (appointmentDate < todayDate) return false;

  const [hours, minutes] = (appointment.startTime || "00:00").split(":").map(Number);
  const appointmentMinutes = hours * 60 + minutes;
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  return appointmentMinutes >= currentMinutes;
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
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

  const upcoming = useMemo(
    () =>
      appointments
        .filter(isUpcoming)
        .sort((a, b) =>
          `${getAppointmentDate(a)} ${a.startTime}`.localeCompare(
            `${getAppointmentDate(b)} ${b.startTime}`
          )
        ),
    [appointments]
  );

  const past = useMemo(
    () =>
      appointments
        .filter((a) => !isUpcoming(a))
        .sort((a, b) =>
          `${getAppointmentDate(b)} ${b.startTime}`.localeCompare(
            `${getAppointmentDate(a)} ${a.startTime}`
          )
        ),
    [appointments]
  );

  const displayed = activeTab === "upcoming" ? upcoming : past;

  return (
    <AppShell allow={["DOCTOR"]}>
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="eyebrow mb-2">Schedule</p>
          <h1 className="font-display text-[28px] text-ink">Appointments</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-soft">
            Every appointment booked with you, past and upcoming.
          </p>
        </div>

        <div className="mt-8">
          <AppointmentTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            upcomingCount={upcoming.length}
            pastCount={past.length}
          />
        </div>

        {loading ? (
          <div className="py-16">
            <Loading />
          </div>
        ) : error ? (
          <Alert tone="error" className="mt-6">
            {error}
          </Alert>
        ) : displayed.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-line-strong bg-surface/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong bg-paper text-ink-faint">
              {activeTab === "upcoming" ? (
                <CalendarClock className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <CalendarCheck2 className="h-5 w-5" strokeWidth={1.5} />
              )}
            </div>

            <h2 className="mt-4 font-display text-[17px] text-ink">
              {activeTab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
              {activeTab === "upcoming"
                ? "Appointments patients book with you will appear here."
                : "Completed and cancelled appointments will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {displayed.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                viewerRole="doctor"
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
