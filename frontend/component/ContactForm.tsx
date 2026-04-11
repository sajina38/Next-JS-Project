"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="font-[var(--font-inter)]">
      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — Contact Details */}
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
          >
            {/* Hotel */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-3">
                Urban Boutique Hotel
              </p>
              <p className="text-gray-800 font-medium text-lg">
                Lakeside, Pokhara - 6, Nepal
              </p>
              <div className="mt-3 space-y-1 text-gray-600">
                <p>+977-61-457351</p>
                <p>+977-9802832457</p>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Email */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                Email Us
              </p>
              <Link
                href="mailto:info@urbanboutiquehotel.com"
                className="text-emerald-700 hover:underline"
              >
                info@urbanboutiquehotel.com
              </Link>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Reservations */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-3">
                Reservations
              </p>
              <p className="text-gray-800 font-medium">
                For bookings and special requests
              </p>
              <div className="mt-3 space-y-1 text-gray-600">
                <p>+977-61-457351</p>
                <p>reservations@urbanboutiquehotel.com</p>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Follow Us */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-4">
                Follow Us
              </p>
              <div className="flex items-center gap-4">
                {[
                  {
                    label: "Facebook",
                    href: "#",
                    icon: (
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    ),
                  },
                  {
                    label: "Instagram",
                    href: "#",
                    icon: (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    ),
                  },
                  {
                    label: "TikTok",
                    href: "#",
                    icon: (
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    ),
                  },
                ].map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-emerald-700 hover:text-emerald-700 transition-colors duration-300"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {social.icon}
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.06 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-bold text-gray-900 leading-snug mb-10 font-[var(--font-heading)]">
              Reach out to us with your inquiries or booking needs, we&apos;re
              happy to help in any way we can.
            </h2>

            {submitted && (
              <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-lg mb-6">
                Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Please enter full name"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Please enter email address"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Please enter phone number"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please share any specific interests or messages here..."
                  required
                  rows={5}
                  className="w-full px-0 py-3 bg-transparent border-b border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-700 transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-emerald-800 active:scale-[0.98] transition-all duration-300"
              >
                Submit Form
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-100 p-6 md:p-10">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1425.6573922441455!2d83.95918756935161!3d28.216238793482756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995959ad546c07d%3A0x5a51a59576cc5374!2sUrban%20Boutique%20Hotel%20Pokhara!5e0!3m2!1sen!2snp!4v1759936990793!5m2!1sen!2snp"
            className="w-full h-[350px] sm:h-[450px] rounded-2xl shadow-md"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </section>
    </div>
  );
}
