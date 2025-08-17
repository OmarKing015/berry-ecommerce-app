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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

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

  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    shippingAddress: {
      street: "",
      city: "",
      country: "EG",
      postalCode: "",
    },
    items: [] as CartItem[],
    totalAmount: 0,
    paymentStatus: "pending" as const,
    paymentMethod: "paymob" as "paymob" | "cod",
    orderStatus: "pending" as const,
    paymobOrderId: "",
    paymobTransactionId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const groupedItems = useBasketStore((state) => state.getGroupedItems());

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // const shipping = 90; // COD has higher shipping fee
  // const tax = subtotal * 0.14 // 14% tax
  const total = subtotal;
  const { assetId } = useAppContext();
  const { clearBasket } = useBasketStore();

  useEffect(() => {
    // Get cart data from sessionStorage
    const storedItems = sessionStorage.getItem("checkoutItems");
    const storedTotal = sessionStorage.getItem("checkoutTotal");

    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    }

    if (storedTotal) {
      console.log("Stored total:", storedTotal);
    }
  }, []);

  useEffect(() => {
    // Update order details whenever form data or cart items change
    setOrderDetails((prev) => ({
      ...prev,
      customerEmail: formData.email,
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      customerPhone: formData.phone,
      shippingAddress: {
        street: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      items: cartItems,
      totalAmount: total,
      paymentMethod: "paymob" as "paymob" | "cod",
      updatedAt: new Date().toISOString(),
    }));
    console.log(cartItems)
    console.log(groupedItems)
  }, [formData, cartItems, total, paymentMethod]);

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData((prev) => ({
       ...prev, [field]: value })
    );
   
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Cart Items: "+cartItems)
      console.log("GroupedItems :"+groupedItems)
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
            items: cartItems.map((item) => ({
              name: item.name,
              price: Math.round(item.price * 100), // Convert item price to cents
              description: item.name, // Or a more detailed description if available
              quantity: item.quantity,
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
            amount: Math.round(total * 100),
            currency: "EGP",
            items: cartItems.map((item) => ({
            name:item.name,
              product: {
              
              _key:item.id,
              _ref:item.id,
              _type:"reference" as const
            },
            quantity : item.quantity,
            price: Math.round(item.price * 100),
            size:item.size
              // size: item.product?.size,
            })),
            customer: formData,
            assetId: assetId,
            groupedItems:groupedItems,
          }),
        });
        console.log("Total amount : " + total + "items :" + cartItems);
        const data = await response.json();
        console.log(cartItems)

        if (data.success && data.checkoutUrl) {
          // Redirect to Unified Checkout
          window.location.href = data.checkoutUrl;
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
    
           <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing / Shipping Details */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Street, City" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+20 123 456 7890" />
            </div>

            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={paymentMethod === "cod" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cod")}
                  className="flex-1"
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Cash on Delivery
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex-1"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{item.price.toFixed(2)} EGP</p>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
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
      </div>
    </div>
  );
}
