import { NextResponse } from "next/server";
import { fabric } from "fabric";

// Helper to load an image from a URL into a fabric.Image object on the server
async function loadImage(url: string): Promise<fabric.Image> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // fabric.js on Node.js can use a Promise-based image loader
    return fabric.Image.fromURL(`data:image/png;base64,${buffer.toString('base64')}`);
}

export async function POST(req: Request) {
    try {
        const { baseImageUrl, canvasJSON, width, height } = await req.json();

        if (!baseImageUrl || !canvasJSON || !width || !height) {
            return NextResponse.json(
                { message: "Missing required fields: baseImageUrl, canvasJSON, width, or height" },
                { status: 400 }
            );
        }

        // Create a static canvas on the server
        const staticCanvas = new fabric.StaticCanvas(null, {
            width: width,
            height: height,
        });

        // Load the base T-shirt image and set it as the background
        const backgroundImage = await loadImage(baseImageUrl);
        staticCanvas.setBackgroundImage(backgroundImage, staticCanvas.renderAll.bind(staticCanvas), {
            // Scale to fit the canvas dimensions directly
            scaleX: width / backgroundImage.width!,
            scaleY: height / backgroundImage.height!,
        });

        // Load the user's design (logos, text, etc.) onto the canvas
        // Ensure loadFromJSON is awaited to ensure the canvas is ready
        await new Promise<void>(resolve => {
            staticCanvas.loadFromJSON(canvasJSON, () => {
                staticCanvas.renderAll();
                resolve();
            });
        });

        // Generate the final image as a PNG buffer using toBuffer
        const buffer = staticCanvas.toBuffer('image/png');

        // Return the image as a downloadable file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="custom-tshirt-design.png"`,
            },
        });

    } catch (error) {
        console.error("Error generating design download:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Failed to generate design", error: errorMessage },
            { status: 500 }
        );
    }
}
