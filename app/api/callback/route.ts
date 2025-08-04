import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const success = searchParams.get("success");

  if (success === "true") {
    // Redirect to the success page with all parameters
    const params = new URLSearchParams(searchParams.toString());
 return NextResponse.redirect(
 new URL(`/payment/success?${params.toString()}`, req.url)
 );
  } else {
    // Redirect to the failed page with all parameters
    const params = new URLSearchParams(searchParams.toString());
 return NextResponse.redirect(
 new URL(`/payment/failed?${params.toString()}`, req.url)
 );
  }
}
