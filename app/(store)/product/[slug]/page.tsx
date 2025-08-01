import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { notFound, redirect } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import { All_PRODUCTS_QUERYResult } from "@/sanity.types";

export async function generateStaticParams() {
  const products: All_PRODUCTS_QUERYResult = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug?.current,
  }));
}

async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }
  if (slug === "custom-tshirt") {
    redirect("/customize");
  }

  return <ProductDetailClient product={product} />;
}

export default ProductPage;
