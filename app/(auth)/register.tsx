import LinearButton from '@/components/linear-button';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    console.log({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });
  };

  return (
    <View className='bg-gray-900'>
      <SafeAreaView>
        <View className='app-container  w-full h-full pt-32'>
          <Text className='text-white-100 font-josefinSans-bold text-4xl text-center'>
            Create an account
          </Text>
          <View className='mt-12 flex flex-col gap-6'>
            <View className=''>
              <Text className='form-label'>First Name</Text>
              <TextInput
                placeholder='Enter your first name'
                className='form-input'
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className=''>
              <Text className='form-label'>Last Name</Text>
              <TextInput
                placeholder='Enter your last name'
                className='form-input'
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
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
            <View className=''>
              <Text className='form-label'>Confirm Password</Text>
              <TextInput
                placeholder='Enter confirm password'
                className='form-input'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>
          <LinearButton text='Register' onPress={handleSubmit} />

          <Text className='text-white-100 text-center mt-8 font-josefinSans text-xl'>
            Already have an account?{' '}
            <Link href={'/login'} className='text-blue-500 underline'>
              Login
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};
export default Register;
