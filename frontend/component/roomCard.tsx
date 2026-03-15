import Link from "next/link";

type Amenity = {
  icon: string;
  label: string;
};

type RoomProps = {
  id?: number;
  title: string;
  price: number;
  description: string;
  image: string;
  rating?: number;
  amenities?: Amenity[];
  badge?: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-orange-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const amenityIcons: Record<string, string> = {
  "Wi-Fi": "📶",
  "Free Wi-Fi": "📶",
  "Premium Wi-Fi": "📶",
  AC: "❄️",
  Minibar: "🍸",
  "Smart TV": "📺",
  Jacuzzi: "🛁",
  Nespresso: "☕",
  Workspace: "💼",
  "2 Queen Beds": "🛏️",
  "Large Fridge": "🧊",
  "Kid's Kit": "🧒",
};

export default function RoomCard({
  id,
  title,
  price,
  description,
  image,
  rating = 5,
  amenities = [],
  badge,
}: RoomProps) {
  return (
    <div className="card flex flex-col md:flex-row overflow-hidden transition-shadow duration-300 hover:shadow-lg relative">
      {badge && (
        <span className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
          {badge}
        </span>
      )}

      <div className="md:w-[320px] md:min-w-[320px] h-56 md:h-auto relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-[var(--text)]">{title}</h2>
            <StarRating rating={rating} />
          </div>

          <p className="text-[var(--muted)] text-sm leading-relaxed mb-4">
            {description}
          </p>

          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
              {amenities.map((amenity) => (
                <span
                  key={amenity.label}
                  className="flex items-center gap-1.5 text-xs text-[var(--muted)]"
                >
                  <span>{amenityIcons[amenity.label] || amenity.icon}</span>
                  {amenity.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mt-2">
          <p className="text-2xl font-bold text-blue-600">
            Rs. {price.toLocaleString()}
            <span className="text-sm font-normal text-[var(--muted)]">
              {" "}
              / Night
            </span>
          </p>
          <Link
            href={id ? `/rooms/${id}` : "/rooms"}
            className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-blue-600 hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
