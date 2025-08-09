import React from 'react';
import { Text, View, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const SectionTitle = ({ children }) => (
  <Text className="text-2xl font-semibold mt-8 mb-4 text-gray-800">{children}</Text>
);

const P = ({ children, className = '' }) => (
  <Text className={`mb-4 text-gray-700 ${className}`}>{children}</Text>
);

const ListItem = ({ children }) => (
  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
    <Text style={{ marginRight: 8, color: '#374151' }}>•</Text>
    <Text style={{ flex: 1, color: '#374151' }}>{children}</Text>
  </View>
);

const PrivacyPolicyScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@yourdomain.com').catch(err => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-4xl font-bold mb-6 text-gray-800">Privacy Policy</Text>

        <P>
          <Text className="font-bold">Effective Date:</Text> 2025/8
        </P>

        <P>
          This Privacy Policy describes how <Text className="font-bold">https://mazagk.vercel.app</Text> ("we", "us", or "our") collects, uses, and protects your personal data when you use our website located at <Text className="font-bold">https://mazagk.vercel.app</Text> and all related services (collectively, the "Services").
        </P>

        <P>By accessing or using our Services, you agree to the terms of this Privacy Policy.</P>

        <SectionTitle>1. Information We Collect</SectionTitle>
        <View>
          <ListItem><Text className="font-bold">Personal Information:</Text> Name, email, shipping address, account credentials, etc.</ListItem>
          <ListItem><Text className="font-bold">Design Data:</Text> Uploaded images, fonts, text, and selected design elements.</ListItem>
          <ListItem><Text className="font-bold">Transaction Data:</Text> Orders, items purchased, payment confirmations.</ListItem>
          <ListItem><Text className="font-bold">Technical Data:</Text> IP address, browser type, OS, and usage behavior.</ListItem>
        </View>

        <SectionTitle>2. How We Use Your Information</SectionTitle>
        <View>
          <ListItem>To fulfill and manage your orders</ListItem>
          <ListItem>To secure your designs and data</ListItem>
          <ListItem>To provide support and improve our Services</ListItem>
          <ListItem>To send you updates and promotional content (if opted-in)</ListItem>
        </View>

        <SectionTitle>3. Sharing Your Information</SectionTitle>
        <P>We do <Text className="font-bold">not</Text> sell or rent your personal data. We may share limited information with third-party service providers (e.g., shipping, payments) strictly as needed to operate our Services. We comply with legal obligations when required.</P>

        <SectionTitle>4. User-Generated Content</SectionTitle>
        <P>You retain full ownership of any designs, files, or content you upload or create. We store these securely to enable editing and reordering, but never share or repurpose your designs without your permission.</P>

        <SectionTitle>5. Cookies & Tracking</SectionTitle>
        <P>We use cookies and tracking technologies to remember your preferences, analyze usage, and improve your experience. You may disable cookies in your browser settings at any time.</P>

        <SectionTitle>6. Data Retention</SectionTitle>
        <P>We retain personal data as long as needed to provide our services and comply with legal obligations. You may request deletion of your data at any time.</P>

        <SectionTitle>7. Your Rights</SectionTitle>
        <P>
          You may request access, correction, deletion, or restriction of your personal data by contacting us at{' '}
          <TouchableOpacity onPress={handleEmailPress}>
            <Text className="text-blue-600 underline">support@yourdomain.com</Text>
          </TouchableOpacity>.
        </P>

        <SectionTitle>8. Data Security</SectionTitle>
        <P>We implement industry-standard measures to safeguard your data. However, no system is completely secure. You use our Services at your own risk.</P>

        <SectionTitle>9. Children’s Privacy</SectionTitle>
        <P>Our Services are not intended for users under the age of 13. We do not knowingly collect data from children.</P>

        <SectionTitle>10. Changes to This Policy</SectionTitle>
        <P>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.</P>

        <SectionTitle>11. Contact Us</SectionTitle>
        <P>If you have questions or concerns about this Privacy Policy, please contact us.</P>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
