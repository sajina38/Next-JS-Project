"use client";

import { useState, useEffect, useMemo } from "react";
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
  image: string;
  is_available: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 15000]);
  const [roomType, setRoomType] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: [1000, 15000] as [number, number],
    roomType: "all",
  });

  useEffect(() => {
    console.log("Fetching rooms from:", "http://localhost:8000/api/rooms/");
    api
      .get("/rooms/")
      .then((res) => {
        console.log("Backend response:", res.data);
        setRooms(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
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
    return rooms.filter((room) => {
      const price = parseFloat(room.price);
      const inPrice =
        price >= appliedFilters.priceRange[0] &&
        price <= appliedFilters.priceRange[1];
      const inType =
        appliedFilters.roomType === "all" ||
        room.room_type === appliedFilters.roomType;
      return inPrice && inType;
    });
  }, [rooms, appliedFilters]);

  function applyFilters() {
    setAppliedFilters({ priceRange, roomType });
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
        <h1 className="text-3xl font-bold mb-8">Our Rooms</h1>

        {/* Filter Bar */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
            {/* Price Range */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-[var(--text)] mb-2 block">
                Price Range (per night)
              </label>
              <input
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                <span>Rs. {priceRange[0].toLocaleString()}</span>
                <span>Rs. {priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Room Type */}
            <div className="min-w-[180px]">
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

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-emerald-800 transition-colors shrink-0 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
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
        </div>

        {/* Room Listing */}
        <div className="flex flex-col gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                title={room.name}
                price={parseFloat(room.price)}
                description={room.description}
                image={room.image}
              />
            ))
          ) : (
            <div className="card p-12 text-center">
              <p className="text-[var(--muted)] text-lg">
                No rooms match your filters. Try adjusting your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
