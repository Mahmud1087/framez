import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import '../globals.css';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={'/feed'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='register' />
      <Stack.Screen name='login' />
    </Stack>
  );
}
