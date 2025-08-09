import { client } from './sanityClient';

export async function getAllProducts() {
  const query = `*[_type == "product" && name != "custom t-shirt"] | order(name asc)`;
  try {
    // Note: We are not implementing the complex sorting from the original page.tsx here.
    // That logic will be handled in the component that consumes this data.
    const products = await client.fetch(query);
    return products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  const query = `*[_type == "product" && slug.current == $slug][0]`;
  const params = { slug };
  try {
    const product = await client.fetch(query, params);
    return product || null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function searchProducts(searchTerm: string) {
  // Use `*` to enable fuzzy search
  const query = `*[_type == "product" && name match $searchTerm] | order(name asc)`;
  const params = { searchTerm: `${searchTerm}*` };
  try {
    const products = await client.fetch(query, params);
    return products || [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getAllCategories() {
  const query = `*[_type == "category"] | order(name asc)`;
  try {
    const categories = await client.fetch(query);
    return categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
