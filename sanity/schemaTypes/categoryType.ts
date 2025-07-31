import { TagIcon } from 'lucide-react';
import { defineType, defineField } from 'sanity';

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon:TagIcon,

  fields: [
    defineField({
      name: 'title',
 title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
 defineField({
      name: 'slug',
 title: 'Slug',
 type: 'slug',
 options: {
 source: 'title',
 maxLength: 96,
      },
    }),
 defineField({
 name: 'description',
 title: 'Description',
      type: 'text',
    }),
  ],
});
