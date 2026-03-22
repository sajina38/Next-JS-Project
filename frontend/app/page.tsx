"use client";

import React from "react";

export default function Home() {
  return (
    <>
      <main className="text-gray-800">
        {/* About Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-3">
              About Our Hotel
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A Retreat in the Heart of Pokhara
            </h2>
            <div className="w-16 h-[2px] bg-emerald-700 mx-auto mb-6" />
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4">
              Nestled in Lakeside, Pokhara, we blend contemporary elegance with
              warm Nepali hospitality. Every detail — from our handpicked
              interiors to the panoramic mountain views — is crafted to make
              your stay unforgettable.
            </p>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              Whether you&apos;re here for a tranquil escape, a family
              adventure, or a business retreat, we offer thoughtfully designed
              spaces, exceptional dining, and personalised service that feels
              like home.
            </p>
          </div>
        </section>

        <div className="hr-line container-max" />

        {/* Rooms Section */}
        <section className="py-10 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Our Rooms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Room 1 */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <img
                  src="/room1.png"
                  alt="Room 1"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Deluxe Room</h4>
                  <p className="text-gray-600 mb-4">
                    Spacious and elegant room with city view.
                  </p>
                  <button className="bg-emerald-700 text-white px-5 py-2 rounded-full cursor-pointer transition-colors hover:bg-emerald-800 active:bg-emerald-900">
                    Book
                  </button>
                </div>
              </div>

              {/* Room 2 */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <img
                  src="/room2.png"
                  alt="Room 2"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Suite</h4>
                  <p className="text-gray-600 mb-4">
                    Luxury suite with living area and balcony.
                  </p>
                  <button className="bg-emerald-700 text-white px-5 py-2 rounded-full cursor-pointer transition-colors hover:bg-emerald-800 active:bg-emerald-900">
                    Book
                  </button>
                </div>
              </div>

              {/* Room 3 */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <img
                  src="/image.png"
                  alt="Room 3"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Family Room</h4>
                  <p className="text-gray-600 mb-4">
                    Perfect for family stays with extra space.
                  </p>
                  <button className="bg-emerald-700 text-white px-5 py-2 rounded-full cursor-pointer transition-colors hover:bg-emerald-800 active:bg-emerald-900">
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dining Section */}
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
              {/* Text */}
              <div className="md:w-1/2 p-4 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold">Dining</h2>
                <h2 className="text-2xl md:text-3xl font-bold">________</h2>

                <p className="text-gray-600 mt-6 md:mt-10 mb-4">
                  Hotel Urban offers two distinct dining experiences, each
                  grounded in a shared philosophy of sustainability and
                  exceptional flavor...
                </p>
                <a
                  href="#"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Dine with us
                </a>
              </div>

              {/* Image */}
              <div className="md:w-1/2 p-4 md:p-10">
                <img
                  src="/dining.png"
                  alt="Dining"
                  className="shadow-md w-full h-[300px] sm:h-[400px] md:h-[550px] object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Meeting Section */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-6 md:gap-10">
              <div className="md:w-1/2 p-4 md:p-10">
                <img
                  src="/meetingRoom.png"
                  alt="Experience"
                  className="shadow-md w-full h-[300px] sm:h-[400px] md:h-[600px] object-cover rounded-lg"
                />
              </div>

              <div className="md:w-1/2 p-4 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold">Meetings</h2>
                <h2 className="text-2xl md:text-3xl font-bold">___________</h2>

                <p className="text-gray-600 mt-6 md:mt-10 mb-4">
                  At Hotel Urban, every moment is thoughtfully crafted to bring
                  you closer to nature and yourself...
                </p>
                <a
                  href="#"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Discover More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="bg-stone-100 border-t border-stone-200/80 flex justify-center p-6 md:p-10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1425.6573922441455!2d83.95918756935161!3d28.216238793482756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995959ad546c07d%3A0x5a51a59576cc5374!2sUrban%20Boutique%20Hotel%20Pokhara!5e0!3m2!1sen!2snp!4v1759936990793!5m2!1sen!2snp"
            className="w-full max-w-[700px] h-[300px] sm:h-[400px] rounded-xl shadow-lg border border-stone-200/60 bg-white"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>
      </main>
    </>
  );
}
