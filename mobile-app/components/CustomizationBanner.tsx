import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const CustomizationBanner = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/customize')} className="mx-4 my-4">
      <View
        className="rounded-xl shadow-lg p-6 bg-purple-600"
      >
        <View className="flex-row items-center">
          <View className="p-3 bg-white/20 rounded-full">
            <FontAwesome name="paint-brush" size={24} color="white" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-extrabold">Design Your Own Style</Text>
            <Text className="text-white/90 mt-1">Create a unique T-shirt with our design studio.</Text>
          </View>
          <FontAwesome name="chevron-right" size={20} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomizationBanner;
