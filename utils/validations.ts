import { ClerkAPIError } from '@clerk/types';
import { Alert } from 'react-native';

export const validateFirstName = (value: string) => {
  if (!value.trim()) {
    return 'First name is required';
  }
  if (value.trim().length < 2) {
    return 'First name must be at least 2 characters';
  }
  return '';
};

export const validateLastName = (value: string) => {
  if (!value.trim()) {
    return 'Last name is required';
  }
  if (value.trim().length < 2) {
    return 'Last name must be at least 2 characters';
  }
  return '';
};

export const validateEmail = (value: string) => {
  if (!value.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (value: string) => {
  if (!value) {
    return 'Password is required';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/(?=.*[a-z])/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(value)) {
    return 'Password must contain at least one number';
  }
  return '';
};

export const validateConfirmPassword = (value: string, password: string) => {
  if (!value) {
    return 'Please confirm your password';
  }
  if (value !== password) {
    return 'Passwords do not match';
  }
  return '';
};

export const handleClerkError = (err: any) => {
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
