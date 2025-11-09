import onboarding from '@/assets/images/onboarding.png';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

        <TouchableOpacity className='mt-10 w-full bg-gradient-to-r'>
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className='text-white-100 font-josefinSans-medium text-2xl'>
              Get Started
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
