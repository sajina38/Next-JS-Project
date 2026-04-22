"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

function KhaltiReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState("Confirming your payment…");
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === "admin" || user?.role === "manager") {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/manager/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || user?.role === "admin" || user?.role === "manager") return;

    const bookingId = searchParams.get("booking_id");
    const pidx =
      searchParams.get("pidx") ||
      searchParams.get("Pidx") ||
      searchParams.get("payment_id");

    if (!bookingId || !pidx) {
      setOk(false);
      setMessage(
        "Missing payment details in the URL. If you closed the Khalti page early, your booking may still be unpaid."
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post("/payments/khalti/verify/", {
          booking_id: Number(bookingId),
          pidx,
        });
        if (cancelled) return;
        if (data.ok) {
          setOk(true);
          setMessage("Payment successful. Your booking is now confirmed.");
        } else {
          setOk(false);
          setMessage(data.message || "Payment was not completed.");
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const ax = e as { response?: { data?: { error?: string } } };
        setOk(false);
        setMessage(ax.response?.data?.error || "Could not verify payment. Try again or contact us.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, authLoading, user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="text-center max-w-md">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            ok === true ? "bg-green-100" : ok === false ? "bg-amber-100" : "bg-gray-100"
          }`}
        >
          {ok === true ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : ok === false ? (
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment status</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <Link
          href="/rooms"
          className="px-6 py-3 bg-emerald-700 text-white rounded-full font-medium hover:bg-emerald-800 transition-colors inline-block"
        >
          Back to rooms
        </Link>
      </div>
    </div>
  );
}

export default function KhaltiReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      }
    >
      <KhaltiReturnContent />
    </Suspense>
  );
}
