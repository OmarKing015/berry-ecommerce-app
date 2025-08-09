import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import useBasketStore, { BasketItem } from '../store/store';
import { Image } from 'expo-image';
import { urlFor } from '../lib/sanityClient';
import { FontAwesome } from '@expo/vector-icons';

const BasketItemCard = ({ item }: { item: BasketItem }) => {
  const { addItem, removeItem } = useBasketStore();

  return (
    <View className="flex-row items-center bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <Image
        source={{ uri: urlFor(item.product.image).width(200).url() }}
        className="w-20 h-20 rounded-md"
      />
      <View className="flex-1 ml-4">
        <Text className="font-bold text-lg">{item.product.name}</Text>
        <Text className="text-gray-500">Size: {item.size}</Text>
        <Text className="font-bold mt-1">{(item.product.price * item.quantity).toFixed(2)} EGP</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={() => removeItem(item.product._id, item.size)} className="p-2">
          <FontAwesome name="minus" size={16} color="red" />
        </TouchableOpacity>
        <Text className="font-bold text-lg">{item.quantity}</Text>
        <TouchableOpacity onPress={() => addItem(item.product, item.size)} className="p-2">
          <FontAwesome name="plus" size={16} color="green" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function BasketScreen() {
  const { items, getTotalPrice, clearBasket } = useBasketStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Stack.Screen options={{ title: 'My Basket' }} />
        <FontAwesome name="shopping-basket" size={64} color="#D1D5DB" />
        <Text className="text-2xl font-bold mt-4">Your basket is empty</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-blue-600 px-8 py-3 rounded-lg">
          <Text className="text-white font-semibold">Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'My Basket' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.product._id}-${item.size}`}
          renderItem={({ item }) => <BasketItemCard item={item} />}
          scrollEnabled={false} // The outer ScrollView handles scrolling
        />
        <View className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg text-gray-600">Subtotal</Text>
            <Text className="text-lg font-bold">{getTotalPrice().toFixed(2)} EGP</Text>
          </View>
          <TouchableOpacity className="bg-blue-600 py-4 rounded-lg items-center">
            <Text className="text-white font-bold text-lg">Proceed to Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearBasket} className="mt-4 py-2 items-center">
            <Text className="text-red-500">Clear Basket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
