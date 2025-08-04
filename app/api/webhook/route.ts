import { type NextRequest, NextResponse } from "next/server";
import {
  updateOrderStatus,
  findOrderByPaymobId,
} from "@/sanity/lib/orders/createOrder";
import { updateMultipleProductsStock } from "@/sanity/lib/products/updateStocks";
import crypto from "crypto";
import { client } from "@/sanity/lib/client";
import { backendClient } from "@/sanity/lib/backendClient";

const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature if HMAC secret is provided
    if (PAYMOB_HMAC_SECRET) {
      const receivedSignature = request.headers.get("x-paymob-signature");

      if (receivedSignature) {
        const expectedSignature = crypto
          .createHmac("sha512", PAYMOB_HMAC_SECRET)
          .update(JSON.stringify(body))
          .digest("hex");

        if (receivedSignature !== expectedSignature) {
          return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
          );
        }
      }
    }

    // Process the webhook based on transaction status
    const { obj: transaction } = body;
    const paymobOrderId = transaction.order.id.toString();

    console.log(`Processing webhook for order: ${paymobOrderId}`);

    switch (transaction.success) {
      case true:
        // Payment successful
        console.log("Payment successful:", paymobOrderId);

        // Update order status in Sanity
        const updateResult = await updateOrderStatus(
          paymobOrderId,
          "processing",
          "completed",
          transaction.id.toString()
        );

        // Stock will be updated when the order is finalized

        // TODO: Send confirmation email
        // TODO: Clear user's basket
        break;

      case false:
        // Payment failed
        console.log("Payment failed:", paymobOrderId);

        // Update order status in Sanity
        await updateOrderStatus(
          paymobOrderId,
          "cancelled",
          "failed",
          transaction.id.toString()
        );

        // TODO: Send failure notification
        break;

      default:
        console.log("Payment pending:", paymobOrderId);
      // Handle pending payment - usually no action needed
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
