import Link from "next/link";

type RoomProps = {
  id?: number;
  title: string;
  price: number;
  description: string;
  image: string | null;
  isAvailable?: boolean;
  badge?: string;
};

export default function RoomCard({
  id,
  title,
  price,
  description,
  image,
  isAvailable = true,
  badge,
}: RoomProps) {
  return (
    <div className="card flex flex-col md:flex-row overflow-hidden transition-shadow duration-300 hover:shadow-lg relative">
      {!isAvailable && (
        <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
          Booked
        </span>
      )}
      {isAvailable && badge && (
        <span className="absolute top-4 left-4 z-10 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
          {badge}
        </span>
      )}

      <div className="md:w-[320px] md:min-w-[320px] h-56 md:h-auto relative overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] mb-2">{title}</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-4">
            {description}
          </p>
        </div>

        <div className="flex items-end justify-between mt-2">
          <p className="text-2xl font-bold text-emerald-700">
            Rs. {price.toLocaleString()}
            <span className="text-sm font-normal text-[var(--muted)]">
              {" "}
              / Night
            </span>
          </p>
          <Link
            href={id ? `/rooms/${id}` : "/rooms"}
            className="border-2 border-emerald-700 text-emerald-700 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 hover:bg-emerald-700 hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
