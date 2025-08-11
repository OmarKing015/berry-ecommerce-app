"use client"

import type { Product } from "@/sanity.types"
import useBasketStore from "@/store/store"
import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"

interface AddToBasketButtonProps {
  product: Product
  selectedSize:string
    extraCost?: number
  disabled?: boolean
}

function AddToBasketButton({ product, disabled, selectedSize , extraCost }: AddToBasketButtonProps) {
  const { addItem, removeItem, getItemCount } = useBasketStore()
  const itemCount = getItemCount(product._id,selectedSize)
  const [isClient, setIsClient] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-12 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="w-32 h-6 bg-gray-200 rounded"></div>
      </div>
    )
  }
  const handleAddItem = async () => {
    setIsAdding(true)
     addItem(product, selectedSize,0)
    // Small delay for visual feedback
    setTimeout(() => setIsAdding(false), 200)
  }
  const isOutOfStock = product?.sizes?.map((s:any)=>s.stock)?.reduce((acc:number,curr:number)=>acc+curr,0) === 0 
  const selectedSizeStock = product.sizes?.find(({ size }) => size === selectedSize)?.stock ?? 0
  const isDisabled = disabled || isOutOfStock 
  const isSelectedSizeOutOfStock = itemCount >= selectedSizeStock


  // If no items in basket, show "Add to Basket" button
  if (itemCount === 0) {
    return (
      <button
        onClick={handleAddItem}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700  text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        } ${isAdding ? "scale-95" : ""}`}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>{isDisabled ? "Out of Stock" : "Add to Basket"}</span>
      </button>
    )
  }

  // If items in basket, show quantity controls
  return (
    <div className="w-full">
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border">
        {/* Decrease Button */}
        <button
          onClick={() => removeItem(product._id,selectedSize)}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </button>

        {/* Quantity Display */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-gray-900">{itemCount}</div>
          <div className="text-xs text-gray-500">in basket</div>
        </div>

        {/* Increase Button */}
        <button
          onClick={handleAddItem}
 disabled={isSelectedSizeOutOfStock}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
 isSelectedSizeOutOfStock
              ? "bg-gray-200 border border-gray-200 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 border border-blue-600"
          } ${isAdding ? "scale-95" : ""}`}
        >
          <Plus className={`h-4 w-4 ${isOutOfStock ? "text-gray-400" : "text-white"}`} />
        </button>
      </div>

      {/* Stock Warning */}
      {product?.sizes !== undefined && (
        <div className="mt-2 text-center">
          {isOutOfStock && (
            <p className="text-xs text-red-600 font-medium">Selected Size Maximum stock reached</p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleAddItem}
          disabled={isOutOfStock}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
            isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          Add More
        </button>
        <button
          onClick={() => {
            // Remove all items of this product
            for (let i = 0; i < itemCount; i++) {
              removeItem(product._id, selectedSize)
            }
          }}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
        >
          Remove All
        </button>
      </div>
    </div>
  )
}

export default AddToBasketButton
