import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const success = searchParams.get("success")
  const orderId = searchParams.get("id")
  const paymobTransactionId = searchParams.get("transactionId")

  if (success === "true" && orderId) {
    // Redirect to success page with order details
    return NextResponse.redirect(new URL(`/payment/success?${searchParams.toString()}`, req.url))
  } else {
    return NextResponse.redirect(new URL(`/payment/failed?${searchParams.toString()}`, req.url))
  }
}
