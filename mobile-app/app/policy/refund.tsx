import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const SectionTitle = ({ children }) => (
  <Text className="text-2xl font-bold mt-4 mb-2 text-gray-800">{children}</Text>
);

const RefundPolicyScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ title: 'Refund Policy' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold mb-4 text-gray-800">Refund Policy</Text>
        <View>
          <Text className="text-lg mb-3 text-gray-600">
            This is the refund policy page. We will update this with the actual refund policy soon.
          </Text>
          <SectionTitle>Returns</SectionTitle>
          <Text className="text-lg mb-3 text-gray-600">
            Our policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.
          </Text>
          <SectionTitle>Refunds</SectionTitle>
          <Text className="text-lg mb-3 text-gray-600">
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RefundPolicyScreen;
