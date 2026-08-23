"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
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
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-2xl border border-[#e4e7ec] bg-white shadow-sm md:grid-cols-2">
          {/* Left */}
          <div className="hidden bg-[#176b87] p-12 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 font-semibold">
                  C
                </div>

                <span className="text-lg font-semibold">
                  CarePoint
                </span>
              </div>

              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Healthcare appointments, without the hassle.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/80">
                Book appointments, share symptoms before your visit,
                and keep track of your follow-up care in one place.
              </p>
            </div>

            <p className="text-sm text-white/60">
              Healthcare Appointment & Follow-up Manager
            </p>
          </div>

          {/* Form */}
          <div className="p-7 sm:p-10 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-sm font-medium text-[#176b87]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#172033]">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm text-[#687386]">
                  Enter your details to continue.
                </p>
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
                  Sign in
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-[#687386]">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[#176b87] hover:underline"
                >
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