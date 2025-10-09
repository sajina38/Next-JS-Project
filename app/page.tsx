// import Button from "@/component/Button";
"use client"

// import Navbar from "@/component/navbar"; 
// import Footer from "@/component/footer";                                                                  
import React, { useEffect, useState } from "react";


export default function Home() {
  return (
    <>
  
    <main className="text-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-blue-100 px-6">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Urban Boutique Hotel
          </h2>
          <p className="text-lg mb-4">
            A modern haven, a crafted experience, a city retreat. Hotel Urban
            Boutique is more than just a place to stay—it is a reflection of
            contemporary elegance blended with warm hospitality. Tucked within
            the heart of the city, it offers a seamless escape where comfort
            meets culture, and every detail tells a story.
          </p>
          <p className="text-lg mb-4">
            Designed with a spirit of sophistication, Hotel Urban Boutique
            embraces clean lines, curated décor, and a vibrant energy that
            mirrors the rhythm of urban life. Here, modern design meets timeless
            charm, and every moment feels effortlessly refined.
          </p>
          <p className="text-lg mb-10">
            At Hotel Urban Boutique, you do not simply visit. You discover. You
            connect. You feel at home.
          </p>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            BOOK YOUR EXPERIENCE
          </button>
        </div>
      </section>


    
      {/* Rooms Section */}
      <section className="p-10 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-8">Our Rooms</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Room 1 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Book
              </button>
            </div>
          </div>

          {/* Room 2 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Book
              </button>
            </div>
          </div>

          {/* Room 3 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Book
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dining Section */}
      <section className="px-6 py-16 space-y-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 mx-10 pl-15 pr-5">
          {/* Text */}
          <div className="p-10">
            <h2 className="text-3xl font-bold ">Dining</h2>
            <h2 className="text-3xl font-bold ">________</h2>

            <p className="text-gray-600 mt-10 mb-4">
              Hotel Urban offers two distinct dining experiences, each grounded
              in a shared philosophy of sustainability and exceptional flavor...
            </p>
            <a href="#" className="text-blue-600 font-semibold">
              Dine with us
            </a>
          </div>

          {/* Image */}
          <div className="p-10 ">
            <img
              src="/dining.png"
              alt="Dining"
              // height={100}
              className=" shadow-md h-[550px] w-[850px] object-cover"
            />
          </div>
        </div>

        {/* Meeting Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 ml-30">
          <div>
            <img
              src="/meetingRoom.png"
              alt="Experience"
              className=" shadow-md h-[600px] w-[600px]"
            />
          </div>

          <div className="pr-15 pl-10">
            <h2 className="text-3xl font-bold">Meetings</h2>
             <h2 className="text-3xl font-bold ">___________</h2>
            

            <p className="text-gray-600 mt-10 mb-4">
              At Hotel Urban, every moment is thoughtfully crafted to bring you
              closer to nature and yourself...
            </p>
            <a href="#" className="text-blue-600 font-semibold">
              Discover More
            </a>
          </div>
        </div>
      </section>


      {/* Map Section */}
      <section className="bg-blue-200 flex justify-center p-10">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1425.6573922441455!2d83.95918756935161!3d28.216238793482756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995959ad546c07d%3A0x5a51a59576cc5374!2sUrban%20Boutique%20Hotel%20Pokhara!5e0!3m2!1sen!2snp!4v1759936990793!5m2!1sen!2snp"
        className="w-full max-w-[700px] h-[400px] rounded-lg shadow-md"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
  
        ></iframe>
      </section>



      
    </main>

   
    </>

    
  );
}

{/* <footer className="bg-gray-900 text-white text-center p-6">
        <p>© 2025 Urban Hotel. All rights reserved.</p>
      </footer> */}
// export default function Home() {
//   const [count, setCount] = useState(0);
//   useEffect(()=> {
//     alert("Hello");
//   }, [count]);
//       return(
  
//       <>
//       <p> {count} </p>
//       <button className="rounded-3xl bg-amber-900 text-white hover:bg-amber-500 p-4"
//       onClick={()=>{setCount(count+1)}}>
//         Click Me!
//       </button>
//       This is home page
//       </>
//       )
  
// }
