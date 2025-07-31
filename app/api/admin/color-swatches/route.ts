import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, Binary } from "mongodb";
import type { ColorSwatch } from "@/lib/models";

const uri = process.env.MONGODB_API_KEY || "";

export async function GET() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ZSHIRT');
        const swatches = await db.collection<ColorSwatch>("colorSwatches").find({}).sort({ createdAt: -1 }).toArray();
        await client.close();

        const formattedSwatches = swatches?.map((swatch) => ({
            _id: swatch._id?.toString(),
            name: swatch.name,
            imageUrl: `/api/admin/color-swatches/${swatch._id}/image`,
            createdAt: swatch.createdAt.toISOString(),
        }));

        return NextResponse.json(formattedSwatches);
    } catch (error) {
        console.error("Error fetching color swatches:", error);
        return NextResponse.json({ error: "Failed to fetch color swatches" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") || "";
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ZSHIRT');
        const collection = db.collection<ColorSwatch>('colorSwatches');

        let name: string, hexCode: string, buffer: Buffer, imageContentType: string, fileName: string;

        if (contentType.includes("application/json")) {
            const body = await request.json();
            name = body.name;
            hexCode = body.hexCode;
            const imageUrl = body.imageUrl;

            if (!name || !hexCode || !imageUrl) {
                return NextResponse.json({ error: "Missing required fields: name, hexCode, and imageUrl" }, { status: 400 });
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
            hexCode = formData.get("hexCode") as string;

            if (!file || !name || !hexCode) {
                return NextResponse.json({ error: "Missing required fields: file, name, and hexCode" }, { status: 400 });
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
            hexCode,
            fileData: new Binary(buffer),
            contentType: imageContentType,
            fileName,
            createdAt: new Date(),
        } as any);
        await client.close();

        return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("Error uploading color swatch:", error);
        return NextResponse.json({ error: "Failed to upload color swatch" }, { status: 500 });
    }
}
