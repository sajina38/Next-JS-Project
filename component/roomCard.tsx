type RoomProps = {
  title: string;
  price: string;
  description: string;
  image: string;
};

export default function RoomCard({ title, price, description, image }: RoomProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
      
      <img src={image} alt={title} className="rounded-lg mb-3 w-full h-40 object-cover" />

      
      <h2 className="text-lg font-bold mb-1">{title}</h2>

      <p className="text-gray-600 text-sm mb-2">{description}</p>

      
      <p className="text-blue-700 font-semibold">{price}</p>

      
      <button
        className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-blue-800 active:bg-blue-900"
        onClick={() => alert(`Booking: ${title}`)}
      >
        Book Now
      </button>
    </div>
  );
}
