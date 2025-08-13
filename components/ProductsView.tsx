import type { Category, Product } from "@/sanity.types"
import ProductGrid from "./ProductGrid"
import { CatogerySelectorComponent } from "./ui/category-selector"
import { Package } from "lucide-react"
import { imageUrl } from "@/lib/imageUrl"

interface ProductsViewProps {
  products: Product[]
  categories: Category[]
}

const ProductsView = ({ products, categories }: ProductsViewProps) => {
  const categoryImageMap = new Map<string, string>()

  for (const product of products) {
    if (product.categories) {
      for (const categoryRef of product.categories) {
        if (categoryRef._ref && !categoryImageMap.has(categoryRef._ref)) {
          if (product.image) {
            const url = imageUrl(product.image).url()
            categoryImageMap.set(categoryRef._ref, url)
          }
        }
      }
    }
  }

  const transformedCategories = categories.filter((c): c is NonNullable<typeof c> => c !== null)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover our amazing collection of products</p>
        </div>

        <div className="flex flex-col space-y-6">
          {/* Category Selector */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Filter by Category</h3>
            </div>
            <div className="w-full">
              <CatogerySelectorComponent categories={transformedCategories} />
            </div>
          </div>

          {/* Products Grid */}
          {/* <div className="bg-white rounded-lg shadow-sm border p-6">
            {products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Showing {products.length} {products.length === 1 ? "product" : "products"}
                  </p>
                </div>
                <ProductGrid products={products} />
              </>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default ProductsView
