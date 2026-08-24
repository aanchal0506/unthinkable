"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

import { getDoctorById } from "@/lib/api/doctors";
import type { Doctor } from "@/types/doctor";

export default function DoctorDetailsPage() {
  const params = useParams();

  const doctorId = Number(params.id);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    const loadDoctor = async () => {
      try {
        setLoading(true);

        const data = await getDoctorById(doctorId);

        setDoctor(data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Unable to load doctor details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  return (
    <AppShell allow={["PATIENT"]}>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/doctors"
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-pine"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to doctors
        </Link>

        {loading ? (
          <Loading />
        ) : error ? (
          <Alert tone="error" className="mt-6">{error}</Alert>
        ) : !doctor ? (
          <div className="mt-6 rounded-md border border-line bg-surface p-8 text-center text-ink-soft">
            Doctor not found.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
            <div className="border-b border-line p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-pine-wash font-display text-3xl font-medium text-pine-deep">
                  {doctor.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="font-display text-[26px] text-ink">{doctor.name}</h1>
                  <p className="mt-1 text-pine">{doctor.specialization || "General Medicine"}</p>

                  {doctor.qualification && (
                    <p className="mt-2 font-mono text-[13px] text-ink-soft">
                      {doctor.qualification}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_240px]">
              <div>
                <p className="eyebrow mb-3">About</p>

                <p className="text-sm leading-7 text-ink-soft">
                  {doctor.bio ||
                    "Doctor information and consultation details are available here."}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {doctor.experience !== undefined && doctor.experience !== null && (
                    <div className="rounded-sm border border-line bg-paper p-4">
                      <p className="eyebrow">Experience</p>
                      <p className="mt-1 font-mono font-medium text-ink">
                        {doctor.experience} years
                      </p>
                    </div>
                  )}

                  {doctor.consultationFee !== undefined && doctor.consultationFee !== null && (
                    <div className="rounded-sm border border-line bg-paper p-4">
                      <p className="eyebrow">Consultation fee</p>
                      <p className="mt-1 font-mono font-medium text-ink">
                        ₹{doctor.consultationFee}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-fit rounded-md border border-line p-5">
                <p className="font-display text-[16px] text-ink">Ready to book?</p>

                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Choose an available date and appointment slot.
                </p>

                <Link href={`/book/${doctor.id}`} className="mt-5 block">
                  <Button className="w-full">Book appointment</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
