import Link from "next/link";
import type { Doctor } from "@/types/doctor";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({
  doctor,
}: DoctorCardProps) {
  return (
    <div className="rounded-xl border border-[#e4e7ec] bg-white p-5 transition hover:border-[#b8d5dc] hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e7f2f5] text-lg font-semibold text-[#176b87]">
          {doctor.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-semibold text-[#172033]">
            {doctor.name}
          </h2>

          <p className="mt-1 text-sm text-[#176b87]">
            {doctor.specialization}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {doctor.qualification && (
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-[#98a2b3]">
              Qualification
            </span>

            <span className="text-right text-[#344054]">
              {doctor.qualification}
            </span>
          </div>
        )}

        {doctor.experience !== null &&
          doctor.experience !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-[#98a2b3]">
                Experience
              </span>

              <span className="text-[#344054]">
                {doctor.experience} years
              </span>
            </div>
          )}

        {doctor.consultationFee !== null &&
          doctor.consultationFee !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-[#98a2b3]">
                Consultation
              </span>

              <span className="font-medium text-[#344054]">
                ₹{doctor.consultationFee}
              </span>
            </div>
          )}
      </div>

      <Link
        href={`/doctors/${doctor.id}`}
        className="mt-5 block rounded-lg border border-[#d9dee7] px-4 py-2.5 text-center text-sm font-medium text-[#176b87] transition hover:bg-[#edf6f8]"
      >
        View doctor
      </Link>
    </div>
  );
}