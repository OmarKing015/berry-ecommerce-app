import ProductGrid  from "@/components/ProductGrid"
import { getAllCategories } from "@/sanity/lib/products/getAllCategories"
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory"
import { ArrowLeft, Tag } from "lucide-react"
import Link from "next/link"

async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getProductsByCategory(slug)
  const categories = await getAllCategories()

  // Format category name for display
  const categoryName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
              Categories
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </div>

          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Categories</span>
              </Link>

              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{categoryName} Collection</h1>
                  <p className="text-gray-600 mt-1">Discover our {categoryName.toLowerCase()} products</p>
                </div>
              </div>
            </div>

            {/* Product Count */}
            <div className="hidden sm:block bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {products.length > 0 ? (
          <ProductGrid products={products}/>
        ) : (
          // Empty State
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find any products in the {categoryName.toLowerCase()} category at the moment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Browse All Categories
                </Link>
                <Link
                  href="/"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
