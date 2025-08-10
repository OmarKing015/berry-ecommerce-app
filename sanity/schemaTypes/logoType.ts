import { defineField, defineType } from "sanity";
import { Image as ImageIcon } from "lucide-react";

export const logoType = defineType({
  name: "logo",
  title: "Logos",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "name",
      title: "Logo Name",
      type: "string",
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
      media: "image",
    },
  },
});
