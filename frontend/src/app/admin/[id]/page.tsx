"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

import { getDoctorById, updateDoctor, deleteDoctor } from "@/lib/api/doctors";
import {
  getDoctorAvailability,
  createAvailability,
  deleteAvailability,
} from "@/lib/api/availability";

import type { Doctor } from "@/types/doctor";
import type { DoctorAvailability } from "@/types/availability";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AdminDoctorDetailPage() {
  const params = useParams();
  const doctorId = Number(params.id);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
    consultationFee: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");

  const [slotForm, setSlotForm] = useState({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: "30",
  });
  const [addingSlot, setAddingSlot] = useState(false);
  const [slotError, setSlotError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [doctorData, availabilityData] = await Promise.all([
        getDoctorById(doctorId),
        getDoctorAvailability(doctorId),
      ]);

      setDoctor(doctorData);
      setAvailability(
        [...availabilityData].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      );

      setForm({
        specialization: doctorData.specialization || "",
        qualification: doctorData.qualification || "",
        experience: doctorData.experience?.toString() || "",
        bio: doctorData.bio || "",
        consultationFee: doctorData.consultationFee?.toString() || "",
      });
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load this doctor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileError("");
    setProfileNotice("");

    try {
      setSavingProfile(true);

      await updateDoctor(doctorId, {
        specialization: form.specialization || undefined,
        qualification: form.qualification || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        bio: form.bio || undefined,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
      });

      setProfileNotice("Profile updated.");
      await load();
    } catch (error: any) {
      setProfileError(error?.response?.data?.message || "Unable to save changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteDoctor = async () => {
    const confirmed = window.confirm(
      `Remove ${doctor?.name}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteDoctor(doctorId);
      window.location.href = "/admin/doctors";
    } catch (error: any) {
      window.alert(error?.response?.data?.message || "Unable to remove this doctor.");
    }
  };

  const handleAddSlot = async (event: FormEvent) => {
    event.preventDefault();
    setSlotError("");

    try {
      setAddingSlot(true);

      await createAvailability(doctorId, {
        dayOfWeek: Number(slotForm.dayOfWeek),
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        slotDuration: Number(slotForm.slotDuration),
      });

      await load();
    } catch (error: any) {
      setSlotError(error?.response?.data?.message || "Unable to add this availability block.");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await deleteAvailability(id);
      setAvailability((current) => current.filter((a) => a.id !== id));
    } catch (error: any) {
      window.alert(error?.response?.data?.message || "Unable to remove this availability block.");
    }
  };

  if (loading) {
    return (
      <AppShell allow={["ADMIN"]}>
        <Loading />
      </AppShell>
    );
  }

  if (error || !doctor) {
    return (
      <AppShell allow={["ADMIN"]}>
        <div className="mx-auto max-w-3xl">
          <Link href="/admin/doctors" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to doctors
          </Link>
          <Alert tone="error" className="mt-6">{error || "Doctor not found."}</Alert>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="mx-auto max-w-3xl pb-16">
        <Link href="/admin/doctors" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to doctors
        </Link>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Doctor profile</p>
            <h1 className="font-display text-[26px] text-ink">{doctor.name}</h1>
            <p className="mt-1 font-mono text-[13px] text-ink-soft">{doctor.email}</p>
          </div>

          <button
            type="button"
            onClick={handleDeleteDoctor}
            className="flex items-center gap-1.5 rounded-sm border border-clay/30 px-3 py-1.5 text-[13px] font-medium text-clay hover:bg-clay-wash"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>

        {/* Profile form */}
        <form onSubmit={handleProfileSubmit} className="mt-7 rounded-md border border-line bg-surface p-6">
          <p className="eyebrow mb-4">Edit details</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Specialization"
              value={form.specialization}
              onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
            />
            <Input
              label="Qualification"
              value={form.qualification}
              onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
            />
            <Input
              label="Experience (years)"
              type="number"
              min="0"
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
            />
            <Input
              label="Consultation fee"
              type="number"
              min="0"
              value={form.consultationFee}
              onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>

          {profileError && <Alert tone="error" className="mt-4">{profileError}</Alert>}
          {profileNotice && <Alert tone="success" className="mt-4">{profileNotice}</Alert>}

          <Button type="submit" loading={savingProfile} className="mt-5">
            Save changes
          </Button>
        </form>

        {/* Availability */}
        <section className="mt-6 rounded-md border border-line bg-surface p-6">
          <p className="eyebrow mb-4">Weekly availability</p>

          {availability.length === 0 ? (
            <p className="mb-5 text-sm text-ink-faint">No availability blocks configured yet.</p>
          ) : (
            <div className="mb-5 divide-y divide-line rounded-sm border border-line">
              {availability.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-ink">
                      {WEEKDAYS[slot.dayOfWeek]}
                    </span>
                    <span className="font-mono text-[13px] text-ink-soft">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span className="font-mono text-[12px] text-ink-faint">
                      {slot.slotDuration} min slots
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="rounded-sm p-1.5 text-ink-faint hover:bg-clay-wash hover:text-clay"
                    aria-label="Remove availability block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddSlot} className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] sm:items-end">
            <Select
              label="Day"
              value={slotForm.dayOfWeek}
              onChange={(e) => setSlotForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
            >
              {WEEKDAYS.map((day, index) => (
                <option key={day} value={index}>{day}</option>
              ))}
            </Select>

            <Input
              label="Start"
              type="time"
              value={slotForm.startTime}
              onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))}
            />

            <Input
              label="End"
              type="time"
              value={slotForm.endTime}
              onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))}
            />

            <Input
              label="Slot (min)"
              type="number"
              min="5"
              value={slotForm.slotDuration}
              onChange={(e) => setSlotForm((f) => ({ ...f, slotDuration: e.target.value }))}
            />

            <Button type="submit" loading={addingSlot}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>

          {slotError && <Alert tone="error" className="mt-4">{slotError}</Alert>}
        </section>
      </div>
    </AppShell>
  );
}
