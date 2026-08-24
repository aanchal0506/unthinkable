"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated, getStoredUser, redirectByRole } from "@/lib/auth";
import Loading from "@/components/ui/Loading";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Restrict this route to specific roles. Omit to allow any authenticated user. */
  allow?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allow,
}: ProtectedRouteProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const user = getStoredUser();

    if (allow && (!user || !allow.includes(user.role))) {
      router.replace(user ? redirectByRole(user.role) : "/login");
      return;
    }

    setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (checking) {
    return <Loading />;
  }

  return <>{children}</>;
}
