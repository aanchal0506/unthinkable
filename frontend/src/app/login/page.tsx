"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { loginUser, saveAuthData } from "@/lib/api/auth";
import { redirectByRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      saveAuthData(response);

      if (response.user) {
        router.push(redirectByRole(response.user.role));
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-md border border-line bg-surface shadow-card md:grid-cols-2">
          {/* Left */}
          <div className="hidden bg-pine-deep p-12 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/30 font-display text-sm">
                  C
                </span>
                <span className="font-display text-lg">CarePoint</span>
              </div>

              <h1 className="max-w-md font-display text-[32px] leading-tight">
                Healthcare appointments, without the hassle.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
                Book appointments, share symptoms before your visit, and
                keep track of your follow-up care in one place.
              </p>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-label text-white/50">
              Healthcare Appointment &amp; Follow-up Manager
            </p>
          </div>

          {/* Form */}
          <div className="p-7 sm:p-10 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="eyebrow mb-2">Welcome back</p>
                <h2 className="font-display text-2xl text-ink">Sign in to your account</h2>
                <p className="mt-2 text-sm text-ink-soft">Enter your details to continue.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                {error && <Alert tone="error">{error}</Alert>}

                <Button type="submit" loading={loading} className="w-full">
                  Sign in
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-ink-soft">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-pine hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
