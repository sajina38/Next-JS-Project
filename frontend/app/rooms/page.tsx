"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import RoomCard from "@/component/roomCard";
import api from "@/lib/api";

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  name: string;
  description: string;
  price: string;
  capacity: number;
  image: string | null;
  is_available: boolean;
}

type SortOption = "default" | "price-low" | "price-high";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [roomType, setRoomType] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [appliedSort, setAppliedSort] = useState<SortOption>("default");
  const [appliedType, setAppliedType] = useState("all");
  const [appliedAvailability, setAppliedAvailability] = useState("all");

  useEffect(() => {
    api
      .get("/rooms/")
      .then((res) => {
        setRooms(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const roomTypes = useMemo(() => {
    const types = [...new Set(rooms.map((r) => r.room_type))];
    return [
      { value: "all", label: "All Types" },
      ...types.map((t) => ({ value: t, label: t })),
    ];
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    let result = rooms.filter(
      (room) => appliedType === "all" || room.room_type === appliedType
    );

    if (appliedAvailability === "available") {
      result = result.filter((room) => room.is_available);
    } else if (appliedAvailability === "booked") {
      result = result.filter((room) => !room.is_available);
    }

    if (appliedSort === "price-low") {
      result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (appliedSort === "price-high") {
      result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    return result;
  }, [rooms, appliedType, appliedAvailability, appliedSort]);

  function applyFilters() {
    setAppliedSort(sortBy);
    setAppliedType(roomType);
    setAppliedAvailability(availability);
  }

  if (loading) {
    return (
      <div className="section-pad">
        <div className="container-max flex justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--muted)]">Loading rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-pad">
        <div className="container-max text-center py-20">
          <p className="text-red-500 text-lg mb-4">
            Failed to load rooms. Make sure the backend server is running.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad">
      <div className="container-max">
        <motion.h1
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          Our Rooms
        </motion.h1>

        {/* Filter Bar */}
        <motion.div
          className="card p-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Sort By */}
            <div className="min-w-[200px]">
              <label className="text-sm font-semibold text-[var(--text)] mb-2 block">
                Sort by Price
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Room Type */}
            <div className="min-w-[200px]">
              <label className="text-sm font-semibold text-[var(--text)] mb-2 block">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {roomTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="min-w-[200px]">
              <label className="text-sm font-semibold text-[var(--text)] mb-2 block">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">All Rooms</option>
                <option value="available">Available Only</option>
                <option value="booked">Booked Only</option>
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="group bg-emerald-700 text-white px-7 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/25 active:scale-[0.97] transition-all duration-300 cursor-pointer shrink-0"
            >
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Apply Filters
            </button>
          </div>
        </motion.div>

        {/* Room Listing */}
        <div className="flex flex-col gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-24px" }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.36) }}
              >
                <RoomCard
                  id={room.id}
                  title={room.name}
                  price={parseFloat(room.price)}
                  description={room.description}
                  image={room.image}
                  isAvailable={room.is_available}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="card p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[var(--muted)] text-lg">
                No rooms match your filters. Try adjusting your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
