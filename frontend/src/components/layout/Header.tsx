"use client";

import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";

import { getStoredUser } from "@/lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const user = getStoredUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-sm p-2 text-ink-soft hover:bg-paper lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-ink">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
          </p>

          <p className="eyebrow mt-0.5 normal-case tracking-normal text-ink-faint">
            Here's what's happening today
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu((value) => !value)}
          className="flex items-center gap-3 rounded-sm px-2 py-1.5 hover:bg-paper"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong bg-pine-wash font-display text-sm font-medium text-pine-deep">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-ink">
              {user?.name || "User"}
            </p>

            <p className="font-mono text-[11px] uppercase tracking-label text-ink-faint">
              {user?.role?.toLowerCase() || "patient"}
            </p>
          </div>

          <ChevronDown className="hidden h-3.5 w-3.5 text-ink-faint sm:block" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12 z-30 w-48 rounded-sm border border-line bg-surface p-1.5 shadow-raised">
            <a
              href="/settings"
              className="block w-full rounded-sm px-3 py-2 text-left text-sm text-ink-soft hover:bg-paper"
            >
              Calendar & settings
            </a>
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
