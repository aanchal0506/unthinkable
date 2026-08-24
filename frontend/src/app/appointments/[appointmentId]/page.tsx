"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import AppointmentStatus from "@/components/appointments/AppointmentStatus";
import UrgencyBadge from "@/components/appointments/UrgencyBadge";

import { getPatientAppointmentDetails } from "@/lib/api/appointments";

const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(`${date.slice(0, 10)}T00:00:00`));
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

export default function AppointmentDetailsPage() {
    const params = useParams();

    const appointmentId = Number(params.appointmentId);

    const [appointment, setAppointment] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!appointmentId || Number.isNaN(appointmentId)) {
            setError("Invalid appointment ID.");
            setLoading(false);
            return;
        }

        const loadAppointment = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getPatientAppointmentDetails(appointmentId);

                setAppointment(data);
            } catch (error: any) {
                console.error("Failed to load appointment:", error);

                setError(
                    error?.response?.data?.message ||
                    "Unable to load appointment details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAppointment();
    }, [appointmentId]);

    if (loading) {
        return (
            <AppShell allow={["PATIENT"]}>
                <div className="py-16">
                    <Loading />
                </div>
            </AppShell>
        );
    }

    if (error || !appointment) {
        return (
            <AppShell allow={["PATIENT"]}>
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/appointments"
                        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to appointments
                    </Link>

                    <Alert tone="error" className="mt-6">
                        {error || "Appointment not found."}
                    </Alert>
                </div>
            </AppShell>
        );
    }

    const doctorName =
        appointment.doctor?.user?.name ||
        appointment.doctor?.name ||
        "Doctor";

    const specialization =
        appointment.doctor?.specialization ||
        "Medical specialist";

    const date =
        appointment.date ||
        appointment.appointmentDate ||
        "";

    const symptoms = appointment.symptomSubmission;
    const consultation = appointment.consultation;

    return (
        <AppShell allow={["PATIENT"]}>
            <div className="mx-auto max-w-3xl pb-16">
                <Link
                    href="/appointments"
                    className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to appointments
                </Link>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="eyebrow mb-2">
                            Appointment #{appointment.id}
                        </p>

                        <h1 className="font-display text-[26px] text-ink">
                            Appointment details
                        </h1>
                    </div>

                    <AppointmentStatus status={appointment.status} />
                </div>

                <div className="mt-7 space-y-5">
                    {/* Doctor */}
                    <section className="rounded-md border border-line bg-surface p-6">
                        <p className="eyebrow">Doctor</p>

                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong bg-pine-wash font-display text-lg font-medium text-pine-deep">
                                {doctorName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h2 className="font-display text-[17px] text-ink">
                                    {doctorName}
                                </h2>

                                <p className="mt-0.5 text-[13px] text-pine">
                                    {specialization}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Date and time */}
                    <section className="rounded-md border border-line bg-surface p-6">
                        <p className="eyebrow">Visit information</p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-ink-faint">Date</p>

                                <p className="mt-1 text-sm text-ink">
                                    {date ? formatDate(date) : "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-ink-faint">Time</p>

                                <p className="mt-1 font-mono text-sm text-ink">
                                    {formatTime(appointment.startTime)}
                                    {appointment.endTime && (
                                        <> – {formatTime(appointment.endTime)}</>
                                    )}
                                </p>
                            </div>
                        </div>

                        {appointment.status === "CANCELLED" && appointment.cancelReason && (
                            <p className="mt-4 rounded-sm bg-clay-wash px-3 py-2 text-[13px] text-clay">
                                Cancelled: {appointment.cancelReason}
                            </p>
                        )}
                    </section>

                    {/* Symptoms + AI pre-visit summary */}
                    <section className="rounded-md border border-line bg-surface p-6">
                        <p className="eyebrow flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-pine" />
                            Before your visit
                        </p>

                        {!symptoms?.symptoms ? (
                            <p className="mt-4 text-sm text-ink-faint">
                                No symptoms were provided for this appointment.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {symptoms.urgency && (
                                    <UrgencyBadge urgency={symptoms.urgency} />
                                )}

                                {symptoms.aiStatus === "COMPLETED" && symptoms.chiefComplaint && (
                                    <div>
                                        <p className="text-xs font-medium text-ink-faint">
                                            Chief complaint
                                        </p>
                                        <p className="mt-1 text-sm text-ink">
                                            {symptoms.chiefComplaint}
                                        </p>
                                    </div>
                                )}

                                {symptoms.aiStatus === "COMPLETED" &&
                                    symptoms.suggestedQuestions?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-ink-faint">
                                                Questions you might ask your doctor
                                            </p>
                                            <ul className="mt-2 space-y-1.5">
                                                {symptoms.suggestedQuestions.map(
                                                    (q: string, i: number) => (
                                                        <li key={i} className="flex gap-2 text-sm text-ink">
                                                            <span className="font-mono text-ink-faint">
                                                                {i + 1}.
                                                            </span>
                                                            {q}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                <div className="border-t border-line pt-4">
                                    <p className="text-xs font-medium text-ink-faint">
                                        What you shared
                                    </p>
                                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
                                        {symptoms.symptoms}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Post-visit summary + prescriptions */}
                    {consultation && (
                        <section className="rounded-md border border-line bg-surface p-6">
                            <p className="eyebrow flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-pine" />
                                Visit summary
                            </p>

                            {consultation.aiStatus === "COMPLETED" && consultation.patientSummary ? (
                                <p className="mt-4 whitespace-pre-wrap rounded-sm bg-pine-wash p-4 text-sm leading-6 text-ink">
                                    {consultation.patientSummary}
                                </p>
                            ) : (
                                <p className="mt-4 text-sm text-ink-soft">
                                    {consultation.diagnosis || consultation.clinicalNotes}
                                </p>
                            )}

                            {consultation.followUpInstructions && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-ink-faint">
                                        Follow-up
                                    </p>
                                    <p className="mt-1 text-sm text-ink">
                                        {consultation.followUpInstructions}
                                    </p>
                                </div>
                            )}

                            {consultation.prescriptions?.length > 0 && (
                                <div className="mt-4 border-t border-line pt-4">
                                    <p className="text-xs font-medium text-ink-faint">
                                        Prescriptions
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {consultation.prescriptions.map((p: any) => (
                                            <div
                                                key={p.id}
                                                className="rounded-sm border border-line bg-paper p-3 text-sm"
                                            >
                                                <p className="font-medium text-ink">
                                                    {p.medication} · {p.dosage}
                                                </p>
                                                <p className="mt-0.5 text-ink-soft">
                                                    {p.frequency}
                                                    {p.duration ? ` · ${p.duration}` : ""}
                                                </p>
                                                {p.instructions && (
                                                    <p className="mt-0.5 text-ink-faint">
                                                        {p.instructions}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Status information */}
                    <section className="rounded-md border border-line bg-paper p-6">
                        <p className="eyebrow">Appointment status</p>

                        <div className="mt-3">
                            <AppointmentStatus status={appointment.status} />
                        </div>

                        <p className="mt-3 text-sm leading-6 text-ink-soft">
                            {appointment.status === "BOOKED" &&
                                "Your appointment is confirmed. Please arrive a few minutes before your scheduled time."}

                            {appointment.status === "COMPLETED" &&
                                "This appointment has been completed."}

                            {appointment.status === "CANCELLED" &&
                                "This appointment has been cancelled."}
                        </p>
                    </section>
                </div>

                <div className="mt-6">
                    <Link
                        href="/appointments"
                        className="inline-block rounded-sm border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper"
                    >
                        Back to my appointments
                    </Link>
                </div>
            </div>
        </AppShell>
    );
}
