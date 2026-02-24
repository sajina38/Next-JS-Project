"use client"
import { useState } from "react";

export default function Booking() {

        const [formData, setFormData] = useState({
            name: "",
            email: "",
            checkIn: "",
            checkOut: "",
            roomType: ""
    
        })
    
        const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value, }));
        // ... operator le input field ma lekhisakeko value save garcha
        // [name]: value le empty field ma lekheko value lincha
    
        };
    
        const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => 
            {e.preventDefault();
                console.log(formData)
    
        await fetch("/api/booking", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        });
        setFormData({ name: "", email: "", checkIn: "" ,checkOut: "", roomType: ""});
            }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center p-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
        Book Your Stay
        </h1>
        <p className="text-gray-600 mb-10 text-center max-w-2xl">
        Experience the elegance of Urban Boutique Hotel. Fill in your details
        below to reserve your perfect stay.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-50 shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-4">
        {/* "space-y-4" le space dincha div haru ko bich */}
        {/* "focus:ring-2 focus:ring-blue-500" le glowing blue line banaucha when clicked */}
            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Email</label>
                <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter your email"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* md:flex row garda desktop view ma row dekhaucha */}
                <div className="flex-1">
                <label className="text-gray-700 font-semibold mb-2">
                Check-in Date
                </label>
                <input
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                type="date" 
                // mm/dd/yy and calendar dincha
                className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>

                <div className="flex-1">
                <label className="text-gray-700 font-semibold mb-2">
                Check-out Date
                </label>
                <input
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                type="date"
                className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Room Type</label>
                {/* <input>
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                
                </> */}
                <select className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="formData.roomType">Deluxe Room</option>
                    <option value="formData.roomType">Suite</option>
                    <option value="formData.roomType">Family Room</option>
                </select>
            </div>

            <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all w-full"
            // transition-all le hover smooth garaucha
            >
            Confirm Booking
            </button>
        </form>
    </div>
    );
}
