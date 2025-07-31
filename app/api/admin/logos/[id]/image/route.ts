import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import type { Logo } from "@/lib/models";
const uri = process.env.MONGODB_API_KEY || "";
export async function DELETE(
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
    const collection = db.collection("logos");

    const result = await collection.deleteOne({ _id: new ObjectId((await params).id) });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Logo deleted successfully" });
  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}
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
    const collection = db.collection<Logo>("logos");

    const logo = await collection.findOne({ _id: new ObjectId((await params).id) });

    await client.close();

    if (!logo) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    if (!logo.fileData || !logo.fileData.buffer) {
        return NextResponse.json({ error: "Image data not found for this logo" }, { status: 404 });
    }

    return new NextResponse(logo.fileData.buffer  as ArrayBuffer, {
      headers: {
        "Content-Type": logo.contentType,
      },
    });
  } catch (error) {
    console.error("Error fetching logo image:", error);
    return NextResponse.json(
      { error: "Failed to fetch logo image" },
      { status: 500 }
    );
  }
}
