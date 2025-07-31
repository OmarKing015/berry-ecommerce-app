import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import type { File as FileModel } from "@/lib/models";
const uri = process.env.MONGODB_API_KEY || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("ZSHIRT");
    const collection = db.collection<FileModel>("uploads");

    const file = await collection.findOne({ _id: new ObjectId((await params).id) });

    await client.close();

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return new NextResponse(file.fileData.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
