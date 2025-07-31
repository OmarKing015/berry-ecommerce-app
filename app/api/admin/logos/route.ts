import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, Binary } from "mongodb";
import type { Logo } from "@/lib/models";

const uri = process.env.MONGODB_API_KEY || "";

export async function GET() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ZSHIRT');
        const logos = await db.collection<Logo>("logos").find({}).sort({ createdAt: -1 }).toArray();
        await client.close();

        const formattedLogos = logos?.map((logo) => ({
            _id: logo._id?.toString(),
            name: logo.name,
            category: logo.category,
            imageUrl: `/api/admin/logos/${logo._id}/image`,
            createdAt: logo.createdAt.toISOString(),
        }));

        return NextResponse.json(formattedLogos);
    } catch (error) {
        console.error("Error fetching logos:", error);
        return NextResponse.json({ error: "Failed to fetch logos" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") || "";
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ZSHIRT');
        const collection = db.collection<Logo>('logos');

        let name: string, buffer: Buffer, imageContentType: string, fileName: string;

        if (contentType.includes("application/json")) {
            const body = await request.json();
            name = body.name;
            const imageUrl = body.imageUrl;

            if (!name || !imageUrl) {
                return NextResponse.json({ error: "Missing required fields: name, category, and imageUrl" }, { status: 400 });
            }

            const response = await fetch(imageUrl);
            if (!response.ok) {
                return NextResponse.json({ error: "Failed to fetch image from URL" }, { status: 400 });
            }
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            imageContentType = response.headers.get("content-type") || "image/png";
            fileName = new URL(imageUrl).pathname.split('/').pop() || 'image.png';

        } else if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File;
            name = formData.get("name") as string;

            if (!file || !name ) {
                return NextResponse.json({ error: "Missing required fields: file, name, and category" }, { status: 400 });
            }

            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            imageContentType = file.type;
            fileName = file.name;
        } else {
            await client.close();
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        }

        const result = await collection.insertOne({
            name,
            fileData: new Binary(buffer),
            contentType: imageContentType,
            fileName,
            createdAt: new Date(),
        } as any);
        await client.close();

        return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("Error uploading logo:", error);
        return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
    }
}
