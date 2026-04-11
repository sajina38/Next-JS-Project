"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
// to move to another page (go to booking page)

export default function RoomDetails() {
  const router = useRouter();
//  useRouter() = Next.js function ho {maathi imported)
// router will help to move between pages

  // Example data — in a real site this would come from your database or API
  const room = {
    id: 1,
    name: "Deluxe Ocean View Suite",
    image: "/public/room.png", 
    price: 180,
    description:
      "Enjoy the perfect blend of comfort and luxury with panoramic ocean views, a private balcony, and king-size bed.",
    amenities: [
      "Free Wi-Fi",
      "Air Conditioning",
      "24/7 Room Service",
      "Mini Bar",
      "Private Balcony",
      "Ocean View",
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Room Image */}
      <motion.div
        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={room.image}
          alt={room.name}
          width={800}
          height={500}
          className="object-cover w-full h-[400px]"
        />
      </motion.div>

      {/* Room Info Section */}
      <motion.div
        className="max-w-3xl mt-8 text-center space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          {room.name}
        </h1>
        <p className="text-lg text-gray-600">{room.description}</p>

        <p className="text-2xl font-semibold text-yellow-600">
          ${room.price} / night
        </p>

        {/* Amenities */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-3">Amenities</h2>
          <ul className="flex flex-wrap justify-center gap-3">
            {room.amenities.map((item, index) => (
              <li
                key={index}
                className="bg-white shadow px-4 py-2 rounded-full text-gray-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        
        <button
          onClick={() => router.push("/booking")}
          className="mt-8 bg-yellow-600 text-white px-6 py-3 rounded-full font-medium hover:bg-yellow-700 transition"
        >
          Book This Room
        </button>
      </motion.div>
    </div>
  );
}
