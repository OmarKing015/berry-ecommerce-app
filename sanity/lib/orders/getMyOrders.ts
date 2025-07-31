import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getMyOrders(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const MY_ORERS_QUERY = defineQuery(`*[_type == "order" && clerkUserId == $userId] | order(createdAt desc) {
        _id,
        orderId,
        customerName,
        totalAmount,
        paymentStatus,
        paymentMethod,
        orderStatus,
        createdAt,
        items[] {
          quantity,
          price,
          product-> {
            _id,
            name,
            image
          }
        }
      }`);

  try {
    const orders = await sanityFetch({
      query: MY_ORERS_QUERY,
      params: { userId },
    });
    return orders.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Error fetching orders");
  }
}
