import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug"
import { notFound, redirect } from "next/navigation"
import ProductDetailClient from "@/components/ProductDetailClient"

async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const  slug  = (await params).slug
  const product = await getProductBySlug(slug)

  if (!product) {
    return notFound()
  }
  if(slug === "custom-tshirt"){
    redirect("/customize")
  }

  return <ProductDetailClient product={product} />
}

export default ProductPage
