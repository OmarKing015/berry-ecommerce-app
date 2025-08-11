import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllColorSwatches = async () => {
  const All_COLORSWATCHES_QUERY = defineQuery(`
 *[_type == "colorSwatches"] | order(name asc)
        `);

  try {
    const colorSwatch = await sanityFetch({ query: All_COLORSWATCHES_QUERY });
 console.log("Fetched colorSwatch:", colorSwatch);
 return colorSwatch || [];
  } catch (error) {
    console.error("Error fetching colorSwatch:", error);
    return [];
  }
};
