import { type NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/sanity/lib/orders/createOrder"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      currency, 
      items, 
      customer, 
      assetId, 
      paymobOrderId, 
      paymobTransactionId,
      userId 
    } = body

    // Create order in Sanity only after successful payment
    const orderData = {
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
        product: {
          _key: `item-${Date.now()}-${item.id}`,
          _ref: item.id,
          _type: "reference" as const,
        },
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: amount / 100, // Convert back from cents
      paymentStatus: "completed" as const,
      paymentMethod: "paymob",
      paymobOrderId: paymobOrderId.toString(),
      paymobTransactionId: paymobTransactionId?.toString(),
      fileUrl: assetId,
      orderStatus: "confirmed" as const,
      createdAt: new Date().toISOString(),
    }

    const result = await createOrder(orderData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: "Order created successfully after payment confirmation"
    })

  } catch (error) {
    console.error("Failed to create order on success:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Order creation failed",
      },
      { status: 500 }
    )
  }
}
