"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorSearch from "@/components/doctors/DoctorSearch";
import Loading from "@/components/ui/Loading";

import { getDoctors } from "@/lib/api/doctors";
import type { Doctor } from "@/types/doctor";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDoctors(
          search.trim() || undefined
        );

        setDoctors(data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to load doctors."
        );
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadDoctors, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-sm font-medium text-[#176b87]">
            Find care
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[#172033]">
            Find a doctor
          </h1>

          <p className="mt-2 text-sm text-[#687386]">
            Search for a doctor by their area of specialisation.
          </p>
        </div>

        <div className="mb-7">
          <DoctorSearch
            value={search}
            onChange={setSearch}
          />
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : doctors.length === 0 ? (
          <div className="rounded-xl border border-[#e4e7ec] bg-white p-10 text-center">
            <p className="font-medium text-[#344054]">
              No doctors found
            </p>

            <p className="mt-1 text-sm text-[#98a2b3]">
              Try a different specialisation.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#687386]">
              {doctors.length} doctor
              {doctors.length !== 1 ? "s" : ""} available
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}