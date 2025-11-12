import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import {
  JosefinSans_300Light,
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
  JosefinSans_700Bold,
  useFonts,
} from '@expo-google-fonts/josefin-sans';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './globals.css';

const publishableKey =
  Constants.expoConfig?.extra?.clerkPublishableKey ||
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const convex = new ConvexReactClient(
  Constants.expoConfig?.extra?.convexUrl || process.env.EXPO_PUBLIC_CONVEX_URL!,
  { unsavedChangesWarning: false }
);

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    JosefinSans_300Light,
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
    JosefinSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProvider client={convex}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Slot />
        </GestureHandlerRootView>
      </ConvexProvider>
    </ClerkProvider>
  );
}
