"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

import type { PrescriptionInput } from "@/types/consultation";
import { createConsultation } from "@/lib/api/consultations";

const emptyPrescription: PrescriptionInput = {
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

interface ConsultationFormProps {
  appointmentId: number;
  onSaved: () => void;
}

export default function ConsultationForm({
  appointmentId,
  onSaved,
}: ConsultationFormProps) {
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updatePrescription = (
    index: number,
    field: keyof PrescriptionInput,
    value: string
  ) => {
    setPrescriptions((current) =>
      current.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const addPrescription = () => {
    setPrescriptions((current) => [...current, { ...emptyPrescription }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    if (!clinicalNotes.trim()) {
      setError("Clinical notes are required.");
      return;
    }

    for (const prescription of prescriptions) {
      if (!prescription.medication.trim() || !prescription.dosage.trim() || !prescription.frequency.trim()) {
        setError("Each prescription needs a medication, dosage, and frequency.");
        return;
      }
    }

    try {
      setSubmitting(true);

      await createConsultation(appointmentId, {
        clinicalNotes: clinicalNotes.trim(),
        diagnosis: diagnosis.trim() || undefined,
        followUpInstructions: followUpInstructions.trim() || undefined,
        prescriptions: prescriptions.map((p) => ({
          medication: p.medication.trim(),
          dosage: p.dosage.trim(),
          frequency: p.frequency.trim(),
          duration: p.duration?.trim() || undefined,
          instructions: p.instructions?.trim() || undefined,
        })),
      });

      onSaved();
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Unable to save the consultation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Textarea
        label="Clinical notes"
        placeholder="What did you observe? What was discussed during the visit?"
        rows={6}
        value={clinicalNotes}
        onChange={(e) => setClinicalNotes(e.target.value)}
        required
      />

      <Input
        label="Diagnosis"
        placeholder="Optional"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
      />

      <Textarea
        label="Follow-up instructions"
        placeholder="Optional — any next steps, tests, or a return visit"
        rows={3}
        value={followUpInstructions}
        onChange={(e) => setFollowUpInstructions(e.target.value)}
      />

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Prescriptions</p>

          <button
            type="button"
            onClick={addPrescription}
            className="flex items-center gap-1.5 text-sm font-medium text-pine hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add medication
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <p className="mt-3 rounded-sm border border-dashed border-line-strong px-4 py-3 text-sm text-ink-faint">
            No medications prescribed.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {prescriptions.map((prescription, index) => (
              <div
                key={index}
                className="rounded-md border border-line bg-paper p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="eyebrow">Medication {index + 1}</p>

                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    className="text-ink-faint hover:text-clay"
                    aria-label="Remove medication"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Medication name"
                    value={prescription.medication}
                    onChange={(e) => updatePrescription(index, "medication", e.target.value)}
                  />

                  <Input
                    placeholder="Dosage (e.g. 500mg)"
                    value={prescription.dosage}
                    onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                  />

                  <Input
                    placeholder="Frequency (e.g. twice daily)"
                    value={prescription.frequency}
                    onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                  />

                  <Input
                    placeholder="Duration (e.g. 7 days)"
                    value={prescription.duration}
                    onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                  />
                </div>

                <Input
                  className="mt-3"
                  placeholder="Instructions (e.g. take after food)"
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Button type="submit" loading={submitting} className="w-full">
        Complete visit &amp; save consultation
      </Button>
    </form>
  );
}
