import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";
import { Order } from "@/sanity.types";

export const getOrderByOrderId = async (orderId: string): Promise<Order | null> => {
  const GET_ORDER_BY_ORDER_ID_QUERY = defineQuery(`
    *[_type == "order" && orderId == $orderId][0]
  `);

  try {
    const order = await sanityFetch({
      query: GET_ORDER_BY_ORDER_ID_QUERY,
      params: { orderId },
    });
    return order.data;
  } catch (error) {
    console.error("Error fetching order by orderId:", error);
    return null;
  }
};
