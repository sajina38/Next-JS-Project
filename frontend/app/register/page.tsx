"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const nameParts = formData.name.trim().split(" ");
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: Record<string, string[]> } }).response?.data
      ) {
        const data = (err as { response: { data: Record<string, string[]> } }).response.data;
        const first = Object.values(data)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-auth">
      {/* Left - Photo section */}
      <div
        className="hidden lg:flex lg:w-[45%] relative bg-cover bg-center"
        style={{ backgroundImage: "url('/room1.png')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div>
            <Image
              src="/logo.png"
              alt="Urban Boutique"
              width={120}
              height={40}
              className="drop-shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 tracking-tight">
              Experience the art of modern luxury
            </h2>
            <p className="text-white/90 text-lg max-w-md leading-relaxed">
              Join our exclusive circle and unlock a world of bespoke hospitality,
              curated experiences, and member-only rewards.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-sm font-medium"
                  >
                    ?
                  </div>
                ))}
              </div>
              <span className="text-white/90 text-sm">
                Join 5,000+ members worldwide
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 mb-8">
            Start your journey with us today.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sajina Gurung"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="sajina_gurung"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sajina.gurung@email.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977 980-0000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="#" className="text-blue-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
