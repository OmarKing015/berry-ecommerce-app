import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons';
import { urlFor } from '../lib/sanityClient';

// Assuming Product type is defined elsewhere and imported
// For now, using 'any' to avoid type errors until we set up types properly.
type Product = any;

const ProductThumb = ({ product, onPress }: { product: Product; onPress: () => void }) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-full ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      <View className="relative aspect-square w-full bg-gray-50">
        {product.image && (
          <Image
            className="object-contain w-full h-full"
            source={{ uri: urlFor(product.image).width(400).url() }}
            alt={product.name || 'Product image'}
            transition={300}
          />
        )}
        {isOutOfStock && (
          <View className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Text className="text-white font-bold text-lg">Out Of Stock</Text>
          </View>
        )}
      </View>

      <View className="p-4 flex-1 flex flex-col justify-between">
        <View>
          <Text className="text-lg font-semibold text-gray-900" numberOfLines={2}>
            {product.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <FontAwesome key={i} name="star" size={12} color="#FFC107" />
            ))}
            <Text className="text-xs text-gray-500 ml-1">(4.8)</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {product.price?.toFixed(2)} EGP
            </Text>
            {product.price && (
              <Text className="text-sm text-gray-500 line-through">
                {(product.price + 150).toFixed(2)} EGP
              </Text>
            )}
            {product.stock != null && !isOutOfStock && (
              <Text className="text-xs text-green-600">{product.stock} in stock</Text>
            )}
          </View>

          {!isOutOfStock && (
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-green-800 text-xs font-medium">Available</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductThumb;
