"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

export default function LoyaltyPage() {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) {
      setPoints(null);
      return;
    }
    setLoadingPoints(true);
    api
      .get<{ loyalty_points?: number }>("/auth/profile/")
      .then((res) => setPoints(res.data.loyalty_points ?? 0))
      .catch(() => setPoints(null))
      .finally(() => setLoadingPoints(false));
  }, [mounted, user]);

  const authReady = mounted && !authLoading;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Urban Rewards</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Loyalty program</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          Stay with us, earn points on every confirmed booking, and save on your next visit.
        </p>

        {!authReady && (
          <div
            className="rounded-2xl border border-gray-100 bg-gray-50/90 px-6 py-6 mb-10 min-h-[132px] flex items-center justify-center"
            aria-busy="true"
          >
            <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
          </div>
        )}

        {authReady && user && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-6 mb-10">
            <p className="text-sm font-medium text-emerald-900 mb-1">Your balance</p>
            {loadingPoints ? (
              <div className="h-9 w-32 bg-emerald-100/80 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-emerald-900 tabular-nums">
                {points ?? 0} <span className="text-lg font-semibold text-emerald-800">points</span>
              </p>
            )}
            <Link
              href="/profile"
              className="inline-flex mt-4 text-sm font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              View profile &amp; booking history →
            </Link>
          </div>
        )}

        {authReady && !user && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 mb-10 shadow-sm">
            <p className="text-gray-700 text-sm mb-3">Sign in to see your points balance and redeem on checkout.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        )}

        <section className="space-y-8 mb-12">
          <h2 className="text-lg font-bold text-gray-900">How it works</h2>
          <ul className="space-y-5 text-gray-700">
            <li className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                1
              </span>
              <div>
                <p className="font-semibold text-gray-900">Earn points</p>
                <p className="text-sm leading-relaxed mt-1">
                  When your booking is <strong>confirmed</strong> (after online payment or when the hotel confirms a pay-at-desk stay), you earn{" "}
                  <strong>1 point for every Rs. 50</strong> spent on that booking&apos;s total.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                2
              </span>
              <div>
                <p className="font-semibold text-gray-900">Redeem on your next booking</p>
                <p className="text-sm leading-relaxed mt-1">
                  With <strong>100 points or more</strong>, you can apply loyalty credit when you book:{" "}
                  <strong>100 points = Rs. 100 off</strong> per block. Discounts apply in full Rs. 100 steps and cannot exceed your stay total.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                3
              </span>
              <div>
                <p className="font-semibold text-gray-900">Track everything</p>
                <p className="text-sm leading-relaxed mt-1">
                  Your balance appears here and on <Link href="/profile" className="text-emerald-700 font-semibold hover:underline">My profile</Link>. Each booking shows any loyalty credit you used.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-gray-50/80 px-6 py-6 mb-10">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Good to know</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Points are added only once per confirmed booking.</li>
            <li>Cancelled stays do not earn points.</li>
            <li>Redeem when you complete the booking form (checkbox on checkout).</li>
          </ul>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/rooms"
            className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors shadow-sm"
          >
            Browse rooms
          </Link>
          {authReady && user ? (
            <Link
              href="/profile"
              className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-gray-300 text-gray-800 font-semibold text-sm hover:bg-white transition-colors"
            >
              My profile
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
