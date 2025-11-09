import onboarding from '@/assets/images/onboarding.png';
import LinearButton from '@/components/linear-button';
import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';

export default function Index() {
  return (
    <View className='flex-1 items-center justify-center bg-gray-950 text-white-100'>
      <View className='app-container'>
        <View className='w-full'>
          <Image
            source={onboarding}
            alt='Onboarding Image'
            resizeMode='contain'
            className='w-full'
          />
        </View>
        <Text className='text-white-100 font-josefinSans-bold text-4xl mb-3 text-center'>
          Welcome to Framez
        </Text>
        <Text className='text-gray-400 text-center font-josefinSans-medium text-xl'>
          Where you get to connect with your friends, post, share, and connect
        </Text>

        <LinearButton
          onPress={() => router.navigate('/register')}
          text='Get Started'
        />
      </View>
    </View>
  );
}
