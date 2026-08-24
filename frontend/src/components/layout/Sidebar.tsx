"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  CalendarOff,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { clearAuth, getStoredUser } from "@/lib/auth";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const user = getStoredUser();

  const patientLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Find a doctor", href: "/doctors", icon: Search },
    { label: "My appointments", href: "/appointments", icon: ClipboardList },
    { label: "Calendar & settings", href: "/settings", icon: Settings },
  ];

  const doctorLinks = [
    { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { label: "Appointments", href: "/doctor/appointments", icon: ClipboardList },
    { label: "Leave", href: "/doctor/leaves", icon: CalendarOff },
    { label: "Calendar & settings", href: "/settings", icon: Settings },
  ];

  const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Doctors", href: "/admin/doctors", icon: Users },
  ];

  const links =
    user?.role === "ADMIN"
      ? adminLinks
      : user?.role === "DOCTOR"
        ? doctorLinks
        : patientLinks;

  const homeHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "DOCTOR"
        ? "/doctor"
        : "/dashboard";

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          aria-label="Close menu"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-pine-deep text-white
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link
            href={homeHref}
            className="flex items-center gap-2.5"
            onClick={onClose}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-white/30 font-display text-sm">
              C
            </span>

            <div>
              <p className="font-display text-white text-[15px] leading-none">CarePoint</p>
              <p className="mt-1 font-mono text-[9.5px] uppercase tracking-label text-white/45">
                {user?.role?.toLowerCase() || "patient"} portal
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-sm p-1 text-white/60 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`
                  mb-1 flex items-center gap-2.5 rounded-sm px-3 py-2
                  text-[13.5px] transition-colors
                  ${
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <link.icon className="h-4 w-4" strokeWidth={1.75} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || "User"}
            </p>

            <p className="mt-0.5 truncate font-mono text-[11px] text-white/70">
              {user?.email || ""}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[13.5px] text-white/65 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
