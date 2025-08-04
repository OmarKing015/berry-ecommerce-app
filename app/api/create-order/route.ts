// File: /app/api/create-order/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/sanity/lib/orders/createOrder";
import { auth } from "@clerk/nextjs/server";

const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY!; // format: sk_test_xxx
const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY!; // format: pk_test_xxx
const PAYMOB_INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID!); // example: 4345907
const REDIRECTION_URL = "https://mazagk.vercel.app/payment/success";
const NOTIFICATION_URL = "https://mazagk.vercel.app/api/paymob-webhook"; // you can change to webhook.site for testing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, items, customer, assetId } = body;
    const { userId } = await auth();

    const response = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Authorization": `Token ${PAYMOB_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        payment_methods: [PAYMOB_INTEGRATION_ID],
        billing_data: {
          apartment: "NA",
          first_name: customer.firstName,
          last_name: customer.lastName,
          street: customer.address,
          building: "NA",
          phone_number: customer.phone,
          city: customer.city,
          country: customer.country,
          email: customer.email,
          floor: "NA",
          state: "NA"
        },
        items: items.map((item: any) => ({
          name: item.name.slice(0, 50),
          amount: Math.round(item.price * 100),
          description: item.name.slice(0, 255),
          quantity: item.quantity,
        })),
        extras: { assetId },
        special_reference: `ORDER-${Date.now()}`,
        expiration: 3600,
        notification_url: NOTIFICATION_URL,
        redirection_url: REDIRECTION_URL
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    const data = await response.json();
    const clientSecret = data.client_secret;

    // Store order in Sanity (optional)
    await createOrder({
      orderId: data.special_reference,
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
        product: { _ref: item.id, _type: "reference" },
        _key: `variant-${item.id}-${Math.random().toString(36).substring(2, 15)}`,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: amount / 100,
      paymentStatus: "pending",
      paymentMethod: "paymob",
      fileUrl: assetId,
      paymobOrderId: data.intention_order_id.toString(),
      orderStatus: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      redirectUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`
    });
  } catch (err: any) {
    console.error("Error creating Paymob intention:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
