import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { getMyOrders } from '../../lib/getOrders';
import { FontAwesome } from '@expo/vector-icons';

type Order = any;

// A placeholder for user state. In a real app, this would come from a context or auth store.
const useUser = () => ({ user: null }); // or { user: { id: 'mock-user-123' } } to test the logged-in state

const OrderCard = ({ order }: { order: Order }) => (
  <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
    <View className="flex-row justify-between items-center border-b border-gray-100 pb-2 mb-2">
      <Text className="font-bold text-lg">Order #{order.orderId}</Text>
      <Text className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</Text>
    </View>
    <View className="flex-row justify-between items-center mt-2">
      <Text className="text-gray-600">Status</Text>
      <Text className={`font-bold ${order.orderStatus === 'Shipped' ? 'text-green-600' : 'text-orange-500'}`}>
        {order.orderStatus}
      </Text>
    </View>
    <View className="flex-row justify-between items-center mt-1">
      <Text className="text-gray-600">Total</Text>
      <Text className="font-bold text-lg">{order.totalAmount.toFixed(2)} EGP</Text>
    </View>
  </View>
);

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const fetchedOrders: any = await getMyOrders(user.id);
        setOrders(fetchedOrders);
        setLoading(false);
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" className="mt-8" />;
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center p-8">
        <Stack.Screen options={{ title: 'My Orders' }} />
        <FontAwesome name="user-circle" size={64} color="#D1D5DB" />
        <Text className="text-2xl font-bold mt-4 text-center">Track your orders</Text>
        <Text className="text-gray-600 mt-2 text-center mb-6">Sign in to view your order history and status.</Text>
        <TouchableOpacity onPress={() => router.push('/auth/login')} className="w-full bg-blue-600 px-8 py-3 rounded-lg items-center">
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'My Orders' }} />
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">You have no orders yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
