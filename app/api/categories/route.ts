
import { NextRequest, NextResponse } from "next/server";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";

export async function GET(request: NextRequest) {
    try {
        const categories = await getAllCategories();
        console.log("Fetched categories:", categories);
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}