
import { NextRequest, NextResponse } from "next/server";
import { getAllLogos } from "@/sanity/lib/customizationTools/getAllLogos";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "12", 10);
        
        const logos = await getAllLogos(page, limit);
        console.log("Fetched logos:", logos);
        return NextResponse.json(logos);
    } catch (error) {
        console.error("Error fetching logos:", error);
        return NextResponse.json({ error: "Failed to fetch logos" }, { status: 500 });
    }
}

// export async function POST(request: NextRequest) {
//     try {
//         const contentType = request.headers.get("content-type") || "";
//         const client = new MongoClient(uri);
//         await client.connect();
//         const db = client.db('ZSHIRT');
//         const collection = db.collection<Logo>('logos');

//         let name: string, buffer: Buffer, imageContentType: string, fileName: string;

//         if (contentType.includes("application/json")) {
//             const body = await request.json();
//             name = body.name;
//             const imageUrl = body.imageUrl;

//             if (!name || !imageUrl) {
//                 return NextResponse.json({ error: "Missing required fields: name, category, and imageUrl" }, { status: 400 });
//             }

//             const response = await fetch(imageUrl);
//             if (!response.ok) {
//                 return NextResponse.json({ error: "Failed to fetch image from URL" }, { status: 400 });
//             }
//             const arrayBuffer = await response.arrayBuffer();
//             buffer = Buffer.from(arrayBuffer);
//             imageContentType = response.headers.get("content-type") || "image/png";
//             fileName = new URL(imageUrl).pathname.split('/').pop() || 'image.png';

//         } else if (contentType.includes("multipart/form-data")) {
//             const formData = await request.formData();
//             const file = formData.get("file") as File;
//             name = formData.get("name") as string;

//             if (!file || !name ) {
//                 return NextResponse.json({ error: "Missing required fields: file, name, and category" }, { status: 400 });
//             }

//             const arrayBuffer = await file.arrayBuffer();
//             buffer = Buffer.from(arrayBuffer);
//             imageContentType = file.type;
//             fileName = file.name;
//         } else {
//             await client.close();
//             return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
//         }

//         const result = await collection.insertOne({
//             name,
//             fileData: new Binary(buffer),
//             contentType: imageContentType,
//             fileName,
//             createdAt: new Date(),
//         } as any);
//         await client.close();

//         return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });

//     } catch (error) {
//         console.error("Error uploading logo:", error);
//         return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
//     }
// }
