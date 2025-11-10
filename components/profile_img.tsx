import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ProfileImageUploadProps {
  size?: number;
  showEditButton?: boolean;
  onUploadComplete?: (imageUrl: string) => void;
}

const ProfileImageUpload = ({
  size = 120,
  showEditButton = true,
  onUploadComplete,
}: ProfileImageUploadProps) => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload a profile picture.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take a photo.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert('Update Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: takePhoto,
      },
      {
        text: 'Choose from Library',
        onPress: pickImage,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const uploadImage = async (uri: string) => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    setUploading(true);

    try {
      // Get file info
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `profile-${Date.now()}.${fileExtension}`;
      const mimeType = `image/${
        fileExtension === 'jpg' ? 'jpeg' : fileExtension
      }`;

      // Create a file-like object that React Native can work with
      const file = {
        uri,
        type: mimeType,
        name: fileName,
      };

      // Upload to Clerk
      await user.setProfileImage({ file: file as any });

      // Reload user data to get updated image URL
      await user.reload();

      Alert.alert('Success', 'Profile picture updated successfully!');

      if (onUploadComplete && user.imageUrl) {
        onUploadComplete(user.imageUrl);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!user) return;

    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            try {
              await user.setProfileImage({ file: null });
              await user.reload();
              Alert.alert('Success', 'Profile picture removed successfully!');
            } catch (error) {
              console.error('Error removing image:', error);
              Alert.alert('Error', 'Failed to remove image. Please try again.');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!user) return '??';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';
  };

  return (
    <View className='items-center'>
      <View style={{ width: size, height: size }} className='relative'>
        {/* Profile Image or Placeholder */}
        <TouchableOpacity
          onPress={showEditButton ? showImageOptions : undefined}
          disabled={uploading}
          className='relative'
          style={{ width: size, height: size }}
        >
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: size, height: size }}
              className='rounded-full border-4 border-gray-700'
            />
          ) : (
            <View
              style={{ width: size, height: size }}
              className='rounded-full border-4 border-gray-700 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center'
            >
              <Text
                className='text-white font-bold'
                style={{ fontSize: size * 0.35 }}
              >
                {getInitials()}
              </Text>
            </View>
          )}

          {/* Loading Overlay */}
          {uploading && (
            <View
              style={{ width: size, height: size }}
              className='absolute inset-0 rounded-full bg-black/60 items-center justify-center'
            >
              <ActivityIndicator size='large' color='#fff' />
            </View>
          )}
        </TouchableOpacity>

        {/* Edit Button */}
        {showEditButton && !uploading && (
          <TouchableOpacity
            onPress={showImageOptions}
            className='absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 border-4 border-gray-900'
            style={{
              width: size * 0.3,
              height: size * 0.3,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name='camera' size={size * 0.15} color='white' />
          </TouchableOpacity>
        )}
      </View>

      {/* Remove Button (optional) */}
      {user?.imageUrl && user.hasImage && showEditButton && !uploading && (
        <TouchableOpacity
          onPress={removeImage}
          className='mt-4 px-4 py-2 bg-red-500/20 rounded-lg border border-red-500'
        >
          <Text className='text-red-500 font-semibold'>Remove Picture</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProfileImageUpload;
