import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI as string;

export async function getProducts(UserId:string) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("z-shirt");
    const collection = database.collection("upload");
    const files = await collection.find({UserId})
    return NextResponse.json(files);
  } finally {
    await client.close();
  }
}
