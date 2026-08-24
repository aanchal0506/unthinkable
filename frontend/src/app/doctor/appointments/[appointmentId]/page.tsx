"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RotateCw, Sparkles, AlertCircle } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import AppointmentStatus from "@/components/appointments/AppointmentStatus";
import UrgencyBadge from "@/components/appointments/UrgencyBadge";
import ConsultationForm from "@/components/consultation/ConsultationForm";

import {
  getDoctorAppointmentDetails,
  completeAppointment,
  regenerateSymptomSummary,
} from "@/lib/api/appointments";
import { regeneratePatientSummary } from "@/lib/api/consultations";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${String(date).slice(0, 10)}T00:00:00`));

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
};

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const appointmentId = Number(params.appointmentId);

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [regeneratingSymptoms, setRegeneratingSymptoms] = useState(false);
  const [regeneratingConsultation, setRegeneratingConsultation] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDoctorAppointmentDetails(appointmentId);

      setAppointment(data);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Unable to load this appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const handleRegenerateSymptoms = async () => {
    try {
      setRegeneratingSymptoms(true);
      await regenerateSymptomSummary(appointmentId);
      await load();
    } catch (error: any) {
      window.alert(
        error?.response?.data?.message || "Unable to regenerate the AI summary."
      );
    } finally {
      setRegeneratingSymptoms(false);
    }
  };

  const handleRegenerateConsultationSummary = async () => {
    try {
      setRegeneratingConsultation(true);
      await regeneratePatientSummary(appointmentId);
      await load();
    } catch (error: any) {
      window.alert(
        error?.response?.data?.message || "Unable to regenerate the patient summary."
      );
    } finally {
      setRegeneratingConsultation(false);
    }
  };

  const handleMarkCompleted = async () => {
    const confirmed = window.confirm(
      "Mark this appointment as completed without adding consultation notes?"
    );
    if (!confirmed) return;

    try {
      setCompleting(true);
      await completeAppointment(appointmentId);
      await load();
    } catch (error: any) {
      window.alert(
        error?.response?.data?.message || "Unable to complete the appointment."
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <AppShell allow={["DOCTOR"]}>
        <Loading />
      </AppShell>
    );
  }

  if (error || !appointment) {
    return (
      <AppShell allow={["DOCTOR"]}>
        <div className="mx-auto max-w-3xl">
          <Link href="/doctor/appointments" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine">
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

  const patientName = appointment.patient?.user?.name || "Patient";
  const patientEmail = appointment.patient?.user?.email || "";
  const symptoms = appointment.symptomSubmission;
  const consultation = appointment.consultation;

  return (
    <AppShell allow={["DOCTOR"]}>
      <div className="mx-auto max-w-3xl pb-16">
        <Link href="/doctor/appointments" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to appointments
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Appointment #{appointment.id}</p>
            <h1 className="font-display text-[26px] text-ink">{patientName}</h1>
            <p className="mt-1 font-mono text-[13px] text-ink-soft">{patientEmail}</p>
          </div>

          <AppointmentStatus status={appointment.status} />
        </div>

        <section className="mt-7 rounded-md border border-line bg-surface p-6">
          <p className="eyebrow">Visit information</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-ink-faint">Date</p>
              <p className="mt-1 text-sm text-ink">{formatDate(appointment.date)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Time</p>
              <p className="mt-1 font-mono text-sm text-ink">
                {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
              </p>
            </div>
          </div>
        </section>

        {/* Pre-visit symptoms + AI summary */}
        <section className="mt-5 rounded-md border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pine" />
              Pre-visit summary
            </p>

            {symptoms?.aiStatus === "FAILED" && (
              <button
                type="button"
                onClick={handleRegenerateSymptoms}
                disabled={regeneratingSymptoms}
                className="flex items-center gap-1.5 text-xs font-medium text-pine hover:underline disabled:opacity-50"
              >
                <RotateCw className={`h-3 w-3 ${regeneratingSymptoms ? "animate-spin" : ""}`} />
                Retry AI summary
              </button>
            )}
          </div>

          {!symptoms ? (
            <p className="mt-4 text-sm text-ink-faint">
              The patient hasn't submitted symptoms for this appointment yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {symptoms.urgency && (
                <UrgencyBadge urgency={symptoms.urgency} />
              )}

              {symptoms.aiStatus === "FAILED" && (
                <Alert tone="error">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>AI summary generation failed. You can retry above, or read the patient's raw symptoms below.</span>
                  </div>
                </Alert>
              )}

              {symptoms.chiefComplaint && (
                <div>
                  <p className="text-xs font-medium text-ink-faint">Chief complaint</p>
                  <p className="mt-1 text-sm text-ink">{symptoms.chiefComplaint}</p>
                </div>
              )}

              {symptoms.suggestedQuestions && symptoms.suggestedQuestions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-ink-faint">Suggested questions</p>
                  <ul className="mt-2 space-y-1.5">
                    {symptoms.suggestedQuestions.map((q: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-ink">
                        <span className="font-mono text-ink-faint">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-line pt-4">
                <p className="text-xs font-medium text-ink-faint">Patient's own words</p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
                  {symptoms.symptoms}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Consultation */}
        <section className="mt-5 rounded-md border border-line bg-surface p-6">
          <p className="eyebrow mb-4">Consultation</p>

          {consultation ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-ink-faint">Clinical notes</p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink">
                  {consultation.clinicalNotes}
                </p>
              </div>

              {consultation.diagnosis && (
                <div>
                  <p className="text-xs font-medium text-ink-faint">Diagnosis</p>
                  <p className="mt-1 text-sm text-ink">{consultation.diagnosis}</p>
                </div>
              )}

              {consultation.followUpInstructions && (
                <div>
                  <p className="text-xs font-medium text-ink-faint">Follow-up instructions</p>
                  <p className="mt-1 text-sm text-ink">{consultation.followUpInstructions}</p>
                </div>
              )}

              {consultation.prescriptions?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-ink-faint">Prescriptions</p>
                  <div className="mt-2 space-y-2">
                    {consultation.prescriptions.map((p: any) => (
                      <div key={p.id} className="rounded-sm border border-line bg-paper p-3 text-sm">
                        <p className="font-medium text-ink">
                          {p.medication} · {p.dosage}
                        </p>
                        <p className="mt-0.5 text-ink-soft">
                          {p.frequency}
                          {p.duration ? ` · ${p.duration}` : ""}
                        </p>
                        {p.instructions && (
                          <p className="mt-0.5 text-ink-faint">{p.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-line pt-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-ink-faint">
                    <Sparkles className="h-3.5 w-3.5 text-pine" />
                    Patient-friendly summary (AI generated)
                  </p>

                  {consultation.aiStatus === "FAILED" && (
                    <button
                      type="button"
                      onClick={handleRegenerateConsultationSummary}
                      disabled={regeneratingConsultation}
                      className="flex items-center gap-1.5 text-xs font-medium text-pine hover:underline disabled:opacity-50"
                    >
                      <RotateCw className={`h-3 w-3 ${regeneratingConsultation ? "animate-spin" : ""}`} />
                      Retry
                    </button>
                  )}
                </div>

                {consultation.aiStatus === "COMPLETED" && consultation.patientSummary ? (
                  <p className="mt-2 whitespace-pre-wrap rounded-sm bg-pine-wash p-4 text-sm leading-6 text-ink">
                    {consultation.patientSummary}
                  </p>
                ) : consultation.aiStatus === "FAILED" ? (
                  <p className="mt-2 text-sm text-ink-faint">
                    Generation failed — the patient will see your clinical notes until this is retried.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-ink-faint">Generating…</p>
                )}
              </div>
            </div>
          ) : appointment.status === "BOOKED" ? (
            <>
              <p className="mb-5 text-sm text-ink-soft">
                Add your notes to complete this visit. A patient-friendly
                summary will be generated automatically.
              </p>

              <ConsultationForm appointmentId={appointment.id} onSaved={load} />

              <div className="mt-5 border-t border-line pt-5">
                <Button variant="ghost" loading={completing} onClick={handleMarkCompleted}>
                  Mark completed without notes
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-faint">
              {appointment.status === "CANCELLED"
                ? "This appointment was cancelled — no consultation was recorded."
                : "No consultation notes were recorded for this appointment."}
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
