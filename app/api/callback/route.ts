import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const success = searchParams.get("success");
  const orderId = searchParams.get("id");

  if (success === "true") {
    return NextResponse.redirect(new URL(`/payment/success?orderId=${orderId}`, req.url));
  } else {
    return NextResponse.redirect(new URL("/payment/failed", req.url));
  }
}
