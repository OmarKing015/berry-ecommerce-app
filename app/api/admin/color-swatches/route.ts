import { NextResponse } from "next/server";
import { getAllColorSwatches } from "@/sanity/lib/customizationTools/getAllColorSwatches";

export async function GET() {
    try {
        const swatches = await getAllColorSwatches();
        console.log("Fetched color swatches:", swatches);
        return NextResponse.json(swatches);
    } catch (error) {
        console.error("Error fetching color swatches:", error);
        return NextResponse.json({ error: "Failed to fetch color swatches" }, { status: 500 });
    }
}
