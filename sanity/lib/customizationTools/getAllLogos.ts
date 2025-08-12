import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllLogos = async (page: number = 1, limit: number = 12) => {
  const offset = (page - 1) * limit;
  
  const LOGOS_QUERY = defineQuery(`
    {
      "logos": *[_type == "templeteLogos"] | order(name asc) [${offset}...${offset + limit}],
      "total": count(*[_type == "templeteLogos"])
    }
  `);

  try {
    const result = await sanityFetch({ query: LOGOS_QUERY });
    const data = result.data || { logos: [], total: 0 };
    
    return {
      logos: data.logos,
      total: data.total,
      totalPages: Math.ceil(data.total / limit),
      currentPage: page,
      hasNextPage: page * limit < data.total,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error("Error fetching logos:", error);
    return {
      logos: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
};
