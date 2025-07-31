import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Binary } from "mongodb";
import { currentUser } from "@clerk/nextjs/server";

const uri = process.env.MONGODB_API_KEY || "";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const orderNumber = formData.get("orderId") as string | null;
  const user = await currentUser();

  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("ZSHIRT");
  const collection = db.collection("uploads");

  const result = await collection.insertOne({
    orderNumber: orderNumber,
    userName: user?.fullName || "custom tshirt",
    userId: user?.id,
    fileName: file.name,
    fileData: new Binary(buffer),
    contentType: file.type,
    uploadDate: new Date(),
    fileSize: file.size,
    status: 'Uploaded'
  });

  const assetId = result.insertedId;
  await client.close();
  return NextResponse.json(
    { message: "File uploaded successfully", assetId },
    { status: 200 }
  );
}
