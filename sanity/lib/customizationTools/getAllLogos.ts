import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllLogos = async () => {
  const All_LOGOS_QUERY = defineQuery(`
        *[_type == "templeteLogos"] | order(name asc)
        `);

  try {
    const logos = await sanityFetch({ query: All_LOGOS_QUERY });
    console.log(logos);
    return logos.data || [];
  } catch (error) {
    console.error("Error fetching logo:", error);
    return [];
  }
};
