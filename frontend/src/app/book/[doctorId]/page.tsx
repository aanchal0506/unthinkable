"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import AppShell from "@/components/layout/AppShell";
import DatePicker from "@/components/booking/DatePicker";
import SlotGrid from "@/components/booking/SlotGrid";
import BookingSummary from "@/components/booking/BookingSummary";
import Loading from "@/components/ui/Loading";

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

  const [doctor, setDoctor] =
    useState<Doctor | null>(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] =
    useState<TimeSlot | null>(null);

  const [loadingDoctor, setLoadingDoctor] =
    useState(true);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [holding, setHolding] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    const loadDoctor = async () => {
      try {
        setLoadingDoctor(true);

        const data =
          await getDoctorById(doctorId);

        setDoctor(data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to load doctor."
        );
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

        const data =
          await getAvailableSlots(
            doctorId,
            selectedDate
          );

        setSlots(data);
      } catch (error: any) {
        setSlots([]);

        setError(
          error?.response?.data?.message ||
            "Unable to load available slots."
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

      const result = await holdSlot(
        doctorId,
        selectedDate,
        selectedSlot.startTime
      );

      sessionStorage.setItem(
        "bookingData",
        JSON.stringify({
          doctorId,
          doctorName: doctor?.name,
          specialization:
            doctor?.specialization,
          date: selectedDate,
          startTime:
            selectedSlot.startTime,
          endTime:
            selectedSlot.endTime,
          holdId: result.holdId,
          expiresAt: result.expiresAt,
        })
      );

      router.push(
        `/book/${doctorId}/symptoms`
      );
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
      <AppShell>
        <Loading />
      </AppShell>
    );
  }

  if (!doctor) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/doctors"
            className="text-sm text-[#687386] hover:text-[#176b87]"
          >
            ← Back to doctors
          </Link>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error || "Doctor not found."}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/doctors/${doctor.id}`}
          className="text-sm text-[#687386] hover:text-[#176b87]"
        >
          ← Back to doctor
        </Link>

        <div className="mt-6 mb-8">
          <p className="text-sm font-medium text-[#176b87]">
            Book an appointment
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[#172033]">
            Choose a date and time
          </h1>

          <p className="mt-2 text-sm text-[#687386]">
            Select an available slot with{" "}
            <span className="font-medium text-[#344054]">
              {doctor.name}
            </span>
            .
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#344054]">
                Select date
              </h2>

              <DatePicker
                selectedDate={selectedDate}
                onChange={setSelectedDate}
              />
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#344054]">
                  Available times
                </h2>

                {selectedDate && (
                  <span className="text-xs text-[#98a2b3]">
                    {slots.length} available
                  </span>
                )}
              </div>

              {!selectedDate ? (
                <div className="rounded-lg border border-dashed border-[#d9dee7] bg-white p-8 text-center">
                  <p className="text-sm text-[#687386]">
                    Select a date to see available
                    appointment times.
                  </p>
                </div>
              ) : loadingSlots ? (
                <Loading />
              ) : (
                <SlotGrid
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelect={setSelectedSlot}
                />
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
              <div className="rounded-xl border border-[#e4e7ec] bg-white p-5">
                <p className="text-sm font-semibold text-[#172033]">
                  Appointment summary
                </p>

                <p className="mt-2 text-sm leading-6 text-[#687386]">
                  Select a date and appointment time to
                  continue.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}