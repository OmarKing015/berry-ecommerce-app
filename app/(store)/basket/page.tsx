"use client"

import AddToBasketButton from "@/components/AddToBasketButton"
import Loader from "@/components/loader"
import { imageUrl } from "@/lib/imageUrl"
import useBasketStore from "@/store/store"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart, Package, CreditCard, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StockData {
  [productId: string]: {
    stock: number
  }
}

function BasketPage() {
  const groupedItems = useBasketStore((state) => state.getGroupedItems())
  const clearBasket = useBasketStore((state) => state.clearBasket)
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stockData, setStockData] = useState<StockData>({})
  const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(true)

  const getBulkPrice = (item: any) => {
    const customTshirtCount = groupedItems
      .filter((cartItem) => cartItem.product.slug?.current?.toLowerCase().includes("t-shirt"))
      .reduce((total, cartItem) => total + cartItem.quantity, 0)

    if (item.product.slug?.current?.toLowerCase().includes("t-shirt") && customTshirtCount >= 2) {
      return 500 // Bulk price
    }
    return item.product.price ?? 0
  }

  const calculateTotalPrice = () => {
    return groupedItems.reduce((total, item) => {
      const itemPrice = getBulkPrice(item)
      return total + itemPrice * item.quantity
    }, 0)
  }

  useEffect(() => {
    setIsClient(true)
    let disable = false
    groupedItems.map((item) => {
      const sizeInfo = item.product?.sizes?.find(({ size }) => size === item.size)
      if (item.size && (!sizeInfo || (sizeInfo?.stock && sizeInfo?.stock < item.quantity))) {
        disable = true
      }
    })
    setIsCheckoutDisabled(disable)
  }, [groupedItems])

  if (!isClient) {
    return <Loader />
  }

  if (groupedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your Basket is Empty</h1>
            <p className="text-gray-600 text-base sm:text-lg mb-8">Add some products to get started!</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalItems = groupedItems.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = calculateTotalPrice()
  const shipping = 90
  const finalTotal = totalPrice

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const cartItems = groupedItems.map((item) => ({
        id: item.product._id,
        name: item.product.name || "Product",
        price: getBulkPrice(item),
        quantity: item.quantity,
        images: item.product.images ? imageUrl(item.product.images[0]).url() : "/placeholder.svg?height=80&width=80",
        size: item.size,
      }))

      sessionStorage.setItem("checkoutItems", JSON.stringify(cartItems))
      sessionStorage.setItem("checkoutTotal", finalTotal.toString())
      router.push("/payment")
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to proceed to checkout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Basket</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your basket
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {groupedItems?.map((item) => {
              const itemPrice = getBulkPrice(item)
              const isDiscounted = itemPrice !== (item.product.price ?? 0)

              return (
                <div
                  key={item.product._id}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div
                      className="w-full sm:w-24 sm:h-24 h-40 flex-shrink-0 cursor-pointer"
                      onClick={() => router.push(`/product/${item.product.slug?.current}`)}
                    >
                      {item.product.images ? (
                        <Image
                          src={imageUrl(item.product.images[0]).url() || "/placeholder.svg"}
                          alt={item.product.name ?? "Product Image"}
                          className="w-full h-full object-cover rounded-lg"
                          width={96}
                          height={96}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-base sm:text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                        onClick={() => router.push(`/product/${item.product.slug?.current}`)}
                      >
                        {item.product.name}
                      </h3>

                      {isDiscounted && (
                        <p className="text-sm font-medium text-green-600 mt-1">🎉 Bulk Discount Applied! (2+ items)</p>
                      )}

                      {item.size && <p className="text-gray-600 mt-1 text-sm sm:text-base">Size: {item.size}</p>}

                      <div className="mt-1">
                        {isDiscounted ? (
                          <div className="flex items-center gap-2">
                            <p className="text-gray-400 line-through text-xs sm:text-sm">
                              {(item.product.price ?? 0).toFixed(2)} EGP each
                            </p>
                            <p className="text-green-600 font-semibold text-sm sm:text-base">
                              {itemPrice.toFixed(2)} EGP each
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-600 text-sm sm:text-base">{itemPrice.toFixed(2)} EGP each</p>
                        )}

                        <p className="text-base sm:text-lg font-semibold text-gray-900 mt-2">
                          Total: {(itemPrice * item.quantity).toFixed(2)} EGP
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AddToBasketButton selectedSize={item.size} product={item.product} />
                    </div>
                  </div>

                  {stockData[item.product._id] && stockData[item.product._id].stock < item.quantity && (
                    <p className="text-red-600 text-sm mt-2">
                      Only {stockData[item.product._id].stock} items available in stock.
                    </p>
                  )}
                </div>
              )
            })}

            {/* Clear Basket */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear your basket?")) {
                    clearBasket()
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Clear Basket
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border md:sticky md:top-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </h3>

              <div className="space-y-3 mb-6 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({totalItems})</span>
                  <span>{totalPrice.toFixed(2)} EGP</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-xs sm:text-sm text-gray-500 italic">90 EGP - Paid upon delivery</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-base sm:text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              {isSignedIn ? (
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <>
                  <h3 className="w-full mx-auto text-center text-sm font-medium text-gray-900 mb-6">
                    To proceed to checkout
                  </h3>
                  <Button variant="destructive" className="mx-auto animate-pulse w-full">
                    <SignInButton mode="modal" />
                  </Button>
                </>
              )}

              {isCheckoutDisabled && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Some items in your basket are out of stock or have insufficient quantity. Please adjust your basket to
                  proceed.
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Secure Payment
                </span>
                <span>•</span>
                <span>SSL Encrypted</span>
                <span>•</span>
                <span>Paymob Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BasketPage
