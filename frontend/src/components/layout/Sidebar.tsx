"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Find a doctor",
      href: "/doctors",
      icon: "⌕",
    },
    {
      label: "My appointments",
      href: "/appointments",
      icon: "▣",
    },
  ];

  const doctorLinks = [
    {
      label: "Dashboard",
      href: "/doctor",
      icon: "⌂",
    },
    {
      label: "Appointments",
      href: "/doctor/appointments",
      icon: "▣",
    },
    {
      label: "Patients",
      href: "/doctor/patients",
      icon: "♙",
    },
    {
      label: "Availability",
      href: "/doctor/availability",
      icon: "◷",
    },
  ];

  const adminLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: "⌂",
    },
    {
      label: "Doctors",
      href: "/admin/doctors",
      icon: "♙",
    },
  ];

  const links =
    user?.role === "ADMIN"
      ? adminLinks
      : user?.role === "DOCTOR"
        ? doctorLinks
        : patientLinks;

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close menu"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-[#e4e7ec] bg-white
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center border-b border-[#e4e7ec] px-5">
          <Link
            href={
              user?.role === "ADMIN"
                ? "/admin"
                : user?.role === "DOCTOR"
                  ? "/doctor"
                  : "/dashboard"
            }
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176b87] text-sm font-semibold text-white">
              C
            </div>

            <div>
              <p className="text-sm font-semibold text-[#172033]">
                CarePoint
              </p>

              <p className="text-[11px] text-[#98a2b3]">
                Healthcare Manager
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 py-6">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#98a2b3]">
            Menu
          </p>

          <nav className="mt-3 space-y-1">
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
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-sm transition-colors
                    ${
                      active
                        ? "bg-[#edf6f8] font-medium text-[#176b87]"
                        : "text-[#667085] hover:bg-[#f7f8fa] hover:text-[#172033]"
                    }
                  `}
                >
                  <span className="w-5 text-center text-base">
                    {link.icon}
                  </span>

                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#e4e7ec] p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-[#172033]">
              {user?.name || "User"}
            </p>

            <p className="mt-0.5 text-xs capitalize text-[#98a2b3]">
              {user?.role?.toLowerCase() || "patient"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#667085] hover:bg-red-50 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}