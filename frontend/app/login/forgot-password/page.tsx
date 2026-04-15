"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [serverWarning, setServerWarning] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("email");
    if (q) setEmail(decodeURIComponent(q));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setServerWarning("");
    setLoading(true);
    try {
      const { data } = await api.post<{ detail?: string; warning?: string }>("/auth/password-reset/", {
        email: email.trim(),
      });
      setSent(true);
      if (data?.warning) setServerWarning(data.warning);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-auth">
      <div
        className="hidden lg:flex lg:w-[45%] relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ec/47/a4/caption.jpg?w=1400&h=-1&s=1')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div>
            <Image src="/logo.png" alt="Urban Boutique" width={120} height={40} className="drop-shadow-lg" />
          </div>
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 tracking-tight">Forgot your password?</h2>
            <p className="text-white/90 text-lg max-w-md leading-relaxed">
              Enter the email on your account and we&apos;ll send you a link to reset your password.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-gray-50">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Reset password</h1>
          <p className="text-gray-600 mb-8">
            {sent
              ? "Check your inbox for an email with a reset link. You can close this page."
              : "We’ll email you a secure link to choose a new password."}
          </p>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          {sent ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-800 text-sm p-4 rounded-lg border border-emerald-100">
                If an account exists for that address, reset instructions were sent. The link expires
                after use or after a period of time for security.
              </div>
              {serverWarning ? (
                <div className="bg-amber-50 text-amber-900 text-sm p-4 rounded-lg border border-amber-200">
                  {serverWarning}
                </div>
              ) : null}
              <Link
                href="/login"
                className="inline-flex w-full justify-center items-center gap-2 bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-gray-500 -mt-2 mb-1">
                Use the same email address as on your hotel account (the one you log in with).
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <p className="text-center text-sm text-gray-600">
                <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
