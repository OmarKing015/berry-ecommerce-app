import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllLogos = async () => {
  const All_LOGOS_QUERY   = defineQuery(`
        *[_type == "templeteLogos"] | order(name asc)
        `);

  try {
    const logo = await sanityFetch({ query: All_LOGOS_QUERY });
    return logo.data || [];
  } catch (error) {
    console.error("Error fetching logo:", error);
    return [];
  }
};



