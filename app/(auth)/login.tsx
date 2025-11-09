import LinearButton from '@/components/linear-button';
import Feather from '@expo/vector-icons/Feather';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    console.log({
      email,
      password,
    });
  };

  return (
    <View className='bg-gray-900'>
      <SafeAreaView>
        <TouchableOpacity
          className='app-container pt-8'
          onPress={() => router.back()}
        >
          <Feather name='arrow-left' size={24} color='white' />
        </TouchableOpacity>
        <View className='app-container  w-full h-full pt-16'>
          <Text className='text-white-100 font-josefinSans-bold text-4xl text-center'>
            Login to your account
          </Text>
          <View className='mt-12 flex flex-col gap-6'>
            <View className=''>
              <Text className='form-label'>Email</Text>
              <TextInput
                placeholder='Enter your email'
                className='form-input'
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View className=''>
              <Text className='form-label'>Password</Text>
              <TextInput
                placeholder='Enter password'
                className='form-input'
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>
          <LinearButton text='Login' onPress={handleSubmit} />

          <Text className='text-white-100 text-center mt-8 font-josefinSans text-xl'>
            {"Don't have an account? "}
            <Link href={'/register'} className='text-blue-500 underline'>
              Register
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};
export default Login;
