"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, Stethoscope } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";

import { getDoctors } from "@/lib/api/doctors";
import { getStoredUser } from "@/lib/auth";
import type { Doctor } from "@/types/doctor";

export default function AdminDashboardPage() {
  const user = getStoredUser();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getDoctors();
        setDoctors(data);
      } catch (error: any) {
        setError(error?.response?.data?.message || "Unable to load doctors.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const specializations = new Set(doctors.map((d) => d.specialization)).size;

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-2">Admin portal</p>
        <h1 className="font-display text-[28px] text-ink">
          Welcome, {user?.name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="mt-1.5 text-[14.5px] text-ink-soft">
          Manage the clinic's doctors and their availability.
        </p>

        {loading ? (
          <div className="mt-8">
            <Loading />
          </div>
        ) : error ? (
          <Alert tone="error" className="mt-8">{error}</Alert>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-surface p-5">
              <p className="eyebrow">Registered doctors</p>
              <p className="mt-2 font-display text-3xl text-ink">{doctors.length}</p>
              <p className="mt-1 text-[13px] text-ink-soft">across {specializations} specialisation{specializations !== 1 ? "s" : ""}</p>
            </div>

            <Link
              href="/admin/doctors"
              className="group flex flex-col justify-between rounded-md border border-line bg-surface p-5 hover:border-pine"
            >
              <div className="flex items-center justify-between">
                <Users className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="mt-3 font-display text-[15px] text-ink">Manage doctors</p>
                <p className="mt-1 text-[13px] text-ink-soft">Add, edit, and configure availability</p>
              </div>
            </Link>
          </div>
        )}

        {!loading && !error && doctors.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 font-display text-[18px] text-ink">
              <Stethoscope className="h-4 w-4 text-pine" strokeWidth={1.75} />
              Recently added
            </h2>

            <div className="ledger overflow-hidden rounded-md border border-line bg-surface">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Specialisation</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.slice(0, 6).map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="font-sans text-ink">
                        <Link href={`/admin/doctors/${doctor.id}`} className="hover:text-pine">
                          {doctor.name}
                        </Link>
                      </td>
                      <td className="text-ink-soft">{doctor.specialization}</td>
                      <td>{doctor.consultationFee ? `₹${doctor.consultationFee}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
