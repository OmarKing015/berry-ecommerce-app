import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Placeholder logic
    alert('Login functionality not implemented yet.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center">
      <Stack.Screen options={{ title: 'Login' }} />
      <View className="p-8">
        <Text className="text-4xl font-bold text-center mb-8">Welcome Back</Text>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Email Address</Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-lg"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-600 mb-2">Password</Text>
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-lg"
          />
        </View>

        <TouchableOpacity onPress={handleLogin} className="bg-blue-600 py-4 rounded-lg items-center">
          <Text className="text-white font-bold text-lg">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text className="text-blue-600 font-semibold ml-2">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
