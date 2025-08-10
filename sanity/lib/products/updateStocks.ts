import { backendClient } from "../backendClient";

export async function updateProductSizeStock(
  productId: string,
  size: string,
  quantityToDeduct: number
) {
  try {
    if (!productId || !size) {
      throw new Error(`Invalid productId or size provided.`);
    }

    const product = await backendClient.fetch(
      `*[_type == "product" && _id == $productId][0]{
        _id,
        stock,
        sizes
      }`,
      { productId }
    );

    if (!product) {
      throw new Error(`Product not found with ID: ${productId}`);
    }

    const newSizes = [...(product.sizes || [])];
    const sizeIndex = newSizes.findIndex((s) => s.size === size);

    if (sizeIndex === -1) {
      throw new Error(`Size "${size}" not found for product ${productId}`);
    }

    const currentSizeStock = newSizes[sizeIndex].stock || 0;
    newSizes[sizeIndex].stock = Math.max(0, currentSizeStock - quantityToDeduct);

    const newTotalStock = newSizes.reduce((acc, s) => acc + (s.stock || 0), 0);

    const result = await backendClient
      .patch(product._id)
      .set({
        sizes: newSizes,
        stock: newTotalStock,
      })
      .commit();

    return { success: true, result };
  } catch (error) {
    console.error(`Failed to update stock for product ${productId}, size ${size}:`, error);
    return { success: false, error };
  }
}

export async function updateMultipleProductsStock(
  items: Array<{
    productId: string;
    quantity: number;
    size: string;
  }>
) {
  try {
    const updatePromises = items.map((item) =>
      updateProductSizeStock(item.productId, item.size, item.quantity)
    );

    const results = await Promise.all(updatePromises);

    const failedUpdates = results.filter((res) => !res.success);
    if (failedUpdates.length > 0) {
      console.error("Some stock updates failed:", failedUpdates);
      return { success: false, results, error: "One or more product stock updates failed." };
    }

    return { success: true, results };
  } catch (error) {
    console.error("Failed to update multiple products stock:", error);
    return { success: false, error };
  }
}
