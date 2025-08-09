import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import Toolbar from '../../components/customizer/Toolbar';

import CanvasWrapper from '../../components/customizer/CanvasWrapper';

const CostSummary = ({ onAddToBasket }: { onAddToBasket: () => void }) => (
  <View className="bg-white p-4 border-t border-gray-200">
    <TouchableOpacity
      onPress={onAddToBasket}
      className="bg-blue-600 py-4 rounded-lg items-center"
    >
      <Text className="text-white font-bold text-lg">Add to Basket</Text>
    </TouchableOpacity>
  </View>
);

import { Image } from 'expo-image';
import { useEditorStore } from '../store/editorStore';

// Mock images for now, will replace with actual assets later
const TSHIRT_IMAGES = {
  slim: 'https://via.placeholder.com/500x500.png?text=Slim+T-Shirt',
  oversized: 'https://via.placeholder.com/500x500.png?text=Oversized+T-Shirt',
};

import { useRef } from 'react';
import type { Canvas } from 'react-native-canvas';
import useBasketStore from '../store/store';
import { useRouter } from 'expo-router';

export default function CustomizeScreen() {
  const { shirtStyle } = useEditorStore();
  const canvasRef = useRef<Canvas>(null);
  const addItem = useBasketStore(state => state.addItem);
  const router = useRouter();

  const handleAddToBasket = () => {
    if (canvasRef.current) {
      // toDataURL is async in react-native-canvas
      canvasRef.current.toDataURL('image/png').then(dataURL => {
        const customProduct = {
          _id: `custom-${Date.now()}`,
          name: `Custom ${shirtStyle} T-Shirt`,
          price: 999.00, // Placeholder price
          image: dataURL, // Use the dataURL as the image
        };
        // For simplicity, we'll use a fixed size.
        // A real implementation would need a size selector here.
        addItem(customProduct, 'M');
        router.push('/basket');
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Design Studio' }} />
      <View className="flex-1 lg:flex-row">
        <Toolbar />
        <View className="flex-1 items-center justify-center bg-gray-100 p-4">
          <View className="w-full max-w-md aspect-square">
            <Image
              source={{ uri: TSHIRT_IMAGES[shirtStyle] }}
              className="absolute inset-0 w-full h-full"
              contentFit="contain"
            />
            <View className="absolute inset-0">
              <CanvasWrapper ref={canvasRef} />
            </View>
          </View>
        </View>
        <CostSummary onAddToBasket={handleAddToBasket} />
      </View>
    </SafeAreaView>
  );
}
