import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <nav className="border-b border-[#e4e7ec] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176b87] text-sm font-semibold text-white">
              C
            </div>

            <span className="font-semibold text-[#172033]">
              CarePoint
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#344054]"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#176b87] px-4 py-2 text-sm font-medium text-white hover:bg-[#11556b]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#176b87]">
            Healthcare, made simpler
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#172033] sm:text-5xl lg:text-6xl">
            Appointments and follow-up care in one place.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#687386]">
            Find the right doctor, book an appointment, share your
            symptoms beforehand and stay informed after your visit.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-[#176b87] px-5 py-3 text-sm font-medium text-white hover:bg-[#11556b]"
            >
              Create patient account
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-[#d9dee7] bg-white px-5 py-3 text-sm font-medium text-[#344054] hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-5 border-t border-[#e4e7ec] pt-10 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-[#172033]">
              Find a doctor
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              Search doctors by their specialisation and view
              available appointment slots.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#172033]">
              Prepare for your visit
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              Share your symptoms in advance so your doctor has
              useful context before the appointment.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#172033]">
              Keep track of follow-up
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              View consultation notes, prescriptions and
              patient-friendly follow-up information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}