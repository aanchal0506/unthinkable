"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

import { getDoctors, createDoctor } from "@/lib/api/doctors";
import type { Doctor } from "@/types/doctor";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  specialization: "",
  qualification: "",
  experience: "",
  bio: "",
  consultationFee: "",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctors();
      setDoctors(data);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!form.name || !form.email || !form.password || !form.specialization) {
      setFormError("Name, email, password and specialization are required.");
      return;
    }

    try {
      setSubmitting(true);

      await createDoctor({
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
        qualification: form.qualification || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        bio: form.bio || undefined,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
      });

      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || "Unable to create doctor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Directory</p>
            <h1 className="font-display text-[28px] text-ink">Doctors</h1>
            <p className="mt-1.5 text-[14.5px] text-ink-soft">
              Add and manage doctor profiles for the clinic.
            </p>
          </div>

          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add doctor"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-md border border-line bg-surface p-6"
          >
            <p className="mb-4 font-display text-[17px] text-ink">New doctor profile</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
              <Input
                label="Temporary password"
                type="text"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
              <Input
                label="Specialization"
                value={form.specialization}
                onChange={(e) => updateField("specialization", e.target.value)}
                required
              />
              <Input
                label="Qualification"
                placeholder="Optional"
                value={form.qualification}
                onChange={(e) => updateField("qualification", e.target.value)}
              />
              <Input
                label="Experience (years)"
                type="number"
                min="0"
                placeholder="Optional"
                value={form.experience}
                onChange={(e) => updateField("experience", e.target.value)}
              />
              <Input
                label="Consultation fee"
                type="number"
                min="0"
                placeholder="Optional"
                value={form.consultationFee}
                onChange={(e) => updateField("consultationFee", e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Bio"
                placeholder="Optional"
                rows={3}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </div>

            {formError && <Alert tone="error" className="mt-4">{formError}</Alert>}

            <Button type="submit" loading={submitting} className="mt-5">
              Create doctor
            </Button>
          </form>
        )}

        {loading ? (
          <div className="mt-8">
            <Loading />
          </div>
        ) : error ? (
          <Alert tone="error" className="mt-8">{error}</Alert>
        ) : doctors.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-line-strong bg-surface/50 px-6 py-14 text-center">
            <p className="font-display text-[16px] text-ink">No doctors yet</p>
            <p className="mt-1 text-sm text-ink-soft">Add your first doctor profile above.</p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialisation</th>
                  <th>Experience</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="font-sans text-ink">
                      <Link href={`/admin/doctors/${doctor.id}`} className="hover:text-pine">
                        {doctor.name}
                      </Link>
                    </td>
                    <td className="text-ink-soft">{doctor.specialization}</td>
                    <td>{doctor.experience ? `${doctor.experience} yrs` : "—"}</td>
                    <td>{doctor.consultationFee ? `₹${doctor.consultationFee}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
