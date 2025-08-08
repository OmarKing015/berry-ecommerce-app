import CustomizationBanner from "@/components/BlackFirdayBanner";
import ProductsView from "@/components/ProductsView";
import { Button } from "@/components/ui/button";
import { Product } from "@/sanity.types";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export default async function Home() {
  const products: Product[] = await getAllProducts();
  const updatedProducts = products.filter(product => !product.slug?.current?.includes("custom"));
  
  updatedProducts.sort((a, b) => {
    const aStartsWithArrival = a.slug?.current?.startsWith("top") ? -1 : 0;
    const bStartsWithArrival = b.slug?.current?.startsWith("top") ? -1 : 0;

    if (aStartsWithArrival !== bStartsWithArrival) {
 return aStartsWithArrival - bStartsWithArrival;
    }
    
    const aEndsWithDown = a.slug?.current?.startsWith("bottom") ? 1 : 0;
    const bEndsWithDown = b.slug?.current?.startsWith("bottom") ? 1 : 0;
    if (aEndsWithDown !== bEndsWithDown) {
      return aEndsWithDown - bEndsWithDown;
    }
    return a.slug?.current?.localeCompare(b.slug?.current ?? "") ?? 0;
  });
  const categories = await getAllCategories();


  return (
    <div>
      <CustomizationBanner/>
      <div className="flex flex-col item-center justify-top min-h-screen bg-gray-100 p-4">
        <ProductsView products={updatedProducts} categories={categories} />
      </div>
    </div>
  );
}
