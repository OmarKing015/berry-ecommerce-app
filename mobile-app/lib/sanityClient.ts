import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = 'fjq8mivd';
const dataset = 'production';
const apiVersion = '2025-07-14';
const token = 'skLnXdVYULy9Ofr0XDrakXevUN2AdlWtYuvbMBcBTlhba4LWkAHQlJ3bHr912ahCeCUEfNALh6caZsMNhDxfDbQRpQwLNozAZIOYsG1u8QOPejzYJjUyxXiV0lzAXd1Vw0SC4aPrMymbDTNNgwo0GyLUVMmInxallgPFVMBSwYcO5YYYjObC';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // `false` if you want to ensure fresh data
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
