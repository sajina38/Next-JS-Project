'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {

  const [isOpen, setIsOpen] =useState(false);
  return (
    <>
      <div
        className="relative bg-cover bg-center h-[600px]"
        style={{
          backgroundImage:
            "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ec/47/a4/caption.jpg?w=1400&h=-1&s=1')",
        }}
      >
        {/* NAVBAR */}
        <div className="flex justify-around items-center pt-10 text-white text-lg relative z-20">

          {/* LEFT  */}
          <div className="flex gap-[35px] font-italiana relative z-30">
            <a href="#" className="hover:text-gray-300">Home</a>

            {/* Accommodation ko Dropdown */}
            <div className="relative ">
              <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="hover:text-gray-300 transition flex items-center gap-1">Accommodation</button>
              
              {isOpen && (
                  <div className="absolute left-0 mt-2 hidden hover:block bg-white text-black rounded-md shadow-lg min-w-[160px] z-50">
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
              <button className="hover:text-gray-300">Gallery</button>
              <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded-md shadow-lg min-w-[160px] z-50">
                <a href="/photos" className="block px-4 py-2 hover:bg-gray-100">Photos</a>
                <a href="/videos" className="block px-4 py-2 hover:bg-gray-100">Videos</a>
              </div>
            </div>
          </div>

          {/* LOGO */}
          <div className="h-[90px] relative z-30">
            <img
              src="/logo.png"
              alt="Hotel Logo"
              className="h-full"
            />
          </div>

          {/* RIGHT  */}
          <div className="flex gap-[35px] font-italiana relative z-30">

            {/* Booking Dropdown */}
            <div className="relative group">
              <button className="hover:text-gray-300">Booking</button>
              <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded-md shadow-lg min-w-[160px] z-50">
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Book Now</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Offers</a>
              </div>
            </div>

            <a href="#" className="hover:text-gray-300">About Us</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </div>
    </>
  );
}
