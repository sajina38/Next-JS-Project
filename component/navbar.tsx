// "use client";
// import { motion } from "motion/react";

// export default function Navbar() {
//   return (
//     <motion.nav
//       initial={{ opacity: 0, y: -30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//       className="flex items-center justify-between px-10 py-4 bg-blue-950 text-white shadow-md"
//     >
//       <div className="flex items-center gap-4">
//         <img src="/logo.png" alt="Hotel Logo" className="h-[70px] w-auto" />
//         <h1 className="text-2xl font-bold">Urban Boutique Hotel</h1>
//       </div>

//       <div className="flex gap-6">
//         <a href="/" className="hover:text-blue-300">Home</a>
//         <a href="/about" className="hover:text-blue-300">About</a>
//         <a href="/rooms" className="hover:text-blue-300">Rooms</a>
//         <a href="/contact" className="hover:text-blue-300">Contact</a>
//       </div>
//     </motion.nav>
//   );
// }






export default function Navbar() {
  return (
    <>
      {/* Hero section with background image */}
      <div
        className="relative bg-cover bg-center h-[600px]"
        style={{
          backgroundImage:
            "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/ec/47/a4/caption.jpg?w=1400&h=-1&s=1')",
        }}
      >
        {/* Navigation bar */}
        <div className="flex justify-around items-center pt-10 text-white text-lg">
          {/* Left Menu */}
          <div className="flex gap-[35px] font-italiana">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">Accommodation</a>
            <a href="#" className="hover:text-gray-300">Gallery</a>
          </div>

          {/* Center Logo */}
          <div className="h-[90px]">
            <img
              src="/logo.png"  
              alt="Hotel Logo"
              className="h-full"
            />
          </div>

          {/* Right Menu */}
          <div className="flex gap-[35px] font-italiana">
            <a href="#" className="hover:text-gray-300">Booking</a>
            <a href="#" className="hover:text-gray-300">About Us</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </div>
    </>
  );
}
