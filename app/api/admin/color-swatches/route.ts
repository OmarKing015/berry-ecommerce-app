import { NextRequest, NextResponse } from "next/server";
import { getAllColorSwatches } from "@/sanity/lib/customizationTools/getAllColorSwatches";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "16", 10);
        
        const swatches = await getAllColorSwatches(page, limit);
        console.log("Fetched color swatches:", swatches);
        return NextResponse.json(swatches);
    } catch (error) {
        console.error("Error fetching color swatches:", error);
        return NextResponse.json({ error: "Failed to fetch color swatches" }, { status: 500 });
    }
}
