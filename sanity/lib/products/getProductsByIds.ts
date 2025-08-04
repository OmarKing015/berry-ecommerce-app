import { client } from "@/sanity/lib/client";

export async function getProductsByIds(productIds: string[]) {
  try {
    const products = await client.fetch(
      `*[_type == "product" && _id in $productIds]{
        _id,
        name,
        stock,
        "slug": slug.current
      }`,
      { productIds }
    );
    return { success: true, products };
  } catch (error) {
    console.error("Failed to get products by IDs:", error);
    return { success: false, error };
  }
}
