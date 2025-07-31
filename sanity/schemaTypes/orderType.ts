import { defineField, defineType } from "sanity"

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkUserId",
      title: "Customer ID (Clerk)",
      type: "string",
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "customerPhone",
      title: "Customer Phone",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      fields: [
        { name: "street", title: "Street", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "country", title: "Country", type: "string" },
        { name: "postalCode", title: "Postal Code", type: "string" },
      ],
    }),
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
            },
            {
              name: "price",
              title: "Price at Purchase",
              type: "number",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "totalAmount",
      title: "Total Amount",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Completed", value: "completed" },
          { title: "Failed", value: "failed" },
          { title: "COD Pending", value: "cod_pending" }, // New status for COD
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Paymob Card", value: "paymob" },
          { title: "Cash on Delivery", value: "cod" },
        ],
      },
      initialValue: "paymob",
    }),
    defineField({
      name: "paymobOrderId",
      title: "Paymob/COD Order ID",
      type: "string",
    }),
    defineField({
      name: "paymobTransactionId",
      title: "Paymob Transaction ID",
      type: "string",
    }),
    defineField({
      name: "orderStatus",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" }, // New status for COD orders
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "codNotes",
      title: "COD Notes",
      type: "text",
      description: "Special instructions for Cash on Delivery orders",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    }),
    defineField({
      name: "fileUrl",
      title: "Custom Design Matrials ",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "orderId",
      subtitle: "customerEmail",
      description: "totalAmount",
      paymentMethod: "paymentMethod",
    },
    prepare({ title, subtitle, description, paymentMethod }) {
      return {
        title: title || "Untitled Order",
        subtitle: subtitle || "No email",
        description: `${description} EGP • ${paymentMethod === "cod" ? "COD" : "Card"}`,
      }
    },
  },
})
