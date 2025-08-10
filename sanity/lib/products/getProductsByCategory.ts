import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getProductsByCategory = async ({
  categorySlug,
  page = 1,
  limit = 10,
}: {
  categorySlug: string;
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;
  const end = skip + limit;

  const productsQuery = defineQuery(`
    *[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc) [${skip}...${end}]
  `);

  const totalProductsQuery = defineQuery(`
    count(*[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)])
  `);

  try {
    const [products, totalProducts] = await Promise.all([
      sanityFetch({ query: productsQuery, params: { categorySlug } }),
      sanityFetch({ query: totalProductsQuery, params: { categorySlug } }),
    ]);

    return {
      products: products.data || [],
      totalProducts: totalProducts.data || 0,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      products: [],
      totalProducts: 0,
    };
  }
};
