"use client";

import Link from "next/link";
import { Search, ClipboardList, Info, ArrowRight } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { getStoredUser } from "@/lib/auth";

export default function DashboardPage() {
  const user = getStoredUser();

  return (
    <AppShell allow={["PATIENT"]}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow mb-2">Patient portal</p>
          <h1 className="font-display text-[28px] text-ink">Your healthcare overview</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-soft">
            Manage your appointments and keep your care information organised.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/doctors"
            className="group rounded-md border border-line bg-surface p-5 transition-colors hover:border-pine"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong bg-pine-wash text-pine">
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </div>

            <h2 className="mt-5 font-display text-[16px] text-ink">Find a doctor</h2>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Search doctors by specialisation and find an available
              appointment.
            </p>

            <p className="mt-4 flex items-center gap-1 text-sm font-medium text-pine">
              Browse doctors
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>

          <Link
            href="/appointments"
            className="group rounded-md border border-line bg-surface p-5 transition-colors hover:border-pine"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong bg-paper text-ink-soft">
              <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
            </div>

            <h2 className="mt-5 font-display text-[16px] text-ink">My appointments</h2>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
              View your upcoming appointments and previous visits.
            </p>

            <p className="mt-4 flex items-center gap-1 text-sm font-medium text-pine">
              View appointments
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>

          <div className="rounded-md border border-line bg-surface p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-amber/30 bg-amber-wash text-amber">
              <Info className="h-4 w-4" strokeWidth={1.75} />
            </div>

            <h2 className="mt-5 font-display text-[16px] text-ink">Before your visit</h2>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
              You can share your symptoms before an appointment so your
              doctor has more context — and gets an AI-prepared summary
              ahead of time.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-md border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-[16px] text-ink">Your account</h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Name</p>
              <p className="mt-1 text-sm text-ink">{user?.name || "—"}</p>
            </div>

            <div>
              <p className="eyebrow">Email</p>
              <p className="mt-1 font-mono text-sm text-ink">{user?.email || "—"}</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
