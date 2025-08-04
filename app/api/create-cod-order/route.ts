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

    // For COD, we just generate an order ID and return it.
    // The order will be created on the success page.
    return NextResponse.json({
      success: true,
      orderId: codOrderId,
      message: "COD order initiated successfully",
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
