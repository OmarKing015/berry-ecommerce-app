import CustomizationBanner from "@/components/BlackFirdayBanner";
import ProductsView from "@/components/ProductsView";
import { Button } from "@/components/ui/button";
import { Product } from "@/sanity.types";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import Image from "next/image";

export default async function Home() {
  const products: Product[] = await getAllProducts();
  const updatedProducts = products.filter(product => product.slug?.current !== "custom-tshirt");
  
  updatedProducts.sort((a, b) => {
    if (a.name && b.name) return a.name.localeCompare(b.name);
    return 0;
  });
  const categories = await getAllCategories();
  const updatedCategories = categories.filter((category: {
    name:string,
    slug: {
      current: string;
    }

  }) => category.slug?.current !== "custom-design");
  return (
    <div>
      <CustomizationBanner/>
      <div className="flex flex-col item-center justify-top min-h-screen bg-gray-100 p-4">
        <ProductsView products={updatedProducts} categories={categories} />
      </div>
    </div>
  );
}
