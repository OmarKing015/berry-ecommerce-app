import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutUsScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold mb-4 text-gray-800">About Us</Text>
        <View>
          <Text className="text-lg mb-3 text-gray-600">
            Welcome to Mazagk! We are a company dedicated to providing the best products and services to our customers.
          </Text>
          <Text className="text-2xl font-bold mt-4 mb-2 text-gray-800">Our Mission</Text>
          <Text className="text-lg mb-3 text-gray-600">
            Our mission is to provide high-quality products that bring joy to our customers' lives.
          </Text>
          <Text className="text-2xl font-bold mt-4 mb-2 text-gray-800">Our Team</Text>
          <Text className="text-lg mb-3 text-gray-600">
            We have a dedicated team of professionals who are passionate about what they do.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUsScreen;
