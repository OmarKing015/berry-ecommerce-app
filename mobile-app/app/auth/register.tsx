import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleRegister = () => {
    // Placeholder logic
    alert('Registration functionality not implemented yet.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center">
      <Stack.Screen options={{ title: 'Create Account' }} />
      <View className="p-8">
        <Text className="text-4xl font-bold text-center mb-8">Create an Account</Text>

        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Username</Text>
          <TextInput
            placeholder="your_username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-lg"
          />
        </View>

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

        <TouchableOpacity onPress={handleRegister} className="bg-blue-600 py-4 rounded-lg items-center">
          <Text className="text-white font-bold text-lg">Create Account</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text className="text-blue-600 font-semibold ml-2">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
