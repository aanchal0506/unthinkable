"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
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
          error?.response?.data?.message ||
            "Unable to load doctor details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/doctors"
          className="text-sm text-[#687386] hover:text-[#176b87]"
        >
          ← Back to doctors
        </Link>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : !doctor ? (
          <div className="mt-6 rounded-xl border border-[#e4e7ec] bg-white p-8 text-center">
            Doctor not found.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
            <div className="border-b border-[#e4e7ec] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e7f2f5] text-3xl font-semibold text-[#176b87]">
                  {doctor.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="text-2xl font-semibold text-[#172033]">
                    {doctor.name}
                  </h1>

                  <p className="mt-1 text-[#176b87]">
                    {
                      doctor.specialization ||
                      "General Medicine"}
                  </p>

                  {doctor.qualification && (
                    <p className="mt-2 text-sm text-[#687386]">
                      {doctor.qualification}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_240px]">
              <div>
                <h2 className="font-semibold text-[#172033]">
                  About
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#687386]">
                  {doctor.bio ||
                    "Doctor information and consultation details are available here."}
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {doctor.experience !== undefined && (
                    <div className="rounded-lg bg-[#f7f8fa] p-4">
                      <p className="text-xs text-[#98a2b3]">
                        Experience
                      </p>

                      <p className="mt-1 font-medium text-[#344054]">
                        {doctor.experience} years
                      </p>
                    </div>
                  )}

                  {doctor.consultationFee !== undefined && (
                    <div className="rounded-lg bg-[#f7f8fa] p-4">
                      <p className="text-xs text-[#98a2b3]">
                        Consultation fee
                      </p>

                      <p className="mt-1 font-medium text-[#344054]">
                        ₹{doctor.consultationFee}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#e4e7ec] p-5">
                <p className="text-sm font-medium text-[#172033]">
                  Ready to book?
                </p>

                <p className="mt-2 text-sm leading-6 text-[#687386]">
                  Choose an available date and appointment slot.
                </p>

                <Link
                  href={`/book/${doctor.id}`}
                  className="mt-5 block"
                >
                  <Button className="w-full">
                    Book appointment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}