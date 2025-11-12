import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // ✅ Show loader until Clerk finishes checking authentication state
  if (!isLoaded) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-950'>
        <Text className='text-2xl font-josefinSans-bold text-center text-white-100 mb-4'>
          Framez
        </Text>
        <ActivityIndicator size='large' color='#3b82f6' />
      </View>
    );
  }

  // ✅ Once Clerk is ready, redirect accordingly
  if (isSignedIn) {
    return <Redirect href='/feed' />;
  }

  return <Redirect href='/login' />;
}
