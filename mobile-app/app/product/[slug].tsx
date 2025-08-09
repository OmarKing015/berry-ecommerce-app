import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { getProductBySlug } from '../../lib/getProducts';
import { urlFor } from '../../lib/sanityClient';

import AddToBasketButton from '../../components/AddToBasketButton';

// Placeholder for SizeSelector
const SizeSelector = ({ sizes, selectedSize, onSelectSize, disabled }: any) => (
  <View>
    <Text className="text-lg font-semibold text-gray-800 mb-3">Select Size</Text>
    <View className="flex-row flex-wrap gap-3">
      {sizes?.map((size: string) => (
        <TouchableOpacity
          key={size}
          onPress={() => onSelectSize(size)}
          disabled={disabled}
          className={`px-4 py-2 rounded-md border ${
            selectedSize === size ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
          }`}
        >
          <Text className={`${selectedSize === size ? 'text-white' : 'text-gray-800'}`}>{size}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);


export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    if (slug) {
      const fetchData = async () => {
        setLoading(true);
        const fetchedProduct = await getProductBySlug(slug);
        setProduct(fetchedProduct);
        setLoading(false);
      };
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Product not found.</Text>
      </View>
    );
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;
  const requiresSize = product.size && product.size.length > 0;
  const isButtonDisabled = isOutOfStock || (requiresSize && !selectedSize);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: product.name || 'Product' }} />
      <ScrollView>
        <View className="bg-white">
          <Image
            source={{ uri: urlFor(product.image).width(800).url() }}
            className="w-full aspect-square"
          />
          {isOutOfStock && (
            <View className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm">Out of Stock</Text>
            </View>
          )}
        </View>
        <View className="p-6 space-y-6">
          <View>
            <Text className="text-4xl font-extrabold text-gray-900">{product.name}</Text>
            <Text className="text-gray-600 text-lg mt-2">{product.description}</Text>
            <View className="flex-row items-baseline gap-2 mt-4">
              <Text className="text-5xl font-bold text-gray-900">
                {product.price?.toFixed(2)} EGP
              </Text>
              <Text className="text-sm text-gray-500 line-through">
                {(product.price + 150).toFixed(2)} EGP
              </Text>
            </View>
          </View>

          {requiresSize && (
            <SizeSelector
              sizes={product.size}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              disabled={isOutOfStock}
            />
          )}

          <AddToBasketButton
            product={product}
            selectedSize={selectedSize}
            disabled={isButtonDisabled}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
