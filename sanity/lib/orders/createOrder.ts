import { client } from "@/sanity/lib/client"
import { backendClient } from "../backendClient"
import { auth } from "@clerk/nextjs/server"
import { updateMultipleProductsStock } from "../products/updateStocks"
import { useAppContext } from "@/context/context"

export interface OrderData {
  orderId: string
  clerkUserId?: string
  customerEmail: string
  customerName: string
  customerPhone: string
  shippingAddress: {
    street: string
    city: string
    country: string
    postalCode: string
  }
  items: Array<{
    product: {
      _ref: string
      _type: "reference"
    }
    quantity: number
    price: number
  }>
  totalAmount: number
  paymentStatus: "pending" | "completed" | "failed"
  paymentMethod: string
  paymobOrderId: string
  fileUrl?:string
  paymobTransactionId?: string
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "confirmed"
  createdAt: string
}


async function uploadZipFile(file: Blob) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  console.log("Here are the results", response.json)

  if (!response.ok) {
    throw new Error("File upload failed")
  }

  const result = await response.json()
  return result
}
export async function createOrder(orderData: OrderData) {
  try {
    const order = await backendClient.create({
      _type: "order",
      ...orderData,
    })
   

    if (order) {
      // uploadZipFile(zipFile)
      // Deduct stock for each item in the order
      const stockUpdateItems = orderData.items.map((item) => {
        console.log(`Preparing item for stock update: Product _ref (expected productId) = ${item.product._ref}, Quantity = ${item.quantity}`)
        return {
          productId: item.product._ref, // Use _ref as productId
          quantity: item.quantity,
        }
      })
      console.log("Calling updateMultipleProductsStock with items:", JSON.stringify(stockUpdateItems, null, 2))
      await updateMultipleProductsStock(stockUpdateItems)
    }

    return { success: true, order }
  } catch (error) {
    console.error("Failed to create order in Sanity:", error)
    return { success: false, error }
  }
}

export async function findOrderByPaymobId(paymobOrderId: string) {
  try {
    const order = await client.fetch(`*[_type == "order" && paymobOrderId == $paymobOrderId][0]`, { paymobOrderId })
    return { success: true, order }
  } catch (error) {
    console.error("Failed to find order:", error)
    return { success: false, error }
  }
}

export async function updateOrderStatus(
  paymobOrderId: string,
  orderStatus: OrderData["orderStatus"],
  paymentStatus?: OrderData["paymentStatus"],
  transactionId?: string,
) {
  try {
    // First find the order
    const orderResult = await findOrderByPaymobId(paymobOrderId)

    if (!orderResult.success || !orderResult.order) {
      throw new Error(`Order not found with Paymob ID: ${paymobOrderId}`)
    }

    const updateData: any = {
      orderStatus,
      updatedAt: new Date().toISOString(),
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    if (transactionId) {
      updateData.paymobTransactionId = transactionId
    }

    const result = await client.patch(orderResult.order._id).set(updateData).commit()

    return { success: true, order: result }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { success: false, error }
  }
}

export async function getOrdersByCustomer(customerEmail: string) {
    const {userId} = await auth()

  try {
    const orders = await client.fetch(
      `*[_type == "order" && clerkUserId == $userId] | order(createdAt desc) {
        _id,
        orderId,
        customerEmail,
        customerName,
        totalAmount,
        paymentStatus,
        orderStatus,
        createdAt,
        items[] {
          quantity,
          price,
          product-> {
            _id,
            name,
            image,
            slug
          }
        }
      }`,
      { customerEmail },
    )
    return { success: true, orders }
  } catch (error) {
    console.error("Failed to get customer orders:", error)
    return { success: false, error }
  }
}
