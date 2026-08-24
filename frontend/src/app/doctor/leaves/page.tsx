"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarOff, Trash2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { createLeave, getMyLeaves, deleteLeave } from "@/lib/api/leaves";
import type { DoctorLeave } from "@/types/leave";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${String(date).slice(0, 10)}T00:00:00`));

const todayValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

export default function DoctorLeavesPage() {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyLeaves();

      setLeaves(
        [...data].sort((a, b) => a.date.localeCompare(b.date))
      );
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load your leave dates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setFormError("");
    setNotice("");

    if (!date) {
      setFormError("Please choose a date.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await createLeave(date, reason.trim() || undefined);

      setDate("");
      setReason("");

      if (result.affectedAppointments > 0) {
        setNotice(
          `Leave added. ${result.affectedAppointments} existing appointment${
            result.affectedAppointments === 1 ? " was" : "s were"
          } cancelled, and the affected patient${
            result.affectedAppointments === 1 ? "" : "s"
          } notified by email.`
        );
      }

      await load();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || "Unable to add this leave date.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Remove this leave date?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteLeave(id);
      setLeaves((current) => current.filter((leave) => leave.id !== id));
    } catch (error: any) {
      window.alert(error?.response?.data?.message || "Unable to remove this leave date.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell allow={["DOCTOR"]}>
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-2">Availability</p>
        <h1 className="font-display text-[28px] text-ink">Leave</h1>
        <p className="mt-1.5 max-w-xl text-[14.5px] text-ink-soft">
          Mark dates you're unavailable. If patients already have
          appointments booked on that date, they'll be cancelled and
          notified automatically.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 rounded-md border border-line bg-surface p-6"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Input
              label="Date"
              type="date"
              min={todayValue()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              label="Reason (optional)"
              placeholder="e.g. Conference, personal leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {formError && <Alert tone="error" className="mt-4">{formError}</Alert>}
          {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}

          <Button type="submit" loading={submitting} className="mt-4">
            Add leave date
          </Button>
        </form>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-ink">Upcoming leave</h2>

          {loading ? (
            <Loading />
          ) : error ? (
            <Alert tone="error">{error}</Alert>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line-strong bg-surface/50 px-6 py-12 text-center">
              <CalendarOff className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
              <p className="font-display text-[16px] text-ink">No leave dates set</p>
              <p className="text-sm text-ink-soft">You're marked as available on every scheduled day.</p>
            </div>
          ) : (
            <div className="divide-y divide-line rounded-md border border-line bg-surface">
              {leaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{formatDate(leave.date)}</p>
                    {leave.reason && (
                      <p className="mt-0.5 text-[13px] text-ink-soft">{leave.reason}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(leave.id)}
                    disabled={deletingId === leave.id}
                    className="rounded-sm p-2 text-ink-faint hover:bg-clay-wash hover:text-clay disabled:opacity-50"
                    aria-label="Remove leave date"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
