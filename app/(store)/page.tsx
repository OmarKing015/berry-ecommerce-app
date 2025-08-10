"use client";

import { useState, useEffect } from "react";
import CustomizationBanner from "@/components/BlackFirdayBanner";
import ProductsView from "@/components/ProductsView";
import { Button } from "@/components/ui/button";
import { Product } from "@/sanity.types";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import { Category } from "@/sanity.types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchInitialData() {
    const [initialProductData, initialCategories] = await Promise.all([
      getAllProducts({ page: 1, limit: 12 }),
      getAllCategories(),
    ]);

    const filteredProducts = initialProductData.products.filter(
      (product) => !product.slug?.current?.includes("custom")
    );

    filteredProducts.sort(sortProducts);

    setProducts(filteredProducts);
    setCategories(initialCategories);
    setHasMore(
      filteredProducts.length < initialProductData.totalProducts
    );
    setIsLoading(false);
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const loadMoreProducts = async () => {
    const nextPage = page + 1;
    const { products: newProducts, totalProducts } = await getAllProducts({
      page: nextPage,
      limit: 12,
    });

    const filteredNewProducts = newProducts.filter(
      (product) => !product.slug?.current?.includes("custom")
    );

    const combinedProducts = [...products, ...filteredNewProducts];
    combinedProducts.sort(sortProducts);

    setProducts(combinedProducts);
    setPage(nextPage);
    setHasMore(combinedProducts.length < totalProducts);
  };

  const sortProducts = (a: Product, b: Product) => {
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
  };

  return (
    <div>
      <CustomizationBanner />
      <div className="flex flex-col item-center justify-top min-h-screen bg-gray-100 p-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <ProductsView products={products} categories={categories} />
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={loadMoreProducts}>Load More</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
