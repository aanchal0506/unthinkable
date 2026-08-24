import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Doctor } from "@/types/doctor";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({
  doctor,
}: DoctorCardProps) {
  return (
    <div className="flex flex-col rounded-md border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-pine-wash font-display text-base font-medium text-pine-deep">
          {doctor.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-display text-[17px] text-ink">
            {doctor.name}
          </h2>

          <p className="mt-0.5 text-[13.5px] text-pine">
            {doctor.specialization}
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-2 border-t border-line pt-4">
        {doctor.qualification && (
          <div className="flex justify-between gap-4 text-[13px]">
            <span className="text-ink-faint">Qualification</span>
            <span className="text-right font-mono text-ink-soft">{doctor.qualification}</span>
          </div>
        )}

        {doctor.experience !== null && doctor.experience !== undefined && (
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-faint">Experience</span>
            <span className="font-mono text-ink-soft">{doctor.experience} yrs</span>
          </div>
        )}

        {doctor.consultationFee !== null && doctor.consultationFee !== undefined && (
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-faint">Consultation</span>
            <span className="font-mono font-medium text-ink">₹{doctor.consultationFee}</span>
          </div>
        )}
      </div>

      <Link
        href={`/doctors/${doctor.id}`}
        className="mt-5 flex items-center justify-center gap-1.5 rounded-sm border border-line-strong px-4 py-2.5 text-center text-sm font-medium text-pine transition-colors hover:bg-pine-wash"
      >
        View doctor
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
