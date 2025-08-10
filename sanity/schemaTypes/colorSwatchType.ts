import { defineField, defineType } from "sanity";
import { Palette as PaletteIcon } from "lucide-react";

export const colorSwatchType = defineType({
  name: "colorSwatch",
  title: "Color Swatches",
  type: "document",
  icon: PaletteIcon,
  fields: [
    defineField({
      name: "name",
      title: "Swatch Name",
      type: "string",
    }),
    defineField({
      name: "hexCode",
      title: "Hex Code",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["slim", "oversized"],
      },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "hexCode",
      media: "image",
    },
  },
});
