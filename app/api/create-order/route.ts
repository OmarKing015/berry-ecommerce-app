import { type NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/sanity/lib/orders/createOrder";
import { auth } from "@clerk/nextjs/server";

const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;
const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount , currency, items, customer, assetId } = body;
let total = amount * 100
    const { userId } = await auth();

    if (!PAYMOB_SECRET_KEY || !PAYMOB_PUBLIC_KEY) {
      return NextResponse.json(
        { success: false, error: "Paymob configuration missing" },
        { status: 500 }
      );
    }

    // Step 1 — Create Intention
    const intentionRes = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${PAYMOB_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount : amount ,  // in EGP
        currency:"EGP",
        payment_methods: [12 , "card", 2298577], // adjust to your enabled methods
        items: items.map((item: any) => ({
          name: item.name,
          amount: item.price,
          description: item.name,
          quantity: item.quantity,
        })),
        billing_data: {
          apartment: "NA",
          email: customer.email,
          floor: "NA",
          first_name: customer.firstName,
          street: customer.address,
          building: "NA",
          phone_number: customer.phone,
          shipping_method: "PKG",
          postal_code: customer.postalCode,
          city: customer.city,
          country: customer.country,
          last_name: customer.lastName,
          state: "NA",
        },
        customer: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
        },
        extras: { assetId },
      }),
    });

    if (!intentionRes.ok) {
      throw new Error(`Failed to create intention: ${await intentionRes.text()}`);
    }

    const intentionData = await intentionRes.json();
    const clientSecret = intentionData.client_secret;
    const intentionId = intentionData.id?.toString() || ""; // use this for paymobOrderId

    // Step 2 — Create order in Sanity
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
      items: items.map((item: any, idx: number) => ({
        product: {
          _id : item._id,
          _key: `${item.id}-${idx}`,
          _ref: item.id,
          _type: "reference" as const,
        },
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: amount,
      paymentStatus: "pending" as const,
      paymentMethod: "paymob",
      paymobOrderId: intentionId, // now matches your interface
      fileUrl: assetId,
      orderStatus: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    const sanityResult = await createOrder(sanityOrderData);

    return NextResponse.json({
      success: true,
      checkoutUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`,
      clientSecret,
      paymobOrderId: intentionId,
      sanityOrderId: sanityResult.success ? sanityResult.order?._id : null,
    });
  } catch (error) {
    console.error("Unified Checkout Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unified Checkout initialization failed",
      },
      { status: 500 }
    );
  }
}
