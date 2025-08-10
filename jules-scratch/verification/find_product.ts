import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
import { backendClient } from '../../sanity/lib/backendClient';

async function findProduct() {
  try {
    const product = await backendClient.fetch(`*[_type == "product" && defined(sizes)][0]`);
    if (product) {
      console.log(product.slug.current);
    } else {
      console.log("No product with sizes found.");
    }
  } catch (error) {
    console.error(error);
  }
}

findProduct();
