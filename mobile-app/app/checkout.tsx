import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import useBasketStore from '../store/store';

const FormInput = ({ label, value, onChangeText, placeholder, ...props }: any) => (
  <View className="mb-4">
    <Text className="text-gray-600 mb-2">{label}</Text>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-lg"
      {...props}
    />
  </View>
);

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearBasket } = useBasketStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.address || !formData.phone) {
      Alert.alert('Incomplete Form', 'Please fill out all required fields.');
      return;
    }

    // Placeholder action
    console.log('Placing order with data:', formData);
    console.log('Order items:', items);

    Alert.alert(
      'Order Placed!',
      'Thank you for your purchase. (This is a placeholder action)',
      [
        {
          text: 'OK',
          onPress: () => {
            clearBasket();
            router.replace('/(tabs)'); // Go back to home screen
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Checkout' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold mb-6">Shipping Information</Text>

        <FormInput label="First Name" value={formData.firstName} onChangeText={(val:string) => handleInputChange('firstName', val)} placeholder="John" />
        <FormInput label="Last Name" value={formData.lastName} onChangeText={(val:string) => handleInputChange('lastName', val)} placeholder="Doe" />
        <FormInput label="Email" value={formData.email} onChangeText={(val:string) => handleInputChange('email', val)} placeholder="you@example.com" keyboardType="email-address" />
        <FormInput label="Phone" value={formData.phone} onChangeText={(val:string) => handleInputChange('phone', val)} placeholder="+123456789" keyboardType="phone-pad" />
        <FormInput label="Address" value={formData.address} onChangeText={(val:string) => handleInputChange('address', val)} placeholder="123 Main St, Anytown" />

        <View className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-xl font-bold mb-4">Order Summary</Text>
          {items.map(item => (
            <View key={`${item.product._id}-${item.size}`} className="flex-row justify-between mb-2">
              <Text className="flex-1" numberOfLines={1}>{item.product.name} (x{item.quantity})</Text>
              <Text>{(item.product.price * item.quantity).toFixed(2)} EGP</Text>
            </View>
          ))}
          <View className="border-t border-gray-200 mt-2 pt-2">
            <View className="flex-row justify-between">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold">{getTotalPrice().toFixed(2)} EGP</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handlePlaceOrder} className="mt-6 bg-blue-600 py-4 rounded-lg items-center">
          <Text className="text-white font-bold text-lg">Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
