"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getStoredUser } from "@/lib/auth";

export default function DashboardPage() {
  const user = getStoredUser();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#176b87]">
            Patient portal
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[#172033]">
            Your healthcare overview
          </h1>

          <p className="mt-2 text-sm text-[#687386]">
            Manage your appointments and keep your care information
            organised.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/doctors"
            className="group rounded-xl border border-[#e4e7ec] bg-white p-5 transition hover:border-[#b8d5dc] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf6f8] text-lg text-[#176b87]">
              +
            </div>

            <h2 className="mt-5 font-semibold text-[#172033]">
              Find a doctor
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              Search doctors by specialisation and find an available
              appointment.
            </p>

            <p className="mt-4 text-sm font-medium text-[#176b87] group-hover:underline">
              Browse doctors →
            </p>
          </Link>

          <Link
            href="/appointments"
            className="group rounded-xl border border-[#e4e7ec] bg-white p-5 transition hover:border-[#b8d5dc] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3f6] text-lg text-[#344054]">
              ▣
            </div>

            <h2 className="mt-5 font-semibold text-[#172033]">
              My appointments
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              View your upcoming appointments and previous visits.
            </p>

            <p className="mt-4 text-sm font-medium text-[#176b87] group-hover:underline">
              View appointments →
            </p>
          </Link>

          <div className="rounded-xl border border-[#e4e7ec] bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f8f1e7] text-lg text-[#8a5a20]">
              i
            </div>

            <h2 className="mt-5 font-semibold text-[#172033]">
              Before your visit
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              You can share your symptoms before an appointment so
              your doctor has more context.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-[#e4e7ec] bg-white">
          <div className="border-b border-[#e4e7ec] px-5 py-4">
            <h2 className="font-semibold text-[#172033]">
              Your account
            </h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
                Name
              </p>

              <p className="mt-1 text-sm text-[#344054]">
                {user?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
                Email
              </p>

              <p className="mt-1 text-sm text-[#344054]">
                {user?.email || "—"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}