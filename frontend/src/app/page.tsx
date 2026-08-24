import Link from "next/link";
import { Search, FileText, ClipboardCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      <nav className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-pine font-display text-sm text-pine">
              C
            </span>
            <span className="font-display text-[17px] text-ink">CarePoint</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-sm bg-pine px-4 py-2 text-sm font-medium text-white hover:bg-pine-deep"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Healthcare, kept plainly</p>

          <h1 className="font-display text-[44px] leading-[1.1] text-ink sm:text-[56px]">
            Appointments and follow-up care in one docket.
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Find the right doctor, book an appointment, share your symptoms
            beforehand, and stay informed after your visit — confirmations,
            reminders, and notes kept together.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-sm bg-pine px-5 py-3 text-sm font-medium text-white hover:bg-pine-deep"
            >
              Create patient account
            </Link>

            <Link
              href="/login"
              className="rounded-sm border border-line-strong bg-surface px-5 py-3 text-sm font-medium text-ink hover:border-pine hover:text-pine"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          <div>
            <Search className="h-5 w-5 text-pine" strokeWidth={1.5} />
            <h3 className="mt-3 font-display text-[17px] text-ink">Find a doctor</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Search doctors by their specialisation and view available
              appointment slots.
            </p>
          </div>

          <div>
            <FileText className="h-5 w-5 text-pine" strokeWidth={1.5} />
            <h3 className="mt-3 font-display text-[17px] text-ink">Prepare for your visit</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Share your symptoms in advance so your doctor has useful
              context before the appointment.
            </p>
          </div>

          <div>
            <ClipboardCheck className="h-5 w-5 text-pine" strokeWidth={1.5} />
            <h3 className="mt-3 font-display text-[17px] text-ink">Keep track of follow-up</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              View consultation notes, prescriptions and patient-friendly
              follow-up information after every visit.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
