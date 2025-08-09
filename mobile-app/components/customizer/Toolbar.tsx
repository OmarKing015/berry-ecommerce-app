import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEditorStore } from '../../store/editorStore';

const ToolbarButton = ({ icon, onPress }: { icon: any; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className="p-3 bg-gray-200 rounded-lg">
    <FontAwesome name={icon} size={20} color="#374151" />
  </TouchableOpacity>
);

const Toolbar = () => {
  const { toggleShirtStyle, addText, addImage } = useEditorStore();

  const handleAddText = () => {
    Alert.prompt(
      'Add Text',
      'Enter the text you want to add to the T-shirt:',
      (text) => {
        if (text) {
          addText(text);
        }
      },
      'plain-text',
      'Hello World'
    );
  };

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your photos to add images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      addImage(result.assets[0].uri);
    }
  };

  return (
    <View className="bg-white p-2 border-b border-gray-200 flex-row justify-around">
      <ToolbarButton icon="retweet" onPress={toggleShirtStyle} />
      <ToolbarButton icon="font" onPress={handleAddText} />
      <ToolbarButton icon="image" onPress={pickImage} />
    </View>
  );
};

export default Toolbar;
