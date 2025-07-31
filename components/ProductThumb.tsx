import { imageUrl } from "@/lib/imageUrl"
import type { Product } from "@/sanity.types"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"

function ProductThumb({ product }: { product: Product }) {
  const isOutOfStock = product.stock != null && product.stock <= 0

  return (
    <Link
      href={`/product/${product?.slug?.current}`}
      className={`group flex flex-col bg-card rounded-lg border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-full ${
        isOutOfStock ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.image && (
          <Image
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            src={imageUrl(product?.image).url() || "/placeholder.svg"}
            alt={product.name || "Product image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white font-bold text-lg">Out Of Stock</span>
          </div>
        )}

        {/* Quick Add to Cart Button - appears on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full shadow-lg transition-colors duration-200">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h2>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">{product.price?.toFixed(2)} EGP</p>
            {product.stock != null && !isOutOfStock && (
              <p className="text-xs text-green-500">{product.stock} in stock</p>
            )}
          </div>

          {!isOutOfStock && (
            <div className="bg-green-500/10 text-green-500 text-xs font-medium px-2 py-1 rounded-full">Available</div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductThumb
