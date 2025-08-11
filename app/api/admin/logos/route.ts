import { getAllLogos } from "@/sanity/lib/customizationTools/getAllLogos";
import {  NextResponse } from "next/server";


export async function GET() {
    try {
        const logos = await getAllLogos();
        console.log("Fetched logos:", logos);
        return NextResponse.json(logos);
    } catch (error) {
        console.error("Error fetching logos:", error);
        return NextResponse.json({ error: "Failed to fetch logos" }, { status: 500 });
    }
}
