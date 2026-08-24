"use client";

import { useEffect, useState } from "react";
import { UserX } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorSearch from "@/components/doctors/DoctorSearch";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

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

        const data = await getDoctors(search.trim() || undefined);

        setDoctors(data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Unable to load doctors."
        );
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadDoctors, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <AppShell allow={["PATIENT"]}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <p className="eyebrow mb-2">Find care</p>
          <h1 className="font-display text-[28px] text-ink">Find a doctor</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-soft">
            Search for a doctor by their area of specialisation.
          </p>
        </div>

        <div className="mb-7 max-w-md">
          <DoctorSearch value={search} onChange={setSearch} />
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line-strong bg-surface/50 p-10 text-center">
            <UserX className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
            <p className="font-display text-[16px] text-ink">No doctors found</p>
            <p className="text-sm text-ink-soft">Try a different specialisation.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 font-mono text-[12.5px] text-ink-faint">
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} available
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
