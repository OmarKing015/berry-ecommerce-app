import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const GET = async (request: NextRequest) => {
  try {
    const productId = request.nextUrl.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const product = await client.fetch(`*[_type == \"product\" && _id == $productId][0]{size}`, { productId });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Transform the size array into a stock data object
    const stockData: { [size: string]: number } = {};
    product.sizes?.forEach((s: { size: string; stock: number }) => {
      stockData[s.size] = s.stock;
    });

    return NextResponse.json({ stockData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching product stock:", error);
    return NextResponse.json({ error: 'Failed to fetch product stock' }, { status: 500 });
  }
};