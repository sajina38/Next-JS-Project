"use client"  //because component is server-side, so 'state' cant be used without this
import React, { useState } from "react";

// const button = (text:any)=> {
//     return (
//         <>
//         <button>
//         hello
//         </button>
//         </>
//     )
// }

// export default button;

export default function Button(){
    const [count, setCount] = useState(0);
    return(

    <>
    <p> {count} </p>
    <button className="rounded-3xl bg-amber-900 text-white hover:bg-amber-500"
    onClick={()=>{setCount(count+1)}}> 
    </button>
    </>
    )
}