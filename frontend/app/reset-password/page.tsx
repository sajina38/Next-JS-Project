"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin" />
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
    <div className="min-h-screen flex font-auth">
      <div
        className="hidden lg:flex lg:w-[45%] relative bg-cover bg-center"
        style={{ backgroundImage: "url('/room1.png')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div>
            <Image src="/logo.png" alt="Urban Boutique" width={120} height={40} className="drop-shadow-lg" />
          </div>
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 tracking-tight">Choose a new password</h2>
            <p className="text-white/90 text-lg max-w-md leading-relaxed">
              Pick a strong password you haven&apos;t used here before.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-gray-50">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Set new password</h1>
          <p className="text-gray-600 mb-8">
            {done
              ? "You can now sign in with your new password."
              : "Enter and confirm your new password below."}
          </p>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          {done ? (
            <Link
              href="/login"
              className="inline-flex w-full justify-center items-center gap-2 bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-medium"
            >
              Go to login
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || invalidLink}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
              <p className="text-center text-sm text-gray-600">
                <Link href="/login/forgot-password" className="text-emerald-700 font-semibold hover:underline">
                  Request a new link
                </Link>
                {" · "}
                <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </form>
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
