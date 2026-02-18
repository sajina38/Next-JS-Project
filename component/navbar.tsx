'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div
        className="relative bg-cover bg-center h-[400px] sm:h-[500px] md:h-[600px]"
        style={{
          backgroundImage:
            "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ec/47/a4/caption.jpg?w=1400&h=-1&s=1')",
        }}
      >
        {/* NAVBAR */}
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center pt-6 md:pt-10 px-6 text-white text-lg relative z-20">

          {/* Mobile Hamburger */}
          <button
            className="md:hidden cursor-pointer z-30"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* LEFT NAV */}
          <div className="hidden md:flex gap-8 font-italiana relative z-30">
            <a href="#" className="hover:text-gray-300 transition">Home</a>

            {/* Accommodation Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="hover:text-gray-300 transition flex items-center gap-1 cursor-pointer"
              >
                Accommodation
              </button>

              {isOpen && (
                <div className="absolute left-0 mt-2 bg-white text-black rounded-md shadow-lg min-w-[160px] z-50">
                  <ul>
                    <li>
                      <Link href="/rooms" className="block px-4 py-2 hover:bg-gray-100">Rooms</Link>
                    </li>
                    <li>
                      <Link href="/suites" className="block px-4 py-2 hover:bg-gray-100">Suites</Link>
                    </li>
                    <li>
                      <Link href="/villas" className="block px-4 py-2 hover:bg-gray-100">Villas</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Gallery Dropdown */}
            <div className="relative group">
              <button className="hover:text-gray-300 transition cursor-pointer">Gallery</button>
              <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded-md shadow-lg min-w-[160px] z-50">
                <a href="/photos" className="block px-4 py-2 hover:bg-gray-100">Photos</a>
                <a href="/videos" className="block px-4 py-2 hover:bg-gray-100">Videos</a>
              </div>
            </div>
          </div>

          {/* LOGO */}
          <div className="h-[60px] md:h-[90px] relative z-30">
            <img
              src="/logo.png"
              alt="Hotel Logo"
              className="h-full"
            />
          </div>

          {/* RIGHT NAV */}
          <div className="hidden md:flex gap-8 font-italiana relative z-30">
            {/* Booking Dropdown */}
            <div className="relative group">
              <button className="hover:text-gray-300 transition cursor-pointer">Booking</button>
              <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded-md shadow-lg min-w-[160px] z-50">
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Book Now</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Offers</a>
              </div>
            </div>

            <a href="#" className="hover:text-gray-300 transition">About Us</a>
            <a href="#" className="hover:text-gray-300 transition">Contact</a>
          </div>

          {/* Spacer for mobile to balance hamburger */}
          <div className="w-7 md:hidden" />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full bg-black/90 text-white z-40 pt-20 pb-6 px-6 space-y-4 text-lg">
            <a href="#" className="block hover:text-gray-300">Home</a>
            <Link href="/rooms" className="block hover:text-gray-300">Rooms</Link>
            <Link href="/suites" className="block hover:text-gray-300">Suites</Link>
            <Link href="/villas" className="block hover:text-gray-300">Villas</Link>
            <a href="/photos" className="block hover:text-gray-300">Photos</a>
            <a href="/videos" className="block hover:text-gray-300">Videos</a>
            <a href="#" className="block hover:text-gray-300">Booking</a>
            <a href="#" className="block hover:text-gray-300">About Us</a>
            <a href="#" className="block hover:text-gray-300">Contact</a>
          </div>
        )}
      </div>
    </>
  );
}
