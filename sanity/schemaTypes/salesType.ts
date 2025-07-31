import { TagIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const salesType = defineType({
  name: "sale",
  title: "Sale",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Sale Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Sale Description",
      type: "text",
    }),
    defineField({
      name: "discountedAmount",
      title: "Discounted Amount",
      type: "number",
      description: "Enter the amount of the sale in percentage or fixed value",
    }),
    defineField({
      name: "couponCode",
      title: "Coupon Code",
      type: "string",
    }),
    defineField({
      name: "validFrom",
      title: "Start Date",
      type: "datetime",
    }),
    defineField({
      name: "validUntil",
      title: "End Date",
      type: "datetime",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to Activate/Deactivate the sale",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "discountedAmount",
      couponCode: "couponCode",
      isActive: "isActive",
    },
    prepare(_select) {
      return {
        title: _select.title,
        subtitle: `${_select.subtitle}% off Code: ${_select.couponCode}`,
        subtitle3: _select.isActive ? "Active" : "Inactive",
      };
    },
  },
});
