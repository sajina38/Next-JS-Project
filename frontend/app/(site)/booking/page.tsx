"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

export default function Booking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "admin" || user.role === "manager") {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/manager/dashboard");
    }
  }, [authLoading, user, router]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    roomType: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);
    setSuccess(false);
    try {
      await api.post("/bookings/", {
        room: 1,
        guest_name: formData.name,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
      });
      setSuccess(true);
      setFormData({ name: "", email: "", checkIn: "", checkOut: "", roomType: "" });
    } catch {
      setSubmitError("Booking failed. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (user.role === "admin" || user.role === "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Redirecting…</p>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center p-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
        Book Your Stay
        </h1>
        <p className="text-gray-600 mb-10 text-center max-w-2xl">
        Experience the elegance of Urban Boutique Hotel. Fill in your details
        below to reserve your perfect stay.
        </p>

        {success && (
          <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg mb-6 w-full max-w-2xl">
            Booking confirmed successfully!
          </div>
        )}
        {submitError && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg mb-6 w-full max-w-2xl">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-50 shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-4">
        {/* "space-y-4" le space dincha div haru ko bich */}
        {/* "focus:ring-2 focus:ring-emerald-600" le glowing blue line banaucha when clicked */}
            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Email</label>
                <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter your email"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* md:flex row garda desktop view ma row dekhaucha */}
                <div className="flex-1">
                <label className="text-gray-700 font-semibold mb-2">
                Check-in Date
                </label>
                <input
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                type="date" 
                // mm/dd/yy and calendar dincha
                className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                </div>

                <div className="flex-1">
                <label className="text-gray-700 font-semibold mb-2">
                Check-out Date
                </label>
                <input
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                type="date"
                className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Room Type</label>
                {/* <input>
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                
                </> */}
                <select className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600">
                    <option value="formData.roomType">Deluxe Room</option>
                    <option value="formData.roomType">Suite</option>
                    <option value="formData.roomType">Family Room</option>
                </select>
            </div>

            <button
            type="submit"
            disabled={submitLoading}
            className="bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {submitLoading ? "Booking..." : "Confirm Booking"}
            </button>
        </form>
    </div>
    );
}
