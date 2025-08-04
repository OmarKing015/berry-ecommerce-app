import { Product } from "@/sanity.types"
import { backendClient } from "../backendClient"

export interface ProductData {
  name: string
  description?: string
  image?: {
    asset?: {
      _ref: string
      _type: "reference"
    }
    _type: "image"
  }
  file?: {
    _type: 'file',
    asset: {
      _type: 'reference',
      _ref: string,
    },
  },
  price: number
  stock?: number
  categories?: Array<{
    _ref: string
    _type: "reference"
    _key: string
  }>
  slug?: {
    current: string
    _type: "slug"
  }
  size: string[];
}

export async function createProduct(productData: ProductData) {
  try {
    const product = await backendClient.create({
      _type: "product",
      ...productData,
    })

    console.log("Product created successfully:", product)
    return { success: true, product }
  } catch (error) {
    console.error("Failed to create product in Sanity:", error)
    return { success: false, error }
  }
}

export async function findProductById(productId: string) {
  try {
    const product = await backendClient.fetch(`*[_type == "product" && _id == $productId][0]`, { productId })
    return { success: true, product }
  } catch (error) {
    console.error("Failed to find product:", error)
    return { success: false, error }
  }
}

export async function updateProduct(productId: string, updateData: Partial<ProductData>) {
  try {
    const updatedProduct = await backendClient
      .patch(productId)
      .set({
        ...updateData,
        _updatedAt: new Date().toISOString(),
      })
      .commit()

    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error("Failed to update product:", error)
    return { success: false, error }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await backendClient.delete(productId)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete product:", error)
    return { success: false, error }
  }
}

export async function getAllProducts() {
  try {
    const products = await backendClient.fetch(`
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        description,
        image,
        price,
        stock,
        slug,
        categories[]-> {
          _id,
          name
        },
        _createdAt,
        _updatedAt
      }
    `)
    return { success: true, products }
  } catch (error) {
    console.error("Failed to get products:", error)
    return { success: false, error }
  }
}

export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await backendClient.fetch(
      `
      *[_type == "product" && references($categoryId)] | order(_createdAt desc) {
        _id,
        name,
        description,
        image,
        price,
        stock,
        slug,
        categories[]-> {
          _id,
          name
        },
        _createdAt,
        _updatedAt
      }
    `,
      { categoryId },
    )
    return { success: true, products }
  } catch (error) {
    console.error("Failed to get products by category:", error)
    return { success: false, error }
  }
}
