"use client"
import { useState } from "react";

export default function ContactForm() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""

    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, }));
    // ... operator le input field ma lekhisakeko value save garcha
    // [name]: value le empty field ma lekheko value lincha

    };

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => 
        {e.preventDefault();

    await fetch("/api/contact", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
    });
    setFormData({ name: "", email: "", message: "" });
        }


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Contact Us</h1>
            <p className="text-gray-600 mb-10 text-center max-w-2xl">
            We’d love to hear from you. Whether you have a question about our rooms, dining, or services,
            our friendly staff is always here to help.
            </p>

      {/*  form */}
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* "focus:ring-2 focus:ring-blue-500" le glowing blue line banaucha when clicked */}
        
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                placeholder="Your Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                
                <button
                type="submit"
                className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-800 transition-all"
                >
                Send Message
                </button>
            </form>
        </div>
        </div>
    );
};
