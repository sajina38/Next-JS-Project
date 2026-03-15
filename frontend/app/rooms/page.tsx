"use client";

import { useState, useMemo } from "react";
import RoomCard from "@/component/roomCard";

const rooms = [
  {
    title: "Deluxe Room",
    price: 5400,
    description:
      "A spacious and elegant room designed with modern aesthetics. Enjoy breathtaking city views from your private balcony and premium amenities for a comfortable stay.",
    image:
      "https://i.pinimg.com/736x/bb/af/90/bbaf90a1b86c6b5c46ae9297742d27bc.jpg",
    rating: 5,
    amenities: [
      { icon: "📶", label: "Wi-Fi" },
      { icon: "❄️", label: "AC" },
      { icon: "🍸", label: "Minibar" },
      { icon: "📺", label: "Smart TV" },
    ],
    badge: "Most Popular",
    size: "standard",
    bedType: "double",
  },
  {
    title: "Executive Suite",
    price: 10500,
    description:
      "Luxury redefined. Our suites feature separate living areas, designer furniture, and exclusive access to our club lounge. Perfect for business or romantic getaways.",
    image:
      "https://i.pinimg.com/1200x/c5/7b/3c/c57b3cd14908c90fe35547fa051b9982.jpg",
    rating: 5,
    amenities: [
      { icon: "📶", label: "Premium Wi-Fi" },
      { icon: "🛁", label: "Jacuzzi" },
      { icon: "☕", label: "Nespresso" },
      { icon: "💼", label: "Workspace" },
    ],
    size: "large",
    bedType: "king",
  },
  {
    title: "Family Room",
    price: 7800,
    description:
      "Thoughtfully designed for families. Features two queen-sized beds, extra storage space, and child-friendly amenities to make your stay feel just like home.",
    image:
      "https://i.pinimg.com/1200x/83/9e/fe/839efe28d4e47810182789ead59a1ceb.jpg",
    rating: 4,
    amenities: [
      { icon: "📶", label: "Free Wi-Fi" },
      { icon: "🛏️", label: "2 Queen Beds" },
      { icon: "🧊", label: "Large Fridge" },
      { icon: "🧒", label: "Kid's Kit" },
    ],
    size: "large",
    bedType: "queen",
  },
  {
    title: "Deluxe Twin",
    price: 4200,
    description:
      "Perfect for friends or colleagues travelling together. Two comfortable single beds with modern decor and all the essentials for a relaxing stay.",
    image:
      "https://i.pinimg.com/1200x/1e/ad/dd/1eaddd1de173c8c57baf622bfe948d41.jpg",
    rating: 4,
    amenities: [
      { icon: "📶", label: "Wi-Fi" },
      { icon: "❄️", label: "AC" },
      { icon: "📺", label: "Smart TV" },
    ],
    size: "standard",
    bedType: "twin",
  },
  {
    title: "Deluxe Queen",
    price: 6000,
    description:
      "An elegant retreat featuring a plush queen-sized bed, stylish interiors, and a private balcony overlooking the garden. Ideal for couples.",
    image:
      "https://i.pinimg.com/1200x/f3/1c/f8/f31cf88530f88da002f79a58306ae387.jpg",
    rating: 5,
    amenities: [
      { icon: "📶", label: "Wi-Fi" },
      { icon: "❄️", label: "AC" },
      { icon: "🍸", label: "Minibar" },
      { icon: "📺", label: "Smart TV" },
    ],
    size: "standard",
    bedType: "queen",
  },
  {
    title: "Single Room",
    price: 2800,
    description:
      "A cozy and budget-friendly option for solo travellers. Compact yet comfortable, with everything you need for a pleasant stay.",
    image:
      "https://i.pinimg.com/1200x/b2/2a/ec/b22aec02ecd50042053a51886ad30c24.jpg",
    rating: 3,
    amenities: [
      { icon: "📶", label: "Free Wi-Fi" },
      { icon: "❄️", label: "AC" },
    ],
    size: "compact",
    bedType: "single",
  },
];

const SIZE_OPTIONS = [
  { value: "all", label: "All Sizes" },
  { value: "compact", label: "Compact (< 25 m²)" },
  { value: "standard", label: "Standard (25–40 m²)" },
  { value: "large", label: "Large (40+ m²)" },
];

const BED_OPTIONS = [
  { value: "all", label: "All Bed Types" },
  { value: "single", label: "Single Bed" },
  { value: "twin", label: "Twin Bed" },
  { value: "double", label: "Double Bed" },
  { value: "queen", label: "Queen Bed" },
  { value: "king", label: "King Bed" },
];

export default function RoomsPage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 15000]);
  const [roomSize, setRoomSize] = useState("all");
  const [bedType, setBedType] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: [1000, 15000] as [number, number],
    roomSize: "all",
    bedType: "all",
  });

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const inPrice =
        room.price >= appliedFilters.priceRange[0] &&
        room.price <= appliedFilters.priceRange[1];
      const inSize =
        appliedFilters.roomSize === "all" ||
        room.size === appliedFilters.roomSize;
      const inBed =
        appliedFilters.bedType === "all" ||
        room.bedType === appliedFilters.bedType;
      return inPrice && inSize && inBed;
    });
  }, [appliedFilters]);

  function applyFilters() {
    setAppliedFilters({ priceRange, roomSize, bedType });
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
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                <span>Rs. {priceRange[0].toLocaleString()}</span>
                <span>Rs. {priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Room Size */}
            <div className="min-w-[180px]">
              <label className="text-sm font-semibold text-[var(--text)] mb-2 block">
                Room Size
              </label>
              <select
                value={roomSize}
                onChange={(e) => setRoomSize(e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bed Type */}
            <div className="min-w-[160px]">
              <label className="text-sm font-semibold text-[var(--text)] mb-2 block">
                Bed Type
              </label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
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
            filteredRooms.map((room, index) => (
              <RoomCard
                key={index}
                id={rooms.indexOf(room) + 1}
                title={room.title}
                price={room.price}
                description={room.description}
                image={room.image}
                rating={room.rating}
                amenities={room.amenities}
                badge={room.badge}
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
