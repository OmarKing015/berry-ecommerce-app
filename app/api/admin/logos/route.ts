import { type NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { imageUrl } from "@/lib/imageUrl";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [logos, totalLogos] = await Promise.all([
      backendClient.fetch(
        `*[_type == "logo"] | order(_createdAt desc) [${skip}...${
          skip + limit
        }]`
      ),
      backendClient.fetch(`count(*[_type == "logo"])`),
    ]);

    const formattedLogos = logos?.map((logo: any) => ({
      _id: logo._id,
      name: logo.name,
      imageUrl: logo.image ? imageUrl(logo.image).url() : null,
      createdAt: logo._createdAt,
    }));

    return NextResponse.json({
      logos: formattedLogos,
      totalLogos,
      totalPages: Math.ceil(totalLogos / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching logos:", error);
    return NextResponse.json(
      { error: "Failed to fetch logos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json(
        { error: "Missing required fields: file and name" },
        { status: 400 }
      );
    }

    const imageAsset = await backendClient.assets.upload("image", file);

    const result = await backendClient.create({
      _type: "logo",
      name,
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
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}
