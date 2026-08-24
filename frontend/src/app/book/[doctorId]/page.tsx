"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import DatePicker from "@/components/booking/DatePicker";
import SlotGrid from "@/components/booking/SlotGrid";
import BookingSummary from "@/components/booking/BookingSummary";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

import { getDoctorById } from "@/lib/api/doctors";
import {
  getAvailableSlots,
  holdSlot,
} from "@/lib/api/slots";

import type { Doctor } from "@/types/doctor";
import type { TimeSlot } from "@/types/appointment";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();

  const doctorId = Number(params.doctorId);

  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [holding, setHolding] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    const loadDoctor = async () => {
      try {
        setLoadingDoctor(true);

        const data = await getDoctorById(doctorId);

        setDoctor(data);
      } catch (error: any) {
        setError(error?.response?.data?.message || "Unable to load doctor.");
      } finally {
        setLoadingDoctor(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate || !doctorId) {
      return;
    }

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setError("");
        setSelectedSlot(null);

        const data = await getAvailableSlots(doctorId, selectedDate);

        setSlots(data);
      } catch (error: any) {
        setSlots([]);

        setError(
          error?.response?.data?.message || "Unable to load available slots."
        );
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, doctorId]);

  const handleContinue = async () => {
    if (!selectedSlot || !selectedDate) {
      return;
    }

    try {
      setHolding(true);
      setError("");

      const result = await holdSlot(doctorId, selectedDate, selectedSlot.startTime);

      sessionStorage.setItem(
        "bookingData",
        JSON.stringify({
          doctorId,
          doctorName: doctor?.name,
          specialization: doctor?.specialization,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          holdId: result.holdId,
          expiresAt: result.expiresAt,
        })
      );

      router.push(`/book/${doctorId}/symptoms`);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to hold this slot. Please choose another."
      );
    } finally {
      setHolding(false);
    }
  };

  if (loadingDoctor) {
    return (
      <AppShell allow={["PATIENT"]}>
        <Loading />
      </AppShell>
    );
  }

  if (!doctor) {
    return (
      <AppShell allow={["PATIENT"]}>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/doctors"
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to doctors
          </Link>

          <Alert tone="error" className="mt-6">{error || "Doctor not found."}</Alert>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allow={["PATIENT"]}>
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/doctors/${doctor.id}`}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to doctor
        </Link>

        <div className="mt-6 mb-8">
          <p className="eyebrow mb-2">Book an appointment</p>
          <h1 className="font-display text-[26px] text-ink">Choose a date and time</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Select an available slot with <span className="font-medium text-ink">{doctor.name}</span>.
          </p>
        </div>

        {error && <Alert tone="error" className="mb-6">{error}</Alert>}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-ink">Select date</h2>
              <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Available times</h2>

                {selectedDate && (
                  <span className="font-mono text-[12px] text-ink-faint">
                    {slots.length} available
                  </span>
                )}
              </div>

              {!selectedDate ? (
                <div className="rounded-md border border-dashed border-line-strong bg-surface/50 p-8 text-center">
                  <p className="text-sm text-ink-soft">
                    Select a date to see available appointment times.
                  </p>
                </div>
              ) : loadingSlots ? (
                <Loading />
              ) : (
                <SlotGrid slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
              )}
            </section>
          </div>

          <div>
            {selectedDate && selectedSlot ? (
              <BookingSummary
                doctor={doctor}
                date={selectedDate}
                slot={selectedSlot}
                loading={holding}
                onConfirm={handleContinue}
              />
            ) : (
              <div className="rounded-md border border-line bg-surface p-5">
                <p className="font-display text-[16px] text-ink">Appointment summary</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Select a date and appointment time to continue.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
