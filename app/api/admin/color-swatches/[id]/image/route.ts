import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import type { ColorSwatch } from "@/lib/models";
const uri = process.env.MONGODB_API_KEY || "";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
    if (!(await params).id || !ObjectId.isValid((await params).id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("ZSHIRT");
    const collection = db.collection<ColorSwatch>("colorSwatches");

    const swatch = await collection.findOne({ _id: new ObjectId((await params).id) });

    await client.close();

    if (!swatch) {
      return NextResponse.json(
        { error: "Color swatch not found" },
        { status: 404 }
      );
    }

    if (!swatch.fileData || !swatch.fileData.buffer) {
        return NextResponse.json({ error: "Image data not found for this color swatch" }, { status: 404 });
    }

    return new NextResponse(swatch.fileData.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": swatch.contentType,
      },
    });
  } catch (error) {
    console.error("Error fetching color swatch image:", error);
    return NextResponse.json(
      { error: "Failed to fetch color swatch image" },
      { status: 500 }
    );
  }
}
