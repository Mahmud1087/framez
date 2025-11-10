import LinearButton from '@/components/linear-button';
import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from '@/utils/validations';
import { useSignUp } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return 'Please confirm your password';
    }
    if (value !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (touched.firstName) {
      setErrors((prev) => ({ ...prev, firstName: validateFirstName(value) }));
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (touched.lastName) {
      setErrors((prev) => ({ ...prev, lastName: validateLastName(value) }));
    }
  };

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
    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== confirmPassword ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value),
      }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case 'firstName':
        setErrors((prev) => ({
          ...prev,
          firstName: validateFirstName(firstName),
        }));
        break;
      case 'lastName':
        setErrors((prev) => ({
          ...prev,
          lastName: validateLastName(lastName),
        }));
        break;
      case 'email':
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case 'password':
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password),
        }));
        break;
      case 'confirmPassword':
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(confirmPassword),
        }));
        break;
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
      Alert.alert('Registration Error', errorMessage, [
        { text: 'OK', style: 'default' },
      ]);
    }
    // Handle other error formats
    else if (err.message) {
      Alert.alert('Registration Error', err.message, [
        { text: 'OK', style: 'default' },
      ]);
    }
    // Fallback for unknown error formats
    else {
      Alert.alert(
        'Registration Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleSubmit = async () => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const newErrors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (!hasErrors) {
      if (!isLoaded) {
        Alert.alert('Error', 'Authentication is not ready. Please try again.', [
          { text: 'OK', style: 'default' },
        ]);
        return;
      }

      setLoading(true);
      try {
        const res = await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });

        if (res.status === 'complete') {
          await setActive({ session: res.createdSessionId });

          // Show success alert before navigating
          Alert.alert(
            'Success',
            'Your account has been created successfully!',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/feed'),
                style: 'default',
              },
            ]
          );
        } else if (res.status === 'missing_requirements') {
          Alert.alert(
            'Additional Information Required',
            'Please complete all required fields.',
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          // Handle other statuses
          Alert.alert(
            'Registration Incomplete',
            'Please complete the registration process.',
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
            Create an account
          </Text>
          <View className='mt-12 flex flex-col gap-6'>
            <View className=''>
              <Text className='form-label'>First Name</Text>
              <TextInput
                placeholder='Enter your first name'
                className={`form-input ${
                  errors.firstName && touched.firstName ? 'border-red-500' : ''
                }`}
                value={firstName}
                onChangeText={handleFirstNameChange}
                onBlur={() => handleBlur('firstName')}
              />
              {errors.firstName && touched.firstName && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.firstName}
                </Text>
              )}
            </View>

            <View className=''>
              <Text className='form-label'>Last Name</Text>
              <TextInput
                placeholder='Enter your last name'
                className={`form-input ${
                  errors.lastName && touched.lastName ? 'border-red-500' : ''
                }`}
                value={lastName}
                onChangeText={handleLastNameChange}
                onBlur={() => handleBlur('lastName')}
              />
              {errors.lastName && touched.lastName && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.lastName}
                </Text>
              )}
            </View>

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

            <View className=''>
              <Text className='form-label'>Confirm Password</Text>
              <TextInput
                placeholder='Enter confirm password'
                className={`form-input ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-500'
                    : ''
                }`}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => handleBlur('confirmPassword')}
                secureTextEntry
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>
          </View>

          <LinearButton
            text='Register'
            onPress={handleSubmit}
            loading={loading}
          />

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
