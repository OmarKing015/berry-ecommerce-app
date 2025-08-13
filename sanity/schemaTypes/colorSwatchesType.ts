import { defineField, defineType } from 'sanity';

export const colorSwatches = defineType({
  name: 'colorSwatches',
  title: 'Color Swatches',
  type: 'document',
  fields: [
    defineField({
      name: 'colorName',
      title: 'Color Name',
      type: 'string',
    }),
    defineField({
      name: 'colorHexCode',
      title: 'Color Hex Code',
      type: 'color',
    }),
    defineField({
      name: 'image',
      title: 'T-Shirt Image',
      type: 'image',
    }),
    defineField({
      name: 'fitStyle',
      title: 'Fit Style',
      type: 'string',
      options: {
        list: [
          { title: 'Slim Fit', value: 'slimFit' },
          { title: 'Oversized Fit', value: 'oversizedFit' },
          { title: 'box Fit', value: 'boxFit' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'colorName',
      media: 'image',
      subtitle: "fitStyle",

    },
  },
});
