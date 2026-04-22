"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-700 rounded-full animate-spin" />
    </div>
  );
}

function SuccessCheckIcon() {
  return (
    <div
      className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50"
      aria-hidden
    >
      <svg className="h-8 w-8 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!uid || !token) {
      setError("This reset link is missing required information. Please use the link from your email.");
    }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!uid || !token) return;

    setLoading(true);
    try {
      await api.post("/auth/password-reset/confirm/", {
        uid,
        token,
        new_password: password,
        new_password_confirm: password2,
      });
      setDone(true);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, string[] | string> } };
      const d = ax.response?.data;
      if (d && typeof d === "object") {
        if (typeof d.detail === "string") {
          setError(d.detail);
          return;
        }
        if (Array.isArray(d.new_password)) {
          setError(d.new_password.join(" "));
          return;
        }
        if (typeof d.new_password === "string") {
          setError(d.new_password);
          return;
        }
      }
      setError("Could not reset your password. The link may have expired—request a new one.");
    } finally {
      setLoading(false);
    }
  };

  const invalidLink = !uid || !token;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-stone-900 antialiased">
      {/* Mobile header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200/80 bg-white px-4 py-3 lg:hidden">
        <Image src="/logo.png" alt="Urban Boutique Hotel" width={100} height={34} className="object-contain" />
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
          {done ? "Done" : "Reset"}
        </span>
      </header>

      {/* Left: hero */}
      <div className="relative hidden min-h-0 flex-1 lg:flex lg:max-w-[46%] lg:flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/room1.png')" }}
        />
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            done
              ? "bg-gradient-to-br from-emerald-950/88 via-stone-900/80 to-stone-950/90"
              : "bg-gradient-to-br from-black/65 via-black/55 to-black/60"
          }`}
        />
        <div className="relative z-10 flex min-h-[min(100vh,720px)] flex-col justify-between p-8 text-white xl:p-12">
          <div>
            <Image
              src="/logo.png"
              alt="Urban Boutique Hotel"
              width={128}
              height={42}
              className="drop-shadow-lg"
            />
          </div>
          <div className="max-w-lg">
            {done ? (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                  All set
                </p>
                <h2 className="font-sans text-3xl font-bold tracking-tight text-white xl:text-4xl">
                  Your password was updated
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/85">
                  You can close this tab or continue to sign in. For security, older sessions may need you to log in
                  again.
                </p>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Security
                </p>
                <h2 className="font-sans text-3xl font-bold tracking-tight text-white xl:text-4xl">
                  Choose a new password
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/85">
                  Pick a strong password you haven&apos;t used on this site before. You&apos;ll need it the next time
                  you sign in.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: form / success */}
      <div className="flex flex-1 flex-col justify-center bg-gradient-to-b from-stone-100 to-stone-50 px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div
          className={`mx-auto w-full max-w-md transition-shadow duration-300 ${
            done
              ? "rounded-2xl border border-emerald-100/80 bg-white p-8 shadow-xl shadow-emerald-900/10 sm:p-10"
              : "rounded-2xl border border-stone-200/80 bg-white p-8 shadow-lg shadow-stone-900/5 sm:p-9"
          }`}
        >
          {done ? (
            <>
              <SuccessCheckIcon />
              <h1 className="text-center font-sans text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Successfully changed password
              </h1>
              <p className="mt-3 text-center text-sm leading-relaxed text-stone-600 sm:text-base">
                You can now sign in with your new password.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-800/20 transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  Go to login
                </Link>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Back to home
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Set new password
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                Enter and confirm your new password below.
              </p>

              {error && (
                <div
                  className="mt-6 rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    disabled={invalidLink}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={6}
                    disabled={invalidLink}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-stone-900 placeholder:text-stone-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || invalidLink}
                  className="w-full rounded-full bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-800/15 transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
                <p className="text-center text-sm text-stone-500">
                  <Link href="/login/forgot-password" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
                    Request a new link
                  </Link>
                  <span className="mx-2 text-stone-300">·</span>
                  <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
                    Login
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
