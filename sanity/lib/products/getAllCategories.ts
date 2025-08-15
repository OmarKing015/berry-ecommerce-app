import { defineQuery } from "next-sanity"
import { sanityFetch } from "../live"

export const getAllCategories = async () => {
  const CATEGORIES_QUERY = defineQuery(`
    *[_type == "category"] | order(name asc)
  `)

  try {
    const categories = await sanityFetch({
      query: CATEGORIES_QUERY,
    })

    return categories.data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}
