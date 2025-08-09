import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import useBasketStore from '../store/store';

type Product = any;

interface AddToBasketButtonProps {
  product: Product;
  selectedSize: string;
  disabled?: boolean;
}

const AddToBasketButton = ({ product, selectedSize, disabled }: AddToBasketButtonProps) => {
  const { addItem, removeItem, getItemCount } = useBasketStore();
  const itemCount = getItemCount(product._id, selectedSize);

  const handleAddItem = () => {
    addItem(product, selectedSize);
  };

  const handleRemoveItem = () => {
    removeItem(product._id, selectedSize);
  };

  const isOutOfStock = product?.stock !== undefined && itemCount >= product.stock;
  const isDisabled = disabled || isOutOfStock;

  if (itemCount === 0) {
    return (
      <TouchableOpacity
        onPress={handleAddItem}
        disabled={isDisabled}
        className={`w-full flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg ${
          isDisabled ? 'bg-gray-300' : 'bg-blue-600'
        }`}
      >
        <FontAwesome name="shopping-cart" size={16} color={isDisabled ? '#6B7280' : 'white'} />
        <Text className={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
          {disabled ? 'Please choose a size' : (isOutOfStock ? 'Out of Stock' : 'Add to Basket')}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
        <TouchableOpacity
          onPress={handleRemoveItem}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center"
        >
          <FontAwesome name="minus" size={16} color="#4B5563" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">{itemCount}</Text>
          <Text className="text-xs text-gray-500">in basket</Text>
        </View>

        <TouchableOpacity
          onPress={handleAddItem}
          disabled={isOutOfStock}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isOutOfStock ? 'bg-gray-200' : 'bg-blue-600'
          }`}
        >
          <FontAwesome name="plus" size={16} color={isOutOfStock ? '#9CA3AF' : 'white'} />
        </TouchableOpacity>
      </View>
      {product?.stock !== undefined && (
        <Text className={`text-center mt-2 text-xs ${isOutOfStock ? 'text-red-600' : 'text-gray-500'}`}>
          {isOutOfStock ? 'Maximum stock reached' : `${product.stock - itemCount} more available`}
        </Text>
      )}
    </View>
  );
};

export default AddToBasketButton;
