import PostFeed from '@/components/posts/post_feed';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const MyPosts = () => {
  const { user } = useUser();

  return (
    <View className='bg-gray-900 flex-1'>
      <SafeAreaView className='flex-1'>
        <View className='flex-1'>
          <TouchableOpacity className='pl-5 mt-4' onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={28} color={'white'} />
          </TouchableOpacity>
          <View className='flex flex-col items-center justify-center py-5'>
            <Image
              source={{ uri: user?.imageUrl }}
              style={{ width: 60, height: 60 }}
              className='rounded-full border-4 border-gray-700'
            />
            <Text className='text-white-100 font-josefinSans-bold text-xl text-center'>
              {user?.fullName}
            </Text>
          </View>
          <View className='pt-6 mb-6'>
            <Text className='text-white-100 font-josefinSans-bold text-4xl text-center'>
              My Posts
            </Text>
          </View>
          <PostFeed userId={user?.id} />
        </View>
      </SafeAreaView>
    </View>
  );
};
export default MyPosts;
