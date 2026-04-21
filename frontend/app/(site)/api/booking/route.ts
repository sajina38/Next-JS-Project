import { NextResponse} from "next/server"; 

export async function POST(request: Request) {
    const body = await request.json();
    const { name, email, checkIn, checkOut }  = body;

    console.log("Form Data:" , name, email, checkIn, checkOut );

    return NextResponse.json ({message: "form received"});

}