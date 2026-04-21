import { NextResponse} from "next/server"; 

export async function POST(request: Request) {
    const body = await request.json();
    const { name, email, message }  = body;

    console.log("Form Data:", name, email, message);

    return NextResponse.json ({message: "form received"});

}