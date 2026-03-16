import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white py-10 px-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* About */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">About Us</h2>
          <p className="leading-relaxed">
            Urban Boutique Hotel is a modern city retreat in the heart of
            Lakeside, Pokhara — blending contemporary elegance with warm Nepali
            hospitality.
          </p>
        </div>

        {/* Terms and Policies */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Terms &amp; Policies</h2>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                Cancellation Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Services</h2>
          <p className="leading-relaxed">
            Comfortable accommodations, fine dining, conference facilities,
            airport transfers, and personalised concierge services for every
            guest.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p>Lakeside, Pokhara - 6, Nepal</p>
          <p className="mt-1">Email: info@urbanboutiquehotel.com</p>
          <p>Phone: +977-61-457351</p>
          <p className="mt-3 text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Urban Boutique Hotel. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
