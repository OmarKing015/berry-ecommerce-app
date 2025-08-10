import { type NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { imageUrl } from "@/lib/imageUrl";

export async function GET() {
  try {
    const swatches = await backendClient.fetch(
      `*[_type == "colorSwatch"] | order(_createdAt desc)`
    );

    const formattedSwatches = swatches?.map((swatch: any) => ({
      _id: swatch._id,
      name: swatch.name,
      hexCode: swatch.hexCode,
      category: swatch.category,
      imageUrl: swatch.image ? imageUrl(swatch.image).url() : null,
      createdAt: swatch._createdAt,
    }));

    return NextResponse.json(formattedSwatches);
  } catch (error) {
    console.error("Error fetching color swatches:", error);
    return NextResponse.json(
      { error: "Failed to fetch color swatches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const hexCode = formData.get("hexCode") as string;
    const category = formData.get("category") as "slim" | "oversized";

    if (!file || !name || !hexCode || !category) {
      return NextResponse.json(
        { error: "Missing required fields: file, name, hexCode, and category" },
        { status: 400 }
      );
    }

    const imageAsset = await backendClient.assets.upload("image", file);

    const result = await backendClient.create({
      _type: "colorSwatch",
      name,
      hexCode,
      category,
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageAsset._id,
        },
      },
    });

    return NextResponse.json({ success: true, insertedId: result._id }, { status: 201 });
  } catch (error) {
    console.error("Error uploading color swatch:", error);
    return NextResponse.json(
      { error: "Failed to upload color swatch" },
      { status: 500 }
    );
  }
}
