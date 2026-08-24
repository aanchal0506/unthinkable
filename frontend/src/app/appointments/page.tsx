"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarCheck2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

import AppointmentCard from "@/components/appointments/AppointmentCard";
import AppointmentTabs from "@/components/appointments/AppointmentTabs";

import {
    getMyAppointments,
    cancelAppointment,
} from "@/lib/api/appointments";

const getAppointmentDate = (
    appointment: any
) => {
    return (
        appointment.date ||
        appointment.appointmentDate
    );
};

const isUpcoming = (
    appointment: any
) => {
    if (
        appointment.status === "CANCELLED" ||
        appointment.status === "COMPLETED"
    ) {
        return false;
    }

    const date =
        getAppointmentDate(appointment);

    if (!date) {
        return false;
    }

    const startTime =
        appointment.startTime || "00:00";

    /*
     * Appointment dates/times from the backend
     * represent the clinic's local time.
     *
     * Compare the calendar date first, then the
     * time only when the dates are the same.
     */
    const appointmentDate =
        String(date).slice(0, 10);

    const today = new Date();

    const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(
            2,
            "0"
        ),
        String(today.getDate()).padStart(
            2,
            "0"
        ),
    ].join("-");

    if (appointmentDate > todayDate) {
        return true;
    }

    if (appointmentDate < todayDate) {
        return false;
    }

    /*
     * Same day — compare the appointment time
     * against the current local time.
     */
    const [hours, minutes] =
        startTime.split(":").map(Number);

    const appointmentMinutes =
        hours * 60 + minutes;

    const currentMinutes =
        today.getHours() * 60 +
        today.getMinutes();

    return appointmentMinutes >= currentMinutes;
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] =
        useState<any[]>([]);

    const [activeTab, setActiveTab] =
        useState<"upcoming" | "past">(
            "upcoming"
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [cancellingId, setCancellingId] =
        useState<number | null>(null);

    useEffect(() => {
        const loadAppointments =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const data =
                        await getMyAppointments();

                    setAppointments(data);
                } catch (error: any) {
                    console.error(
                        "Failed to load appointments:",
                        error
                    );

                    setError(
                        error?.response?.data
                            ?.message ||
                        "Unable to load your appointments."
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadAppointments();
    }, []);

    const upcomingAppointments =
        useMemo(() => {
            return appointments
                .filter(isUpcoming)
                .sort((a, b) => {
                    const aDate =
                        `${getAppointmentDate(a)} ${a.startTime || "00:00"}`;

                    const bDate =
                        `${getAppointmentDate(b)} ${b.startTime || "00:00"}`;

                    return aDate.localeCompare(bDate);
                });
        }, [appointments]);

    const pastAppointments =
        useMemo(() => {
            return appointments
                .filter(
                    (appointment) =>
                        !isUpcoming(appointment)
                )
                .sort((a, b) => {
                    const aDate =
                        `${getAppointmentDate(a)} ${a.startTime || "00:00"}`;

                    const bDate =
                        `${getAppointmentDate(b)} ${b.startTime || "00:00"}`;

                    return bDate.localeCompare(aDate);
                });
        }, [appointments]);

    const displayedAppointments =
        activeTab === "upcoming"
            ? upcomingAppointments
            : pastAppointments;

    const handleCancel = async (
        appointmentId: number
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this appointment?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(
                appointmentId
            );

            await cancelAppointment(
                appointmentId
            );

            setAppointments(
                (current) =>
                    current.map(
                        (appointment) =>
                            appointment.id ===
                                appointmentId
                                ? {
                                    ...appointment,
                                    status:
                                        "CANCELLED",
                                }
                                : appointment
                    )
            );
        } catch (error: any) {
            window.alert(
                error?.response?.data
                    ?.message ||
                "Unable to cancel the appointment."
            );
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <AppShell allow={["PATIENT"]}>
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow mb-2">Your care</p>

                        <h1 className="font-display text-[28px] text-ink">
                            My appointments
                        </h1>

                        <p className="mt-1.5 text-[14.5px] text-ink-soft">
                            Keep track of your upcoming visits
                            and previous appointments.
                        </p>
                    </div>

                    <Link
                        href="/doctors"
                        className="rounded-sm bg-pine px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-pine-deep"
                    >
                        Book an appointment
                    </Link>
                </div>

                <div className="mt-8">
                    <AppointmentTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        upcomingCount={upcomingAppointments.length}
                        pastCount={pastAppointments.length}
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
                ) : displayedAppointments.length === 0 ? (
                    <div className="mt-6 rounded-md border border-dashed border-line-strong bg-surface/50 px-6 py-14 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong bg-paper text-ink-faint">
                            {activeTab === "upcoming" ? (
                                <CalendarClock className="h-5 w-5" strokeWidth={1.5} />
                            ) : (
                                <CalendarCheck2 className="h-5 w-5" strokeWidth={1.5} />
                            )}
                        </div>

                        <h2 className="mt-4 font-display text-[17px] text-ink">
                            {activeTab === "upcoming"
                                ? "No upcoming appointments"
                                : "No past appointments"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
                            {activeTab === "upcoming"
                                ? "When you book an appointment, it will appear here."
                                : "Your completed and previous appointments will appear here."}
                        </p>

                        {activeTab === "upcoming" && (
                            <Link
                                href="/doctors"
                                className="mt-5 inline-block text-sm font-medium text-pine hover:underline"
                            >
                                Find a doctor →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {displayedAppointments.map(
                            (appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    onCancel={handleCancel}
                                    cancelling={cancellingId === appointment.id}
                                    viewerRole="patient"
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
