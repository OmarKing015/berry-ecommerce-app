import { NextRequest, NextResponse } from "next/server"
import { backendClient } from "@/sanity/lib/backendClient"
import { client } from "@/sanity/lib/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Paymob Webhook Received:", JSON.stringify(body, null, 2))

    // Extract payment details from Paymob webhook
    const {
      obj: {
        id: transactionId,
        order: { id: paymobOrderId },
        success,
        amount_cents,
        currency,
        created_at,
        pending,
        paid,
        refunded,
        source_data,
      },
    } = body

    // Find the order in Sanity by paymobOrderId
    const order = await client.fetch(
      `*[_type == "order" && paymobOrderId == $paymobOrderId][0]`,
      { paymobOrderId: paymobOrderId.toString() }
    )

    if (!order) {
      console.error(`Order not found with Paymob ID: ${paymobOrderId}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (success && paid) {
      // Payment successful - update order status
      const updateResult = await backendClient
        .patch(order._id)
        .set({
          paymentStatus: "completed",
          orderStatus: "confirmed",
          paymobTransactionId: transactionId.toString(),
          updatedAt: new Date().toISOString(),
        })
        .commit()

      console.log(`Order ${order._id} payment completed successfully`)
      return NextResponse.json({ success: true, orderId: order._id })
    } else if (!success || refunded) {
      // Payment failed or refunded - delete the order
      await backendClient.delete(order._id)
      console.log(`Order ${order._id} deleted due to failed/refunded payment`)
      return NextResponse.json({ success: true, deleted: true, orderId: order._id })
    } else {
      // Payment pending or other status
      console.log(`Order ${order._id} payment status: ${pending ? "pending" : "unknown"}`)
      return NextResponse.json({ success: true, status: "pending" })
    }
  } catch (error) {
    console.error("Paymob Webhook Error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Paymob webhook endpoint active" })
}
