"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, ShoppingCart, User, MapPin, Truck, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/context"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface PaymentFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "EG",
    postalCode: "",
  })

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const {assetId} = useAppContext()

  useEffect(() => {
    // Get cart data from sessionStorage
    const storedItems = sessionStorage.getItem("checkoutItems")
    const storedTotal = sessionStorage.getItem("checkoutTotal")

    if (storedItems) {
      setCartItems(JSON.parse(storedItems))
    }

    if (storedTotal) {
      console.log("Stored total:", storedTotal)
    }
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = paymentMethod === "cod" ? 25 : 15.99 // COD has higher shipping fee
  // const tax = subtotal * 0.14 // 14% tax
  const codFee = paymentMethod === "cod" ? 10 : 0 // COD processing fee
  const total = subtotal + shipping + codFee

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        const response = await fetch("/api/create-cod-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to cents
            currency: "EGP",
            items: cartItems,
            customer: formData,
            paymentMethod: "cod",
            assetId:assetId,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Redirect to COD success page
          router.push(`/payment/cod-success?order_id=${data.orderId}`)
        } else {
          throw new Error(data.error || "COD order creation failed")
        }
      } else {
        // Handle Card Payment with Paymob
        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to cents
            currency: "EGP",
            items: cartItems,
            customer: formData,
            assetId:assetId,
          }),
        })

        const data = await response.json()

        if (data.success && data.paymentUrl) {
          // Redirect to Paymob payment page
          window.location.href = data.paymentUrl
        } else {
          throw new Error(data.error || "Payment initialization failed")
        }
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Order processing failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>Please provide your details for order processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" value={formData.postalCode} onChange={(e) => handleInputChange("postalCode", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EG">Egypt</SelectItem>
                      <SelectItem value="SA">Saudi Arabia</SelectItem>
                      <SelectItem value="AE">UAE</SelectItem>
                      <SelectItem value="JO">Jordan</SelectItem>
                      <SelectItem value="LB">Lebanon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <Label htmlFor="card" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">Secure payment powered by Paymob</p>
                        </div>
                      </div>
                    </div>
                  </Label>

                  <Label htmlFor="cod" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Banknote className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                {paymentMethod === "cod" && (
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-amber-500" />
                      <p className="font-medium text-amber-500">Cash on Delivery Information</p>
                    </div>
                    <ul className="text-sm text-amber-500/80 space-y-1">
                      <li>• Additional COD processing fee: 10 EGP</li>
                      <li>• Higher shipping fee applies</li>
                      <li>• Payment due upon delivery</li>
                      <li>• Please have exact change ready</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{item.price.toFixed(2)} EGP</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping.toFixed(2)} EGP</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between">
                      <span>COD Fee</span>
                      <span>{codFee.toFixed(2)} EGP</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg text-foreground">
                    <span>Total</span>
                    <span>{total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    "Processing..."
                  ) : paymentMethod === "cod" ? (
                    <>
                      <Banknote className="mr-2 h-4 w-4" />
                      Place COD Order
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {paymentMethod === "cod" ? (
                      <>
                        <Banknote className="h-3 w-3" />
                        Cash on Delivery
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-3 w-3" />
                        Secure Payment
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline">SSL Encrypted</Badge>
                  <Badge variant="outline">Safe & Secure</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
