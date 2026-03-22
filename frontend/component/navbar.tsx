"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const BASE_MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const HERO_CONFIG: Record<
  string,
  { image: string; title: string; description: string }
> = {
  "/": {
    image:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ec/47/a4/caption.jpg?w=1400&h=-1&s=1",
    title: "Welcome to Urban Boutique Hotel",
    description:
      "A modern haven, a crafted experience, a city retreat. Discover contemporary elegance blended with warm hospitality.",
  },
  "/rooms": {
    image: "/room1.png",
    title: "Our Rooms & Suites",
    description:
      "Elegant accommodations designed for comfort. From cozy deluxe rooms to spacious suites with stunning views.",
  },
  "/about": {
    image: "/meetingRoom.png",
    title: "About Our Boutique Hotel",
    description:
      "Where every detail tells a story, and every stay is a curated experience of comfort and culture.",
  },
  "/contact": {
    image: "/dining.png",
    title: "Get in Touch",
    description:
      "We'd love to hear from you. Reach out for reservations, inquiries, or to plan your perfect stay.",
  },
  "/booking": {
    image: "/room2.png",
    title: "Book Your Stay",
    description:
      "Reserve your room and experience the art of modern luxury at Urban Boutique Hotel.",
  },
  "/roomDetails": {
    image: "/room.png",
    title: "Room Details",
    description:
      "Explore our thoughtfully designed spaces crafted for your comfort.",
  },
};

const DEFAULT_HERO = {
  image: "/image.png",
  title: "Urban Boutique Hotel",
  description: "Experience the art of modern luxury.",
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const hero = HERO_CONFIG[pathname] ?? DEFAULT_HERO;
  const isRoomDetail = pathname
    ? /^\/rooms\/[^/]+$/.test(pathname) && pathname !== "/rooms"
    : false;

  useEffect(() => setMounted(true), []);

  const menuItems = [
    ...BASE_MENU_ITEMS,
    ...(mounted && user
      ? [
          { label: "My Profile", href: "/profile" },
          ...(user.role === "manager"
            ? [{ label: "Manager Dashboard", href: "/manager/dashboard" }]
            : []),
          ...(user.role === "admin"
            ? [{ label: "Admin Dashboard", href: "/admin/dashboard" }]
            : []),
        ]
      : mounted
        ? [
            { label: "Login", href: "/login" },
            { label: "Register", href: "/register" },
          ]
        : []),
  ];

  return (
    <>
      {/* Hero Section with Navbar */}
      <div
        className={`bg-cover bg-center ${
          isRoomDetail
            ? "absolute top-0 left-0 right-0 z-30 h-16"
            : "relative h-[400px] sm:h-[480px] md:h-[560px]"
        }`}
        style={
          isRoomDetail ? undefined : { backgroundImage: `url('${hero.image}')` }
        }
      >
        {!isRoomDetail && <div className="absolute inset-0 bg-black/50" />}

        {/* Navbar bar */}
        <div className="relative z-20 flex items-center justify-between h-16 px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Left: Hamburger */}
          <div className="flex-shrink-0 w-10 flex items-center">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-white hover:text-white/90 hover:bg-white/10 transition-colors duration-300"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="block">
              <Image
                src="/logo.png"
                alt="Urban Boutique Hotel"
                width={120}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-lg"
              />
            </Link>
          </div>

          {/* Right: Book Now */}
          <div className="flex-shrink-0 flex justify-end">
            <Link
              href="/rooms"
              className="px-6 py-2.5 text-xs font-medium tracking-[0.2em] uppercase text-white bg-emerald-700 rounded-full hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/30 hover:scale-105 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              Book Now
            </Link>
          </div>
        </div>

        {/* Hero content */}
        {!isRoomDetail && (
          <div className="absolute inset-0 z-10 flex items-end justify-center pb-12 px-6">
            <div className="max-w-3xl text-center text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-[var(--font-inter)]">
                {hero.title}
              </h1>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                {hero.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sliding Side Menu */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-out font-[var(--font-inter)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-6 pb-8">
            <div className="flex justify-end px-4 pb-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 hover:translate-x-1 hover:scale-[1.01] origin-left transition-all duration-300 font-medium"
                >
                  {item.label}
                </Link>
              ))}
              {mounted && user && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:translate-x-1 hover:scale-[1.01] origin-left transition-all duration-300 font-medium"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
