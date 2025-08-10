import { defineQuery } from 'next-sanity'
import { sanityFetch } from '../live'

export const searchProductbyName = async ({
  query,
  page = 1,
  limit = 10,
}: {
  query: string;
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;
  const end = skip + limit;

  const productsQuery = defineQuery(`
    *[_type == 'product' && name match $query] | order(name asc) [${skip}...${end}]
  `);

  const totalProductsQuery = defineQuery(`
    count(*[_type == 'product' && name match $query])
  `);

  try {
    const [products, totalProducts] = await Promise.all([
      sanityFetch({ query: productsQuery, params: { query: `${query}*` } }),
      sanityFetch({ query: totalProductsQuery, params: { query: `${query}*` } }),
    ]);

    return {
      products: products.data || [],
      totalProducts: totalProducts.data || 0,
    };
  } catch (error) {
    console.error("Error fetching products: " + error);
    return {
      products: [],
      totalProducts: 0,
    };
  }
};

