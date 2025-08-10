import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllProducts = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;
  const end = skip + limit;

  const productsQuery = defineQuery(`
    *[_type == "product" && name != "custom t-shirt"] | order(name asc) [${skip}...${end}]
  `);

  const totalProductsQuery = defineQuery(`
    count(*[_type == "product" && name != "custom t-shirt"])
  `);

  try {
    const [products, totalProducts] = await Promise.all([
      sanityFetch({ query: productsQuery }),
      sanityFetch({ query: totalProductsQuery }),
    ]);

    return {
      products: products.data || [],
      totalProducts: totalProducts.data || 0,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      totalProducts: 0,
    };
  }
};









