"use client";

import { useState, useEffect, use } from "react";
import ProductGrid from "@/components/ProductGrid";
import { searchProductbyName } from "@/sanity/lib/products/searchProductbyName";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Product } from "@/sanity.types";

function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  async function fetchInitialProducts() {
    if (!query) {
      setIsLoading(false);
      return;
    }
    const { products: initialProducts, totalProducts } =
      await searchProductbyName({ query, page: 1, limit: 10 });
    setProducts(initialProducts);
    setTotalProducts(totalProducts);
    setHasMore(initialProducts.length < totalProducts);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchInitialProducts();
  }, [query]);

  const loadMoreProducts = async () => {
    const nextPage = page + 1;
    const { products: newProducts, totalProducts: newTotal } =
      await searchProductbyName({
        query,
        page: nextPage,
        limit: 10,
      });

    setProducts((prevProducts) => [...prevProducts, ...newProducts]);
    setPage(nextPage);
    setHasMore([...products, ...newProducts].length < newTotal);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-4 text-center">
            No products found for "{query}"
          </h1>
          <p className="text-gray-600 text-center">
            Please try searching using different keywords or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Search results for "{query}"
        </h1>
        <ProductGrid products={products} />
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMoreProducts}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
