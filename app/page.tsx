"use client"

import React from "react";

export default function Home() {
  return (
    <>
      <main className="text-gray-800">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-12 md:py-20 bg-blue-100 px-6">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Welcome to Urban Boutique Hotel
            </h2>
            <p className="text-base md:text-lg mb-4">
              A modern haven, a crafted experience, a city retreat. Hotel Urban
              Boutique is more than just a place to stay—it is a reflection of
              contemporary elegance blended with warm hospitality. Tucked within
              the heart of the city, it offers a seamless escape where comfort
              meets culture, and every detail tells a story.
            </p>
            <p className="text-base md:text-lg mb-4">
              Designed with a spirit of sophistication, Hotel Urban Boutique
              embraces clean lines, curated décor, and a vibrant energy that
              mirrors the rhythm of urban life. Here, modern design meets timeless
              charm, and every moment feels effortlessly refined.
            </p>
            <p className="text-base md:text-lg mb-10">
              At Hotel Urban Boutique, you do not simply visit. You discover. You
              connect. You feel at home.
            </p>

            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer transition-colors hover:bg-blue-700 active:bg-blue-800">
              BOOK YOUR EXPERIENCE
            </button>
          </div>
        </section>

        {/* Rooms Section */}
        <section className="py-10 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Rooms</h3>
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
                  <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer transition-colors hover:bg-blue-700 active:bg-blue-800">
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
                  <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer transition-colors hover:bg-blue-700 active:bg-blue-800">
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
                  <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer transition-colors hover:bg-blue-700 active:bg-blue-800">
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
                  Hotel Urban offers two distinct dining experiences, each grounded
                  in a shared philosophy of sustainability and exceptional flavor...
                </p>
                <a href="#" className="text-blue-600 font-semibold hover:underline">
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
                  At Hotel Urban, every moment is thoughtfully crafted to bring you
                  closer to nature and yourself...
                </p>
                <a href="#" className="text-blue-600 font-semibold hover:underline">
                  Discover More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="bg-blue-200 flex justify-center p-6 md:p-10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1425.6573922441455!2d83.95918756935161!3d28.216238793482756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995959ad546c07d%3A0x5a51a59576cc5374!2sUrban%20Boutique%20Hotel%20Pokhara!5e0!3m2!1sen!2snp!4v1759936990793!5m2!1sen!2snp"
            className="w-full max-w-[700px] h-[300px] sm:h-[400px] rounded-lg shadow-md"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>
      </main>
    </>
  );
}
