"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";

interface RoomData {
  id: number;
  room_number: string;
  room_type: string;
  price: string;
  is_available: boolean;
}

const GALLERY_POOL = [
  "https://i.pinimg.com/736x/bb/af/90/bbaf90a1b86c6b5c46ae9297742d27bc.jpg",
  "https://i.pinimg.com/1200x/c5/7b/3c/c57b3cd14908c90fe35547fa051b9982.jpg",
  "https://i.pinimg.com/1200x/83/9e/fe/839efe28d4e47810182789ead59a1ceb.jpg",
  "https://i.pinimg.com/1200x/1e/ad/dd/1eaddd1de173c8c57baf622bfe948d41.jpg",
  "https://i.pinimg.com/1200x/f3/1c/f8/f31cf88530f88da002f79a58306ae387.jpg",
  "https://i.pinimg.com/1200x/b2/2a/ec/b22aec02ecd50042053a51886ad30c24.jpg",
];

function getRoomImages(id: number): string[] {
  const start = (id - 1) % GALLERY_POOL.length;
  return Array.from({ length: 4 }, (_, i) =>
    GALLERY_POOL[(start + i) % GALLERY_POOL.length]
  );
}

const ROOM_CONTENT: Record<string, { tagline: string; description: string }> = {
  "Deluxe King": {
    tagline: "Spacious luxury with a king-sized retreat",
    description:
      "Indulge in our spacious Deluxe King room, featuring a plush king-sized bed dressed in premium Egyptian cotton linens. Floor-to-ceiling windows frame stunning city views, while the marble-finished bathroom offers a rain shower and luxury amenities. Thoughtfully appointed with modern furnishings and ambient lighting for the perfect retreat.",
  },
  "Deluxe Family": {
    tagline: "A perfect haven for the whole family",
    description:
      "Designed for families seeking comfort and space, our Deluxe Family room offers generous living areas with a king bed and additional sleeping arrangements. Enjoy a private balcony with garden views, a well-appointed bathroom, and a dedicated sitting area perfect for quality time together.",
  },
  "Deluxe Triple": {
    tagline: "Comfortable space for small groups",
    description:
      "Perfect for friends or small groups, our Deluxe Triple room features three comfortable beds in a thoughtfully designed space. Natural light floods through large windows, complemented by warm wooden accents and contemporary decor for a relaxing stay.",
  },
  "Deluxe Twin": {
    tagline: "Elegant twin beds with modern amenities",
    description:
      "Our elegant Deluxe Twin room features two plush single beds with premium bedding, ideal for friends or colleagues traveling together. The room combines modern aesthetics with practical amenities, including a work desk and a stunning bathroom.",
  },
  "Deluxe Queen": {
    tagline: "Refined comfort with queen-sized elegance",
    description:
      "Experience refined comfort in our Deluxe Queen room, centered around a luxurious queen-sized bed. Rich textures, curated artwork, and sophisticated furnishings create an atmosphere of understated elegance, complemented by panoramic views of the surrounding landscape.",
  },
  Single: {
    tagline: "Cozy and efficient for the solo traveler",
    description:
      "Our cozy Single room is the perfect sanctuary for solo travelers. Compact yet thoughtfully designed, it features a comfortable bed, an efficient workspace, and all essential amenities to ensure a pleasant and productive stay.",
  },
};

const DEFAULT_CONTENT = {
  tagline: "Comfort meets contemporary elegance",
  description:
    "Experience our beautifully appointed room, designed with your comfort in mind. Every detail has been carefully curated to create a harmonious blend of modern luxury and warm hospitality, ensuring a memorable stay at Urban Boutique Hotel.",
};

const AMENITIES = [
  {
    label: "Free WiFi",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0z" />
      </svg>
    ),
  },
  {
    label: "Air Conditioning",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
      </svg>
    ),
  },
  {
    label: "Flat-screen TV",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: "Room Service",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "In-room Safe",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
      </svg>
    ),
  },
  {
    label: "24/7 Front Desk",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    label: "Daily Housekeeping",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423z" />
      </svg>
    ),
  },
  {
    label: "Complimentary Toiletries",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = Number(params.id);
  const { user } = useAuth();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [form, setForm] = useState({ guest_name: "", check_in: "", check_out: "" });
  const [booking, setBooking] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    api
      .get(`/rooms/${roomId}/`)
      .then((res) => {
        setRoom(res.data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [roomId]);

  const images = getRoomImages(roomId);
  const content = room ? (ROOM_CONTENT[room.room_type] ?? DEFAULT_CONTENT) : DEFAULT_CONTENT;

  const handleBooking = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!form.guest_name || !form.check_in || !form.check_out) return;
    setBooking("loading");
    try {
      await api.post("/bookings/", {
        room: roomId,
        guest_name: form.guest_name,
        check_in: form.check_in,
        check_out: form.check_out,
      });
      setBooking("success");
    } catch {
      setBooking("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-500 mb-6">The room you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/rooms"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[var(--font-inter)]">
      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[380px] md:h-[480px] bg-cover bg-center"
        style={{ backgroundImage: `url('${images[0]}')` }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm uppercase tracking-[0.2em] text-white/70 mb-3"
          >
            Room {room.room_number}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
          >
            {room.room_type}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed"
          >
            {content.tagline}
          </motion.p>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery */}
            <div>
              <div className="rounded-2xl overflow-hidden aspect-[16/10] shadow-md">
                <img
                  src={images[activeImage]}
                  alt={room.room_type}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all duration-300 hover:scale-105 ${
                      i === activeImage
                        ? "border-blue-500 ring-2 ring-blue-200 opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Room</h2>
              <p className="text-gray-600 leading-relaxed text-[15px]">{content.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Room #{room.room_number}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                    room.is_available
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      room.is_available ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {room.is_available ? "Available" : "Currently Booked"}
                </span>
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AMENITIES.map((amenity) => (
                  <div
                    key={amenity.label}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group cursor-default"
                  >
                    <span className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300 flex-shrink-0">
                      {amenity.icon}
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                      {amenity.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column — Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${parseFloat(room.price).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">/ night</span>
                </div>
              </div>

              {booking === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Your reservation has been successfully placed.
                  </p>
                  <Link
                    href="/rooms"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Browse more rooms
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={form.check_in}
                      onChange={(e) => setForm((p) => ({ ...p, check_in: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={form.check_out}
                      onChange={(e) => setForm((p) => ({ ...p, check_out: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      value={form.guest_name}
                      onChange={(e) => setForm((p) => ({ ...p, guest_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  {booking === "error" && (
                    <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      Booking failed. Please try again.
                    </p>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={booking === "loading" || !room.is_available}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {booking === "loading"
                      ? "Booking..."
                      : !room.is_available
                        ? "Currently Unavailable"
                        : "Book Now"}
                  </button>

                  {!user && (
                    <p className="text-center text-xs text-gray-400">
                      You&apos;ll need to log in to complete your booking
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Auth Modal ── */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Login or register to continue booking
              </p>
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 text-center text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300 text-center text-sm"
                >
                  Register
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
