export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white py-10 px-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">

        {/* About */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">About Us</h2>
          <p>
            A cozy bookshop dedicated to sharing stories, knowledge, and a love
            for reading with our community.
          </p>
        </div>

        {/* Terms and Policies */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Terms & Policies</h2>
          <ul className="space-y-2">
            <li className="hover:text-gray-300 cursor-pointer">Terms of Use</li>
            <li className="hover:text-gray-300 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-gray-300 cursor-pointer">Content Policy</li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Services</h2>
          <p>
            Wide range of books, home delivery, gift wrapping, and personalized
            recommendations for every reader.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p>Email: info@yourbookshop.com</p>
          <p>Phone: +977-1-555555</p>
          <p className="mt-3 text-gray-400 text-sm">
            &copy; 2025 My Company. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


// export default function Footer(){
//     return (
//         <> 
//         <div className="flex gap-6 items-center bg-black sticky bottom-0 text-white "> 

//             <div className="m-4">
//                 <h2 className="mb-3"> Quick Links </h2>
//                 <p> Home </p>
//                 <p> Accomodation </p>
//                 <p> About Us </p>
//                 <p> Explore </p>
//             </div>                 

//             <div className="m-4"> 
//                 <h2 className="mb-3"> Contact </h2>
//                 <p> Lakeside, Pokhara - 6, Nepal </p>
//                 <p> +977 61 457351 </p>
//                 <p> +977 61 457352 </p>
//                 <p> info@hotelpokhara.com </p>
                
//             </div>
//         </div>
//         </>
//     )
// }