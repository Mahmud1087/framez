import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
const AppHeader = () => {
  const { user } = useUser();

  return (
    <View className='py-4 border-b border-b-gray-700'>
      <View className='flex items-center justify-between flex-row app-container'>
        <Text className='text-2xl font-josefinSans-semibold text-white-100'>
          Framez
        </Text>
        <Pressable onPress={() => router.navigate('/my_posts')}>
          <Image
            source={{ uri: user?.imageUrl }}
            style={{ width: 32, height: 32 }}
            className='rounded-full border-4 border-gray-700'
          />
        </Pressable>
      </View>
    </View>
  );
};
export default AppHeader;
