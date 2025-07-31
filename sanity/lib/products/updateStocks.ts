import { client } from "@/sanity/lib/client";
import { backendClient } from "../backendClient";

export async function updateProductStock(
  productId: string,
  quantityToDeduct: number
) {
  try {
    console.log(`updateProductStock: Received productId: ${productId}, quantityToDeduct: ${quantityToDeduct}`);

    if (!productId || typeof productId !== 'string') {
      console.error(`updateProductStock: Invalid productId provided: ${productId}`);
      throw new Error(`Invalid productId provided: ${productId}`);
    }

    // Get current product including its _id and stock
    const product = await backendClient.fetch(
      `*[_type == "product" && _id == $productId][0]{
        _id,
        stock
      }`,
      { productId }
    );

    if (!product || !product._id) {
      console.error(`updateProductStock: Product not found or missing _id for ID: ${productId}`);
      throw new Error(`Product not found or missing _id for ID: ${productId}`);
    }

    const currentStock = product.stock || 0;
    const newStock = Math.max(0, currentStock - quantityToDeduct);

    // Update stock using the product's _id
    const result = await backendClient
      .patch(product._id)
      .set({ stock: newStock })
      .commit();

    return { success: true, newStock, result };
  } catch (error) {
    console.error(`Failed to update product stock for ${productId}:`, error);
    return { success: false, error };
  }
}

export async function updateMultipleProductsStock(
  items: Array<{
    productId: string;
    quantity: number;
  }>
) {
  try {
    console.log("updateMultipleProductsStock: Starting multiple stock updates.");
    const updatePromises = items.map((item) =>
      updateProductStock(item.productId, item.quantity)
    );

    const results = await Promise.all(updatePromises);

    // Check if any individual update failed
    const failedUpdates = results.filter(res => !res.success);
    if (failedUpdates.length > 0) {
        console.error("updateMultipleProductsStock: Some stock updates failed:", failedUpdates);
        return { success: false, results, error: "One or more product stock updates failed." };
    }

    console.log("updateMultipleProductsStock: All stock updates completed successfully.");
    return { success: true, results };
  } catch (error) {
    console.error("updateMultipleProductsStock: Failed to update multiple products stock:", error);
    return { success: false, error };
  }
}
