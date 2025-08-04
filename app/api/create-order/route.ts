import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Paymob API configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID

interface PaymobAuthResponse {
  token: string
}

interface PaymobOrderResponse {
  id: number
}

interface PaymobPaymentKeyResponse {
  token: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, items, customer, assetId } = body

    // Get user info from Clerk
    const { userId } = await auth()

    // Validate required environment variables
    if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
      return NextResponse.json({ success: false, error: "Paymob configuration missing" }, { status: 500 })
    }

    // Step 1: Authentication Request
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: PAYMOB_API_KEY,
      }),
    })

    if (!authResponse.ok) {
      throw new Error("Failed to authenticate with Paymob")
    }

    const authData: PaymobAuthResponse = await authResponse.json()
    const authToken = authData.token

    // Step 2: Order Registration
    const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: "true",
        amount_cents: amount,
        currency: currency,
        items: items.map((item: any) => ({
          name: item.name,
          amount_cents: Math.round(item.price * 100),
          description: item.name,
          quantity: item.quantity,
        })),
      }),
    })

    if (!orderResponse.ok) {
      throw new Error("Failed to create order with Paymob")
    }

    const orderData: PaymobOrderResponse = await orderResponse.json()
    const paymobOrderId = orderData.id

    // Step 3: Payment Key Request
    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amount,
        expiration: 3600,
        order_id: paymobOrderId,
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
        currency: currency,
        customer_redirect_url: "https://mazagk.vercel.app/payment/success",
        integration_id: PAYMOB_INTEGRATION_ID,
      }),
    })

    if (!paymentKeyResponse.ok) {
      throw new Error("Failed to create payment key with Paymob")
    }

    const paymentKeyData: PaymobPaymentKeyResponse = await paymentKeyResponse.json()
    const paymentToken = paymentKeyData.token

    // Step 4: Generate payment URL
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`
    
    // Return order data for temporary storage and payment URL
    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId: paymobOrderId,
      paymentToken,
      orderData: {
        amount,
        currency,
        items,
        customer,
        assetId,
        userId,
        createdAt: new Date().toISOString()
      }
    })
   
  } catch (error) {
    console.error("Paymob API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment initialization failed",
      },
      { status: 500 },
    )
  }
}
