"use client";

import { useState } from "react";
import { getStoredUser } from "@/lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const user = getStoredUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#e4e7ec] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#667085] hover:bg-[#f7f8fa] lg:hidden"
          aria-label="Open menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-[#172033]">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
          </p>

          <p className="text-xs text-[#98a2b3]">
            Here’s what’s happening today.
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu((value) => !value)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[#f7f8fa]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f2f5] text-sm font-semibold text-[#176b87]">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-[#172033]">
              {user?.name || "User"}
            </p>

            <p className="text-xs capitalize text-[#98a2b3]">
              {user?.role?.toLowerCase() || "patient"}
            </p>
          </div>

          <span className="hidden text-xs text-[#98a2b3] sm:block">
            ▾
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12 z-30 w-48 rounded-lg border border-[#e4e7ec] bg-white p-1.5 shadow-lg">
            <button
              onClick={() => setShowMenu(false)}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-[#667085] hover:bg-[#f7f8fa]"
            >
              Account settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}