"use client";

import { motion } from "motion/react"
import React from "react";

export default function About(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}         // start invisible and below
      animate={{ opacity: 1, y: 0 }}          // fade + slide up
      transition={{ duration: 1, ease: "easeOut" }} // smooth
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10"
    >
      {/* heading */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 text-center"
      >
        About Urban Boutique Hotel
      </motion.h1>

      {/* paragraph 1 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-3xl text-center text-gray-600 text-lg mb-8"
      >
        Nestled in the heart of the city, Urban Boutique Hotel blends modern luxury with timeless elegance.
        Every detail — from the handcrafted furniture to the soothing ambience — is designed to offer a
        serene escape for every traveler.
      </motion.p>

      {/* paragraph 2 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="max-w-3xl text-center text-gray-600 text-lg mt-8"
      >
        Whether you're here for business or leisure, our dedicated team ensures your stay feels
        effortlessly comfortable, memorable, and uniquely personal.
      </motion.p>
    </motion.div>
  )
}
