import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { createProduct, ProductData } from "@/sanity/lib/products/createProduct";

// Helper function to convert data URL to Buffer
function dataURLtoBuffer(dataurl: string) {
  const arr = dataurl.split(',');
  if (arr.length < 2) {
    throw new Error('Invalid data URL');
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Could not determine mime type from data URL');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return { buffer: Buffer.from(u8arr), mime };
}

export async function POST(req: Request) {
  try {
    const { name, price, size, imageData, slug } = await req.json();

    if (!name || !price || !size || !imageData || !slug) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Upload the image asset to Sanity
    const { buffer, mime } = dataURLtoBuffer(imageData);
    const imageAsset = await backendClient.assets.upload('image', buffer, {
        contentType: mime,
        filename: `${slug}.png`,
    });

    // 2. Find the "Custom T-shirts" category ID
    const categories = await getAllCategories();
    const customCategory = categories.find(
      (cat: any) => cat.slug.current === "custom-design"
    );

    if (!customCategory) {
      return NextResponse.json(
        { message: "Category 'Custom T-shirts' not found." },
        { status: 500 }
      );
    }

    // 3. Prepare the product data
    const productData: ProductData = {
        name: name,
        price: price,
        description: `Customized T-Shirt - Size ${size}`,
        stock: 999, // Assuming custom shirts are always in stock
        slug: {
            _type: 'slug',
            current: slug,
        },
        image: {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: imageAsset._id,
            },
        },
        categories: [
            {
                _type: 'reference',
                _ref: customCategory._id,
                _key: customCategory._id
            },
        ],
        size: [size] // Corrected from 'sizes' to 'size' to match the schema
    };

    // 4. Create the product in Sanity
    const result = await createProduct(productData);

    if (!result.success) {
      throw new Error("Failed to create product in Sanity", { cause: result.error });
    }

    return NextResponse.json(result.product, { status: 201 });
  } catch (error) {
    console.error("Error creating custom product:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Failed to create custom product", error: errorMessage },
      { status: 500 }
    );
  }
}
