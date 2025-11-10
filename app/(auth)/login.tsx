import LinearButton from '@/components/linear-button';
import { validateEmail, validatePassword } from '@/utils/validations';
import { useSignIn } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLoaded, signIn, setActive } = useSignIn();

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case 'email':
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case 'password':
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password),
        }));
    }
  };

  const handleClerkError = (err: any) => {
    // Check if it's a Clerk API error with errors array
    if (err.errors && Array.isArray(err.errors)) {
      const clerkErrors = err.errors as ClerkAPIError[];

      // Get the first error message
      const firstError = clerkErrors[0];
      const errorMessage = firstError.longMessage || firstError.message;

      // Show alert with the error
      Alert.alert('Login Error', errorMessage, [
        { text: 'OK', style: 'default' },
      ]);
    }
    // Handle other error formats
    else if (err.message) {
      Alert.alert('Login Error', err.message, [
        { text: 'OK', style: 'default' },
      ]);
    }
    // Fallback for unknown error formats
    else {
      Alert.alert(
        'Login Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleSubmit = async () => {
    setTouched({
      email: true,
      password: true,
    });

    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (!hasErrors) {
      if (!isLoaded) {
        Alert.alert('Error', 'Authentication error. Please try again.', [
          { text: 'OK', style: 'default' },
        ]);
        return;
      }

      setLoading(true);
      try {
        const res = await signIn.create({
          identifier: email,
          password,
        });

        if (res.status === 'complete') {
          await setActive({ session: res.createdSessionId });

          // Navigate to main app
          router.replace('/feed');
        } else {
          // Handle other statuses
          Alert.alert(
            'Login Incomplete',
            'Please complete the login process.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } catch (err: any) {
        handleClerkError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className='bg-gray-900'>
      <SafeAreaView>
        <View className='app-container w-full h-full pt-20'>
          <Text className='text-white-100 font-josefinSans-bold text-4xl text-center'>
            Login to your account
          </Text>
          <View className='mt-12 flex flex-col gap-6'>
            <View className=''>
              <Text className='form-label'>Email</Text>
              <TextInput
                placeholder='Enter your email'
                className={`form-input ${
                  errors.email && touched.email ? 'border-red-500' : ''
                }`}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => handleBlur('email')}
                keyboardType='email-address'
                autoCapitalize='none'
              />
              {errors.email && touched.email && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.email}
                </Text>
              )}
            </View>

            <View className=''>
              <Text className='form-label'>Password</Text>
              <TextInput
                placeholder='Enter password'
                className={`form-input ${
                  errors.password && touched.password ? 'border-red-500' : ''
                }`}
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                secureTextEntry
              />
              {errors.password && touched.password && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.password}
                </Text>
              )}
            </View>
          </View>

          <LinearButton text='Login' onPress={handleSubmit} loading={loading} />

          <Text className='text-white-100 text-center mt-8 font-josefinSans text-xl'>
            Don&apos;t have an account?{' '}
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
