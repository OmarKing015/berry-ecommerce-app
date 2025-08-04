import { type NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/sanity/lib/orders/createOrder"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      clerkUserId,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      paymentStatus,
      paymentMethod,
      paymobOrderId,
      fileUrl,
      orderStatus,
    } = body

    const sanityOrderData = {
      orderId,
      clerkUserId,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      paymentStatus,
      paymentMethod,
      paymobOrderId,
      fileUrl,
      orderStatus,
      createdAt: new Date().toISOString(),
    }

    const sanityResult = await createOrder(sanityOrderData)

    if (!sanityResult.success) {
      console.error("Failed to create order in Sanity:", sanityResult.error)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orderId: sanityResult.order?.orderId,
      sanityOrderId: sanityResult.order?._id,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("=== ORDER FINALIZATION ERROR ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Order finalization failed",
      },
      { status: 500 },
    )
  }
}
