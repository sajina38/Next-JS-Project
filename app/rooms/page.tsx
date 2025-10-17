// "use client";
import { useEffect, useState } from "react";
import RoomCard from "@/component/roomCard";
import { useBlogs } from "../query/useBlogs";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]); // state to store fetched data
  //use state ko value aile 0 cha
   

  // useEffect(() => {
    
    // const fetchRooms = async () => {
    //   try {
    //     const res = await fetch("https://admin.luxmiivastravatika.com/api/product"); 
    //     const data = await res.json(); // convert response to JSON
    //     console.log(data.data.products);
    //     setRooms(data.data.products); //setRooms ma data halesi rooms ma value ayo 
    //   } catch (error) {
    //     console.error("Error fetching rooms:", error);
    //   }
    // };
    // fetchRooms();

    //yo above code home ma dekhauna cha bhaney feri home ma lekhna parthyo 
    
   const {data:blogs}=useBlogs() 
   //yo function jata ni use garna milcha

  // }, []); 
  // run once on page load

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Our Rooms</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rooms.map((room: any, index) => (
          <RoomCard
            key={index}
            title={room.title}
            price={room.price}
            description={room.description}
            image={room.thumbnail}
          />
        ))}
      </div>
    </div>
  );
}



// import RoomCard from "@/component/roomCard";

// export default function RoomsPage() {
  
//   const rooms = [
//     {
//     title: "Deluxe King",
//     price: "$120/night",
//     description: "A cozy deluxe room with lake view.",
//     image: "https://i.pinimg.com/736x/bb/af/90/bbaf90a1b86c6b5c46ae9297742d27bc.jpg",
//     },
//     {
//     title: "Deluxe Family",
//     price: "$200/night",
//     description: "Spacious suite with balcony and minibar.",
//     image: "https://i.pinimg.com/1200x/c5/7b/3c/c57b3cd14908c90fe35547fa051b9982.jpg",
//     },
//     {
//     title: "Deluxe Triple",
//     price: "$120/night",
//     description: "Simple and comfortable stay option.",
//     image: "https://i.pinimg.com/1200x/83/9e/fe/839efe28d4e47810182789ead59a1ceb.jpg",
//     },
//     {
//     title: "Deluxe Twin",
//     price: "$100/night",
//     description: "Perfect for families with extra beds.",
//     image: "https://i.pinimg.com/1200x/1e/ad/dd/1eaddd1de173c8c57baf622bfe948d41.jpg",
//     },
//     {
//     title: "Deluxe Queen",
//     price: "$180/night",
//     description: "Private villa with swimming pool.",
//     image: "https://i.pinimg.com/1200x/f3/1c/f8/f31cf88530f88da002f79a58306ae387.jpg",
//     },
//     {
//     title: "Single ",
//     price: "$90/night",
//     description: "Private villa with swimming pool.",
//     image: "https://i.pinimg.com/1200x/b2/2a/ec/b22aec02ecd50042053a51886ad30c24.jpg", 
//     }
    
//   ];

//  return (

    
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Our Rooms</h1>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {rooms.map((room, index) => (
//           <RoomCard
//             key={index}
//             title={room.title}
//             price={room.price}
//             description={room.description}
//             image={room.image}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }