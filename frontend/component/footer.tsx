import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="bg-emerald-950 text-white pt-16 pb-10 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
          {/* About */}
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase mb-6">
              About
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Urban Boutique Hotel has perhaps the best location of its kind
              that a hotel could have in any tourist area. Staying here, one can
              enjoy the advantage of being out of the noise but within just few
              minutes stroll from all the action.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase mb-6">
              Quick Link
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/rooms"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Rooms
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/booking"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Booking
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contacts
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase mb-6">
              Contact
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li>Lakeside, Pokhara - 6, Nepal</li>
              <li>+977 61 457351</li>
              <li>+977 61 457352</li>
              <li>+977 9856025587</li>
              <li>info@urbanboutiquehotel.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-emerald-950 border-t border-white/15 text-gray-400 text-xs px-5 py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2025 Urban Boutique Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
