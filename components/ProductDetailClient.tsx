"use client"

import { useState, useEffect } from "react"
import { notFound, redirect } from "next/navigation"
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug"
import { imageUrl } from "@/lib/imageUrl"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import AddToBasketButton from "@/components/AddToBasketButton"
import { Product } from "@/sanity.types"
import { Loader } from "lucide-react"
import { useAppContext } from "@/context/context"

interface ProductDetailClientProps {
  product: Product;
}



export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const isOutOfStock = product.stock != null && product.stock <= 0
  const {extraCost, setExtraCost} = useAppContext()

  if (!product.price) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div
                className={`${
                  isOutOfStock ? "opacity-50" : ""
                } relative aspect-square overflow-hidden rounded-lg shadow-lg bg-muted`}
              >
                {product.image && (
                  <Image
                    src={imageUrl(product.image).url() || "/placeholder.svg"}
                    alt={product.name ?? "Product Image"}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                )}
                {isOutOfStock && (
                  <Badge className="absolute top-4 left-4 text-sm px-3 py-1 bg-destructive text-destructive-foreground">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">{product.name}</h1>
                <p className="text-muted-foreground text-base md:text-lg mb-4">{product.description}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-primary">{(product.price ?? 0).toFixed(2)} EGP</span>
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Select Size</h2>
                  {product.size && (
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                    {product.size?.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem value={size} id={`size-${size}`} disabled={isOutOfStock} />
                        <Label htmlFor={`size-${size}`} className="cursor-pointer">{size}</Label>
                      </div>
                    ))}
                  </RadioGroup>)}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <AddToBasketButton product={product} selectedSize={selectedSize}  disabled={isOutOfStock || !selectedSize} />
                <Button variant="outline" className="w-full py-3 text-lg">
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}