import type { User } from "@/types/auth";

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const clearAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

export const redirectByRole = (role: User["role"]) => {
  switch (role) {
    case "ADMIN":
      return "/admin";

    case "DOCTOR":
      return "/doctor";

    case "PATIENT":
    default:
      return "/dashboard";
  }
};