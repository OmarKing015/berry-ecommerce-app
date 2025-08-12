import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllColorSwatches = async (page: number = 1, limit: number = 16) => {
  const offset = (page - 1) * limit;
  
  const COLORSWATCHES_QUERY = defineQuery(`
    {
      "swatches": *[_type == "colorSwatches"] | order(_createdAt desc) [${offset}...${offset + limit}],
      "total": count(*[_type == "colorSwatches"])
    }
  `);

  try {
    const result = await sanityFetch({ query: COLORSWATCHES_QUERY });
    const data = result.data || { swatches: [], total: 0 };
    
    return {
      swatches: data.swatches,
      total: data.total,
      totalPages: Math.ceil(data.total / limit),
      currentPage: page,
      hasNextPage: page * limit < data.total,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error("Error fetching color swatches:", error);
    return {
      swatches: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
};
