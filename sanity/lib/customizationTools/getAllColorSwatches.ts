import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllColorSwatches = async () => {
  const All_COLORSWATCHES_QUERY = defineQuery(`
 *[_type == "colorSwatches"] 
        `);

  try {
    const colorSwatch = await sanityFetch({ query: All_COLORSWATCHES_QUERY });
 console.log("Fetched colorSwatch:", colorSwatch);
 return colorSwatch.data || [];
  } catch (error) {
    console.error("Error fetching colorSwatch:", error);
    return [];
  }
};
