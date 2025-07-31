import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
const uri = process.env.MONGODB_API_KEY || "";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
