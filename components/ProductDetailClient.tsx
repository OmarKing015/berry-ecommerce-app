"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { notFound } from "next/navigation"
import { imageUrl } from "@/lib/imageUrl"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import AddToBasketButton from "@/components/AddToBasketButton"
import type { Product } from "@/sanity.types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAppContext } from "@/context/context"

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { extraCost, setExtraCost } = useAppContext()
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const isOutOfStock =
    product?.sizes?.map((s: any) => s.stock)?.reduce((acc: number, curr: number) => acc + curr, 0) === 0

  const totalImages = product.images?.length || 0

  const goToNextImage = () => {
    if (totalImages <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImage((prev) => (prev + 1) % totalImages)
      setIsTransitioning(false)
    }, 150)
  }

  const goToPrevImage = () => {
    if (totalImages <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImage((prev) => (prev - 1 + totalImages) % totalImages)
      setIsTransitioning(false)
    }, 150)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNextImage()
    } else if (isRightSwipe) {
      goToPrevImage()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      goToPrevImage()
    } else if (e.key === "ArrowRight") {
      goToNextImage()
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [totalImages])

  if (!product.price) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 md:p-6 lg:p-8">
            {/* Enhanced Product Image Gallery */}
            <div className="space-y-4">
              <div
                className={`${
                  isOutOfStock ? "opacity-50" : ""
                } relative aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-100 group`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {product.images && (
                  <div
                    className={`relative w-full h-full transition-all duration-300 ${isTransitioning ? "scale-95 opacity-80" : "scale-100 opacity-100"}`}
                  >
                    <Image
                      src={imageUrl(product.images[selectedImage]).url() || "/placeholder.svg" || "/placeholder.svg"}
                      alt={product.name ?? "Product Image"}
                      fill
                      className="object-cover rounded-lg"
                      priority
                    />
                  </div>
                )}

                {totalImages > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      onClick={goToPrevImage}
                      disabled={isTransitioning}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      onClick={goToNextImage}
                      disabled={isTransitioning}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {totalImages > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-md text-sm">
                    {selectedImage + 1} / {totalImages}
                  </div>
                )}

                {isOutOfStock && (
                  <Badge className="absolute top-4 left-4 text-sm px-3 py-1 bg-red-500 text-white">Out of Stock</Badge>
                )}
              </div>

              <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {product.images?.map((image, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedImage === index
                        ? "ring-2 ring-blue-500 scale-105"
                        : "hover:ring-2 hover:ring-gray-300 hover:scale-102"
                    }`}
                    onClick={() => {
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setSelectedImage(index)
                        setIsTransitioning(false)
                      }, 150)
                    }}
                  >
                    <Image
                      src={imageUrl(image).url() || "/placeholder.svg"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {selectedImage === index && <div className="absolute inset-0 bg-blue-500/20 rounded-md" />}
                  </div>
                ))}
              </div>

              {totalImages > 1 && (
                <p className="text-sm text-gray-500 text-center md:hidden">Swipe left or right to view more images</p>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 text-base md:text-lg mb-4">{product.description}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    {(product.price ?? 0).toFixed(2)} EGP
                  </span>
                  <span className="text-sm text-gray-500">Instead of</span>
                  <span className="text-sm text-gray-500 line-through">{(product.price + 150).toFixed(2)} EGP</span>
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Select Size</h2>
                  {product.sizes && (
                    <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                      {product.sizes?.map((sizeObj) => (
                        <div key={sizeObj.size} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={sizeObj?.size || ""}
                            id={`size-${sizeObj?.size}`}
                            disabled={sizeObj?.stock === 0}
                          />
                          <Label htmlFor={`size-${sizeObj?.size}`} className="cursor-pointer">
                            {sizeObj?.size}
                            {sizeObj?.stock === 0 && <span className="text-sm text-gray-500 ml-1">(Out of Stock)</span>}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              </div>

              {product.sizes && !selectedSize ? (
                <p className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gray-300 text-gray-500 cursor-not-allowed">
                  Please choose a size first.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <AddToBasketButton product={product} selectedSize={selectedSize} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
