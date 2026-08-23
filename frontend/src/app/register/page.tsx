"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { registerUser } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "PATIENT",
      });

      router.push("/login");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm md:grid-cols-2">
          {/* Form */}
          <div className="order-2 p-7 sm:p-10 md:order-1 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-sm font-medium text-[#176b87]">
                  Get started
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-[#172033]">
                  Create your account
                </h1>

                <p className="mt-2 text-sm text-[#687386]">
                  Create a patient account to manage your appointments.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  required
                />

                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  required
                />

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  Create account
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-[#687386]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#176b87] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="order-1 hidden bg-[#176b87] p-12 text-white md:order-2 md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 font-semibold">
                  C
                </div>

                <span className="text-lg font-semibold">
                  CarePoint
                </span>
              </div>

              <h2 className="max-w-md text-4xl font-semibold leading-tight">
                Stay on top of your care.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/80">
                Keep appointments, symptoms, prescriptions and
                follow-up information together.
              </p>
            </div>

            <div className="space-y-3 text-sm text-white/75">
              <p>✓ Find doctors by specialisation</p>
              <p>✓ Book available appointment slots</p>
              <p>✓ Share symptoms before your visit</p>
              <p>✓ Access your follow-up information</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}