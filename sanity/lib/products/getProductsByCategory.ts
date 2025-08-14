import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";
import { PRODUCTS_BY_CATEGORY_QUERYResult } from "@/sanity.types";

export const getProductsByCategory = async (categorySlug: string) => {
  const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
    *[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc) {
    }
    `);

  try {
    const products = await sanityFetch({
      query: PRODUCTS_BY_CATEGORY_QUERY,
      params: { categorySlug },
    });

    return products.data as PRODUCTS_BY_CATEGORY_QUERYResult || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};
