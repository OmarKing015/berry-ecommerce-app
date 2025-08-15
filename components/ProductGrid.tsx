"use client"

import type { Product } from "@/sanity.types"
import { AnimatePresence, motion } from "framer-motion"
import ProductThumb from "./ProductThumb"

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {products
 .filter((product) => !product.slug?.current?.includes("custom-tshirt-"))
 .map((product) => {
        return (
          <AnimatePresence key={product._id}>
            <motion.div
              layout
              initial={{ opacity: 0.2, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center"
            >
              <ProductThumb key={product._id} product={product} />
              
            </motion.div>
          </AnimatePresence>
 );
      })}
      {products.length < 1 && (
 <p className="text-center text-lg text-gray-500">No products found.</p>

      )}
    </div>
  )
}

export default ProductGrid
