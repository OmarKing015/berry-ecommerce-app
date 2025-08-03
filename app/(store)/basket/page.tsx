"use client"

import AddToBasketButton from "@/components/AddToBasketButton"
import Loader from "@/components/loader"
import { imageUrl } from "@/lib/imageUrl"
import useBasketStore from "@/store/store"
import { SignInButton, useAuth, useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart, Package, CreditCard, ArrowRight, Trash2 } from "lucide-react"
import { useAppContext } from "@/context/context"

function BasketPage() {
  const groupedItems = useBasketStore((state) => state.getGroupedItems())
  const clearBasket = useBasketStore((state) => state.clearBasket)
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Loader />
  }

  if (groupedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Basket is Empty</h1>
            <p className="text-gray-600 text-lg mb-8">Add some products to get started!</p>
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
  const totalPrice = useBasketStore.getState().getTotalPrice()
  const shipping = 50 // Free shipping over 500 EGP
  // const tax = totalPrice * 0.14 // 14% tax
  const finalTotal = totalPrice + shipping 

  const handleCheckout = async () => {
    // if (!isSignedIn) {
    //   return
    // }

    setIsLoading(true)

    try {
      // Prepare cart data for Paymob
      const cartItems = groupedItems.map((item) => ({
        id: item.product._id,
        name: item.product.name || "Product",
        price: item.product.price || 0,
        quantity: item.quantity,
        image: item.product.image ? imageUrl(item.product.image).url() : "/placeholder.svg?height=80&width=80",
        size: item.size,
      }))

      // Store cart data in sessionStorage for the payment page
      sessionStorage.setItem("checkoutItems", JSON.stringify(cartItems))
      sessionStorage.setItem("checkoutTotal", finalTotal.toString())

      // Navigate to payment page
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
          <h1 className="text-3xl font-bold text-gray-900">Your Basket</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your basket
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {groupedItems?.map((item) => (
              <div
                key={item.product._id}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer"
                    onClick={() => router.push(`/product/${item.product.slug?.current}`)}
                  >
                    {item.product.image ? (
                      <Image
                        src={imageUrl(item.product.image).url() || "/placeholder.svg"}
                        alt={item.product.name ?? "Product Image"}
                        className="w-full h-full object-cover rounded-lg"
                        width={96}
                        height={96}
                      />
                    ) : (<div></div>)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                      onClick={() => router.push(`/product/${item.product.slug?.current}`)}
                    >
                      {item.product.name}
                    </h3>
                    {/* {item.product.slug?.current === "custom-tshirt" && extraCost > 0 && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        + {extraCost.toFixed(2)} EGP (Customization)
                      </p>
                    )} */}
                    {item.size && <p className="text-gray-600 mt-1">Size: {item.size}</p>}

                    {item?.product?.slug?.current ? (<><p className="text-gray-600 mt-1">{(item.product.price ?? 0).toFixed(2)} EGP each</p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        Total: {((item.product.price ?? 0)  * item.quantity).toFixed(2)}EGP
                      </p></>) : (<><p className="text-gray-600 mt-1">{(item.product.price ?? 0).toFixed(2)} EGP each</p>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          Total: {((item.product.price ?? 0) * item.quantity).toFixed(2)}EGP
                        </p></>)}
                  </div>

                  <div className="flex items-center gap-2">
                    <AddToBasketButton selectedSize={item.size} product={item.product} />
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Basket Button */}
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
            <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({totalItems})</span>
                  <span>{totalPrice.toFixed(2)} EGP</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping}</span>
                </div>

                {/* <div className="flex justify-between text-gray-600">
                  <span>Tax (14%)</span>
                  <span>{tax.toFixed(2)} EGP</span>
                </div> */}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              {/* {shipping > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    Add {(500 - totalPrice).toFixed(2)} EGP more for free shipping!
                  </p>
                </div>
              )} */}

              {/* {isSignedIn ? (
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
                <SignInButton />
              )} */}
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
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
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
