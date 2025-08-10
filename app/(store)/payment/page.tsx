"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  ShoppingCart,
  User,
  MapPin,
  Truck,
  Banknote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import useBasketStore from "@/store/store";

import { BasketItem } from "@/store/store";

interface PaymentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "EG",
    postalCode: "",
  });

  const { items: cartItems, getTotalPrice, clearBasket } = useBasketStore();
  const { assetId } = useAppContext();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
    0
  );
  const shipping = 90;
  const codFee = paymentMethod === "cod" ? 10 : 0;
  const total = subtotal + shipping + codFee;

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
            items: cartItems.map(item => ({
              id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              size: item.size,
            })),
            customer: formData,
            paymentMethod: "cod",
            assetId: assetId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          clearBasket();
          router.push(
            `/payment/success?order_id=${data.orderId}&payment_method=cod`
          );
        } else {
          throw new Error(data.error || "COD order creation failed");
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
            assetId: assetId,
          }),
        });

        const data = await response.json();

        if (data.success && data.paymentUrl) {
          // Redirect to Paymob payment page
          window.location.href = data.paymentUrl;
        } else {
          throw new Error(data.error || "Payment initialization failed");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Order processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Please provide your details for order processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
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
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }
                  >
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
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Credit/Debit Card
                          </p>
                          <p className="text-sm text-gray-600">
                            Secure payment powered by Paymob
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Banknote className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-gray-600">
                            Pay when your order arrives
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "cod" && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-amber-600" />
                      <p className="font-medium text-amber-800">
                        Cash on Delivery Information
                      </p>
                    </div>
                    <ul className="text-sm text-amber-700 space-y-1">
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
          <div className="space-y-6">
            <Card>
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
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.price.toFixed(2)} EGP</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping.toFixed(2)} EGP</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span>Tax (14%)</span>
                    <span>{tax.toFixed(2)} EGP</span>
                  </div> */}
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between">
                      <span>COD Fee</span>
                      <span>{codFee.toFixed(2)} EGP</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
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
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
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
                  <Badge variant="secondary">SSL Encrypted</Badge>
                  <Badge variant="secondary">Safe & Secure</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
