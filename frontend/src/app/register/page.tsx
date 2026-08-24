"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
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

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
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
        error?.response?.data?.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "Find doctors by specialisation",
    "Book available appointment slots",
    "Share symptoms before your visit",
    "Access your follow-up information",
  ];

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-md border border-line bg-surface shadow-card md:grid-cols-2">
          {/* Form */}
          <div className="order-2 p-7 sm:p-10 md:order-1 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="eyebrow mb-2">Get started</p>
                <h1 className="font-display text-2xl text-ink">Create your account</h1>
                <p className="mt-2 text-sm text-ink-soft">
                  Create a patient account to manage your appointments.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  required
                />

                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  required
                />

                {error && <Alert tone="error">{error}</Alert>}

                <Button type="submit" loading={loading} className="w-full">
                  Create account
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-ink-soft">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-pine hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="order-1 hidden bg-pine-deep p-12 text-white md:order-2 md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/30 font-display text-sm">
                  C
                </span>
                <span className="font-display text-lg">CarePoint</span>
              </div>

              <h2 className="max-w-md font-display text-[30px] leading-tight">
                Stay on top of your care.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
                Keep appointments, symptoms, prescriptions and follow-up
                information together.
              </p>
            </div>

            <div className="space-y-3 text-sm text-white/80">
              {perks.map((perk) => (
                <p key={perk} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {perk}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
