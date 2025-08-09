import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const SectionTitle = ({ children }) => (
  <Text className="text-2xl font-bold mt-4 mb-2 text-gray-800">{children}</Text>
);

const TermsAndConditionsScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ title: 'Terms & Conditions' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold mb-4 text-gray-800">Terms and Conditions</Text>
        <View>
          <Text className="text-lg mb-3 text-gray-600">
            Welcome to Mazagk. These are the terms and conditions that will govern your use of our website.
          </Text>
          <SectionTitle>Intellectual Property</SectionTitle>
          <Text className="text-lg mb-3 text-gray-600">
            The content of this website is protected by copyright and trademark laws.
          </Text>
          <SectionTitle>Limitation of Liability</SectionTitle>
          <Text className="text-lg mb-3 text-gray-600">
            We are not liable for any damages that may occur from the use of our website.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;
