"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/manager/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/manager/reports", label: "Reports", icon: "chart" },
  { href: "/manager/rooms", label: "Rooms", icon: "door" },
  { href: "/manager/bookings", label: "Bookings", icon: "calendar" },
  { href: "/manager/payments", label: "Payments", icon: "billing" },
  { href: "/manager/settings", label: "Settings", icon: "settings" },
  {
    href: "/",
    label: "View site",
    icon: "globe",
    newTab: true,
  },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const cls = "w-5 h-5";
  if (name === "calendar")
    return (
      <svg
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
        />
      </svg>
    );
  if (name === "billing")
    return (
      <svg
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
        />
      </svg>
    );
  if (name === "settings")
    return (
      <svg
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.37.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    );
  if (name === "grid")
    return (
      <svg
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 8.25 20.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
        />
      </svg>
    );
  if (name === "chart")
    return (
      <svg
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    );
  if (name === "globe")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    );
  return (
    <svg
      className={cls}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5M3.75 3.75h15M3.75 3.75v11.25c0 .621.504 1.125 1.125 1.125h14.25M3.75 3.75 3 3.75v-1.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 .75.75v1.5m-18 0h18"
      />
    </svg>
  );
}

export default function ManagerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "manager") {
      router.replace("/");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading || !user || user.role !== "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
      </div>
    );
  }

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

  return (
    <div className="min-h-screen bg-stone-100 flex font-[var(--font-inter)]">
      <aside className="w-64 shrink-0 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-stone-100">
          <Link href="/manager/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Urban Boutique Hotel"
              width={44}
              height={44}
              className="object-contain"
            />
            <div>
              <p className="text-sm font-bold text-stone-900 leading-tight">
                Urban Boutique Hotel
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const opensNewTab = "newTab" in item && item.newTab;
            const active =
              !opensNewTab && (pathname === item.href || pathname?.startsWith(item.href + "/"));
            const rowClass = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-emerald-50 text-emerald-800" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`;
            const iconClass = active ? "text-emerald-700" : "text-stone-400";
            if (opensNewTab) {
              return (
                <a
                  key="nav-customer-facing"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={rowClass}
                  title="Opens in a new browser tab for reference only"
                >
                  <span className={iconClass}>
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={item.href} href={item.href} className={rowClass}>
                <span className={iconClass}>
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-3">
          <div className="px-2">
            <p className="text-sm font-semibold text-stone-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-stone-500 truncate">{user.email}</p>
            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
              manager
            </span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-red-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}
