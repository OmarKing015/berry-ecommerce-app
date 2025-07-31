import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, Binary } from "mongodb";
import type { File as FileModel } from "@/lib/models";

const uri = process.env.MONGODB_API_KEY || "";

export async function GET() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ZSHIRT');
        const files = await db.collection<FileModel>("uploads").find({}).sort({ uploadDate: -1 }).toArray();
        await client.close();

        const formattedFiles = files?.map((file) => ({
            _id: file?._id?.toString(),
            name: file?.fileName,
            userName:file?.userName,
            orderNumber:file?.orderNumber,
            downloadUrl: `/api/admin/files/${file._id}/download`,
            createdAt: file.uploadDate?.toISOString(),
        }));

        return NextResponse.json(formattedFiles);
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const orderNumber = formData.get("orderNumber") as string;
        const userName = formData.get("userName") as string;
        const fileName = formData.get("fileName") as string;


        if (!file || !orderNumber || !userName || !fileName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db('ZSHIRT');
        const collection = db.collection('uploads');

        const result = await collection.insertOne({
            orderNumber,
            userName,
            fileName,
            fileData: new Binary(buffer),
            contentType: file.type,
            uploadDate: new Date(),
            fileSize: file.size,
            status: 'Uploaded'
        });
        await client.close();

        return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
