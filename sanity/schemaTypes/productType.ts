import { TagIcon, ShoppingBasketIcon, ShoppingCartIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: ShoppingCartIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),

    // defineField({
    //   name: "image",
    //   title: "Image",
    //   type: "image",
    // }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          name: "image",
          type: "image",
        },
      ],
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "sizes",
      title: "Size",
      type: "array",
      validation: (Rule) => Rule.required().min(0),
      of: [
        {
          type: "object",
          fields: [
            { name: "size", type: "string" },
            {
              name: "stock",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      subtitle: "price",
    },
    prepare(_select) {
      return {
        title: _select.title,
        media: _select.media,
        subtitle: "Price: " + _select.subtitle,
      };
    },
  },
});
