type RoomProps = {
  title: string;
  price: string;
  description: string;
  image: string;
};

export default function RoomCard({ title, price, description, image }: RoomProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full max-w-xs">
      
      <img src={image} alt={title} className="rounded-lg mb-3 w-full h-40 object-cover" />

      
      <h2 className="text-lg font-bold mb-1">{title}</h2>

      <p className="text-gray-600 text-sm mb-2">{description}</p>

      
      <p className="text-blue-700 font-semibold">{price}</p>

      
      <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
        Book Now
      </button>
    </div>
  );
}
