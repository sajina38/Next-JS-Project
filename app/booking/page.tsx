
export default function Booking() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center p-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
        Book Your Stay
        </h1>
        <p className="text-gray-600 mb-10 text-center max-w-2xl">
        Experience the elegance of Urban Boutique Hotel. Fill in your details
        below to reserve your perfect stay.
        </p>

        <form className="bg-gray-50 shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-4">
        {/* "space-y-4" le space dincha div haru ko bich */}
        {/* "focus:ring-2 focus:ring-blue-500" le glowing blue line banaucha when clicked */}
            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                type="text"
                placeholder="Enter your full name"
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Email</label>
                <input
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
                type="date"
                className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Room Type</label>
                <select className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Deluxe Room</option>
                    <option>Suite</option>
                    <option>Family Room</option>
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
