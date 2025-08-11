import { defineField, defineType } from 'sanity';

export const templeteLogos = defineType({
  name: 'templeteLogos',
  title: 'Templete Logos',
  type: 'document',
  fields: [
    defineField({
      name: 'logoName',
      title: 'Logo Name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'T-Shirt Image',
      type: 'image',
    }),
  ],
  preview: {
    select: {
      title: 'logoName',
      media: 'image',
    },
  },
});
