"use client";

import Link from "next/link";
import { motion } from "motion/react";

const easeOut = [0.22, 1, 0.36, 1] as const;

const inViewFadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.95, ease: easeOut },
} as const;

const inViewFadeX = (x: number) =>
  ({
    initial: { opacity: 0, x },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.95, ease: easeOut },
  }) as const;

const aboutStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.14 },
  },
} as const;

const aboutItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOut },
  },
} as const;

const ROOM_PREVIEWS = [
  {
    title: "Deluxe Room",
    desc: "Spacious and elegant room with city view.",
    img: "/room1.png",
    alt: "Deluxe room",
  },
  {
    title: "Suite",
    desc: "Luxury suite with living area and balcony.",
    img: "/room2.png",
    alt: "Suite",
  },
  {
    title: "Family Room",
    desc: "Perfect for family stays with extra space.",
    img: "/image.png",
    alt: "Family room",
  },
];

export default function Home() {
  return (
    <>
      <main className="text-gray-800">
        {/* About Section */}
        <section className="py-16 px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={aboutStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <motion.p
              variants={aboutItem}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-3"
            >
              About Our Hotel
            </motion.p>
            <motion.h2
              variants={aboutItem}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              A Retreat in the Heart of Pokhara
            </motion.h2>
            <motion.div
              variants={aboutItem}
              className="w-16 h-[2px] bg-emerald-700 mx-auto mb-6 origin-center"
            />
            <motion.p
              variants={aboutItem}
              className="text-gray-600 leading-relaxed text-base md:text-lg mb-4"
            >
              Nestled in Lakeside, Pokhara, we blend contemporary elegance with
              warm Nepali hospitality. Every detail — from our handpicked
              interiors to the panoramic mountain views — is crafted to make
              your stay unforgettable.
            </motion.p>
            <motion.p
              variants={aboutItem}
              className="text-gray-500 leading-relaxed text-sm md:text-base"
            >
              Whether you&apos;re here for a tranquil escape, a family
              adventure, or a business retreat, we offer thoughtfully designed
              spaces, exceptional dining, and personalised service that feels
              like home.
            </motion.p>
          </motion.div>
        </section>

        <motion.div
          className="hr-line container-max origin-center"
          initial={{ scaleX: 0.35, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 1.1, ease: easeOut }}
        />

        {/* Rooms Section */}
        <motion.section
          className="py-10 px-6 bg-gray-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.85, ease: easeOut }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h3
              className="text-2xl md:text-3xl font-bold text-center mb-8"
              {...inViewFadeUp}
            >
              Our Rooms
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ROOM_PREVIEWS.map((room, i) => (
                <motion.div
                  key={room.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.85,
                    delay: i * 0.2,
                    ease: easeOut,
                  }}
                  whileHover={{ y: -4 }}
                  className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                >
                  <motion.div
                    className="overflow-hidden"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.55, ease: easeOut }}
                  >
                    <img
                      src={room.img}
                      alt={room.alt}
                      className="w-full h-48 object-cover"
                    />
                  </motion.div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2">{room.title}</h4>
                    <p className="text-gray-600 mb-4">{room.desc}</p>
                    <div className="flex justify-center">
                      <Link
                        href="/rooms"
                        className="inline-block bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors hover:bg-emerald-800 active:bg-emerald-900"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Dining Section */}
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
            <motion.div
              className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.9, ease: easeOut }}
            >
              <motion.div
                className="md:w-1/2 p-4 md:p-10"
                {...inViewFadeX(-28)}
              >
                <h2 className="text-2xl md:text-3xl font-bold">Dining</h2>
                <h2 className="text-2xl md:text-3xl font-bold">________</h2>

                <p className="text-gray-600 mt-6 md:mt-10 mb-4">
                  Hotel Urban offers two distinct dining experiences, each
                  grounded in a shared philosophy of sustainability and
                  exceptional flavor...
                </p>
                <a
                  href="#"
                  className="text-emerald-700 font-semibold hover:underline transition-colors"
                >
                  Dine with us
                </a>
              </motion.div>

              <motion.div
                className="md:w-1/2 p-4 md:p-10"
                {...inViewFadeX(28)}
              >
                <img
                  src="/dining.png"
                  alt="Dining"
                  className="shadow-md w-full h-[300px] sm:h-[400px] md:h-[550px] object-cover rounded-lg"
                />
              </motion.div>
            </motion.div>

            {/* Meeting Section */}
            <motion.div
              className="flex flex-col-reverse md:flex-row items-center justify-center gap-6 md:gap-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.9, ease: easeOut }}
            >
              <motion.div
                className="md:w-1/2 p-4 md:p-10"
                {...inViewFadeX(-28)}
              >
                <img
                  src="/meetingRoom.png"
                  alt="Experience"
                  className="shadow-md w-full h-[300px] sm:h-[400px] md:h-[600px] object-cover rounded-lg"
                />
              </motion.div>

              <motion.div
                className="md:w-1/2 p-4 md:p-10"
                {...inViewFadeX(28)}
              >
                <h2 className="text-2xl md:text-3xl font-bold">Meetings</h2>
                <h2 className="text-2xl md:text-3xl font-bold">___________</h2>

                <p className="text-gray-600 mt-6 md:mt-10 mb-4">
                  At Hotel Urban, every moment is thoughtfully crafted to bring
                  you closer to nature and yourself...
                </p>
                <a
                  href="#"
                  className="text-emerald-700 font-semibold hover:underline transition-colors"
                >
                  Discover More
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Map Section */}
        <section className="bg-stone-100 border-t border-stone-200/80 flex justify-center p-6 md:p-10">
          <motion.div
            className="w-full max-w-[700px]"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1, ease: easeOut }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1425.6573922441455!2d83.95918756935161!3d28.216238793482756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995959ad546c07d%3A0x5a51a59576cc5374!2sUrban%20Boutique%20Hotel%20Pokhara!5e0!3m2!1sen!2snp!4v1759936990793!5m2!1sen!2snp"
              className="w-full h-[300px] sm:h-[400px] rounded-xl shadow-lg border border-stone-200/60 bg-white"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </section>
      </main>
    </>
  );
}
