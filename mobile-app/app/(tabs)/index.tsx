import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getAllProducts, getAllCategories } from '../../lib/getProducts';
import ProductThumb from '../../components/ProductThumb';
import CustomizationBanner from '../../components/CustomizationBanner';

// Assuming types are defined elsewhere
type Product = any;
type Category = any;

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);

      // Replicate the filtering and sorting logic from the original website
      const updatedProducts = fetchedProducts.filter(
        (product: Product) => !product.slug?.current?.includes('custom')
      );

      updatedProducts.sort((a: Product, b: Product) => {
        const aStartsWithArrival = a.slug?.current?.startsWith('top') ? -1 : 0;
        const bStartsWithArrival = b.slug?.current?.startsWith('top') ? -1 : 0;
        if (aStartsWithArrival !== bStartsWithArrival) {
          return aStartsWithArrival - bStartsWithArrival;
        }
        const aEndsWithDown = a.slug?.current?.startsWith('bottom') ? 1 : 0;
        const bEndsWithDown = b.slug?.current?.startsWith('bottom') ? 1 : 0;
        if (aEndsWithDown !== bEndsWithDown) {
          return aEndsWithDown - bEndsWithDown;
        }
        return a.slug?.current?.localeCompare(b.slug?.current ?? '') ?? 0;
      });

      setProducts(updatedProducts);
      setCategories(fetchedCategories);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.slug.current}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  // TODO: Add category filter UI later
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View className="w-1/2 p-2">
            <ProductThumb product={item} onPress={() => handleProductPress(item)} />
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8 }}
        ListHeaderComponent={
          <View>
            <CustomizationBanner />
            <View className="px-4 pb-4">
              <Text className="text-3xl font-bold text-gray-800">Our Products</Text>
              <Text className="text-md text-gray-500">Explore our collection</Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
