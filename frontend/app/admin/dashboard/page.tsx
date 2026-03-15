"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user.email}</p>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Admin management features will appear here.</p>
        </div>
      </div>
    </div>
  );
}
