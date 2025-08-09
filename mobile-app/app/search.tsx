import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { searchProducts } from '../lib/getProducts';
import ProductThumb from '../components/ProductThumb';
import { debounce } from 'lodash';

type Product = any;

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (text: string) => {
    if (text.length > 2) {
      setLoading(true);
      const searchResults = await searchProducts(text);
      setResults(searchResults);
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.slug.current}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Search Products' }} />
      <View className="p-4 bg-white border-b border-gray-200">
        <TextInput
          placeholder="Search for products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-lg"
          autoFocus
        />
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      )}

      {!loading && results.length === 0 && searchTerm.length > 2 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No products found for "{searchTerm}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View className="w-1/2 p-2">
            <ProductThumb product={item} onPress={() => handleProductPress(item)} />
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8 }}
      />
    </SafeAreaView>
  );
}
