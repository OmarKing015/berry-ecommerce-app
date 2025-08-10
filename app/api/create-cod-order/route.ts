import { type NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/sanity/lib/orders/createOrder"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, items,assetId, customer, paymentMethod } = body

    console.log("=== CREATE COD ORDER DEBUG ===")
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Get user info from Clerk
    const { userId } = await auth()
    console.log("User ID:", userId)

    // Validate request data
    if (!amount || !currency || !items || !customer) {
      console.error("Missing required fields:", { amount, currency, items: !!items, customer: !!customer })
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique order ID for COD
    const codOrderId = `COD-${Date.now()}`
    console.log("Generated COD order ID:", codOrderId)

    // Create order in Sanity for COD
    const sanityOrderData = {
      orderId: `ORDER-${Date.now()}`,
      clerkUserId: userId || undefined,
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone,
      shippingAddress: {
        street: customer.address,
        city: customer.city,
        country: customer.country,
        postalCode: customer.postalCode,
      },
      items: items.map((item: any) => ({
        _key: `variant-${item.id}-${item.size}-${Math.random().toString(36).substring(2, 15)}`,
        product: {
          _ref: item.id,
          _type: "reference" as const,
        },
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      })),
      totalAmount: amount / 100, // Convert back from cents
      paymentStatus: "pending" as const, // COD starts as pending
      paymentMethod: paymentMethod || "cod", // Use provided paymentMethod or default to "cod"
      paymobOrderId: codOrderId, // Use COD order ID instead of Paymob ID
     fileUrl:assetId,
      orderStatus: "confirmed" as const, // COD orders are confirmed immediately
      createdAt: new Date().toISOString(),
    }

    console.log("Sanity COD order data:", JSON.stringify(sanityOrderData, null, 2))

    const sanityResult = await createOrder(sanityOrderData)

    if (!sanityResult.success) {
      console.error("Failed to create COD order in Sanity:", sanityResult.error)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    console.log("COD order created successfully:", sanityResult.order?._id)

    // For COD, we don't need to process payment immediately
    // The order is created and will be marked as paid when delivered

    return NextResponse.json({
      success: true,
      orderId: codOrderId,
      sanityOrderId: sanityResult.order?._id,
      message: "COD order created successfully",
    })
  } catch (error) {
    console.error("=== COD ORDER CREATION ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    if (error instanceof Error && error.stack) {
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "COD order creation failed",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}
