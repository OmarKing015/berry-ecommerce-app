import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const SectionTitle = ({ children }) => (
  <Text className="text-2xl font-bold mt-4 mb-2 text-gray-800">{children}</Text>
);

const ShippingPolicyScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ title: 'Shipping Policy' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold mb-4 text-gray-800">Shipping Policy</Text>
        <View>
          <Text className="text-lg mb-3 text-gray-600">
            This is the shipping policy page. We will update this with the actual shipping policy soon.
          </Text>
          <SectionTitle>Shipping Rates & Delivery Estimates</SectionTitle>
          <Text className="text-lg mb-3 text-gray-600">
            Shipping charges for your order will be calculated and displayed at checkout.
          </Text>
          <SectionTitle>Shipment Confirmation & Order Tracking</SectionTitle>
          <Text className="text-lg mb-3 text-gray-600">
            You will receive a shipment confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShippingPolicyScreen;
