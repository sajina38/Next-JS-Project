"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

const FEATURE_CARDS = [
  {
    title: "Sustainability",
    description:
      "We prioritize eco-conscious choices—from plastic-free amenities to locally sourced organic ingredients in our dining.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12a4 4 0 10-8 0 4 4 0 008 0z" />
      </svg>
    ),
  },
  {
    title: "Hospitality",
    description:
      "Thoughtful service that anticipates your needs, ensuring every guest feels welcomed and at home from the moment they arrive.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Modern Design",
    description:
      "Sleek aesthetics and intentional décor that reflect urban sophistication while preserving a sense of timeless charm.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function About() {
  return (
    <div className="font-[var(--font-inter)]">
      {/* Our Mission */}
      <section className="py-16 md:py-24 px-6 bg-[#fafaf9]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 mb-4">
            Our Mission
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Delivering hospitality through thoughtful design and local charm.
          </h2>
          <div className="w-16 h-0.5 bg-blue-500 mx-auto mb-6" />
          <p className="text-gray-600 text-lg leading-relaxed">
            At Urban Boutique Hotel, we believe a stay should feel like more than a place to rest. It is a space where refined style meets genuine hospitality. We are dedicated to crafting experiences that stay with you long after you leave.
          </p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 mb-4">
                Our Story
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Built on Heritage, Shaped for Today.
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Urban Boutique Hotel was born from a vision to bring together the best of local tradition and contemporary comfort. We have carefully curated every corner—from the lobby to the guest rooms—to reflect the spirit of our city while offering a peaceful retreat for travelers.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our team works closely with local artisans and suppliers to bring authentic touches into your stay. We believe that great hospitality is not just about what we offer, but how we make you feel.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 hover:gap-3 transition-all duration-300"
              >
                Learn more about our heritage
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Image
                src="/room1.png"
                alt="Urban Boutique Hotel"
                width={600}
                height={400}
                className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Defines Us */}
      <section className="py-16 md:py-24 px-6 bg-[#fafaf9]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Defines Us
          </h2>
          <p className="text-gray-600 text-lg">
            The values that shape every interaction and every choice we make.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 md:gap-8">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-default"
            >
              <div className="text-blue-500 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
              <p className="text-gray-600 leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
