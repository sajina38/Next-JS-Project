"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

export default function LoyaltyPage() {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<number | null>(null);
  const [staysCount, setStaysCount] = useState<number | null>(null);
  const [untilNext, setUntilNext] = useState<number | null>(null);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) {
      setCards(null);
      setStaysCount(null);
      setUntilNext(null);
      return;
    }
    setLoadingLoyalty(true);
    api
      .get<{
        loyalty_cards?: number;
        loyalty_stays_count?: number;
        loyalty_stays_until_next_card?: number | null;
      }>("/auth/profile/")
      .then((res) => {
        setCards(res.data.loyalty_cards ?? 0);
        setStaysCount(res.data.loyalty_stays_count ?? 0);
        setUntilNext(
          res.data.loyalty_stays_until_next_card != null ? res.data.loyalty_stays_until_next_card : null,
        );
      })
      .catch(() => {
        setCards(null);
        setStaysCount(null);
        setUntilNext(null);
      })
      .finally(() => setLoadingLoyalty(false));
  }, [mounted, user]);

  const authReady = mounted && !authLoading;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Urban Rewards</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Loyalty program</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          Every five completed stays earns one complimentary breakfast card you can apply when you book your next
          visit.
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
            <p className="text-sm font-medium text-emerald-900 mb-1">Your breakfast cards</p>
            {loadingLoyalty ? (
              <div className="h-9 w-32 bg-emerald-100/80 rounded-lg animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-bold text-emerald-900 tabular-nums">
                  {cards ?? 0}{" "}
                  <span className="text-lg font-semibold text-emerald-800">
                    {(cards ?? 0) === 1 ? "card" : "cards"}
                  </span>
                </p>
                {staysCount != null && untilNext != null ? (
                  <p className="text-sm text-emerald-800/90 mt-2">
                    <span className="font-semibold tabular-nums">{staysCount}</span> qualifying stay
                    {staysCount === 1 ? "" : "s"} so far · next card after{" "}
                    <span className="font-semibold tabular-nums">{untilNext}</span> more qualifying stay
                    {untilNext === 1 ? "" : "s"}.
                  </p>
                ) : null}
              </>
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
            <p className="text-gray-700 text-sm mb-3">Sign in to see your breakfast cards and apply one when you book.</p>
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
                <p className="font-semibold text-gray-900">Count qualifying stays</p>
                <p className="text-sm leading-relaxed mt-1">
                  Each stay that reaches <strong>confirmed</strong> or <strong>checkout</strong> counts toward your
                  total. After every <strong>5</strong> such stays, you receive <strong>1 breakfast card</strong> in
                  your account.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                2
              </span>
              <div>
                <p className="font-semibold text-gray-900">Use a card when you book</p>
                <p className="text-sm leading-relaxed mt-1">
                  On the booking form, tick <strong>Use one breakfast card</strong> if you have a balance. Breakfast is
                  complimentary at the hotel; your <strong>room rate is unchanged</strong>.
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
                  Cards and progress appear here and on{" "}
                  <Link href="/profile" className="text-emerald-700 font-semibold hover:underline">
                    My profile
                  </Link>
                  . Each booking notes when a breakfast card was requested.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-gray-50/80 px-6 py-6 mb-10">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Good to know</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Cards are recalculated from your stay history; cancelled bookings do not count.</li>
            <li>Using a card on a booking reduces your stored balance by one.</li>
            <li>Apply a card on the booking confirmation page before you submit.</li>
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
