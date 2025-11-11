// import {
//   JosefinSans_300Light,
//   JosefinSans_400Regular,
//   JosefinSans_500Medium,
//   JosefinSans_600SemiBold,
//   JosefinSans_700Bold,
//   useFonts,
// } from '@expo-google-fonts/josefin-sans';
import { Tabs } from 'expo-router';
// import { useEffect } from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
// import '../../globals.css';

export default function TabsLayout() {
  // const [fontsLoaded, error] = useFonts({
  //   JosefinSans_300Light,
  //   JosefinSans_400Regular,
  //   JosefinSans_500Medium,
  //   JosefinSans_600SemiBold,
  //   JosefinSans_700Bold,
  // });

  // useEffect(() => {
  //   if (error) throw error;
  //   if (fontsLoaded) SplashScreen.hideAsync();
  // }, [fontsLoaded, error]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: '#FE8C00',
        // tabBarActiveTintColor: colorScheme === 'dark' ? 'white' : 'blue',
        // tabBarInactiveTintColor: colorScheme === 'dark' ? 'gray' : 'black',
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopColor: 'black',
          paddingTop: 10,
          paddingBottom: 23,
        },
      }}
    >
      <Tabs.Screen
        name='feed'
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='new_post'
        options={{
          title: 'New Post',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle-sharp' : 'add-circle-outline'}
              color={color}
              size={30}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name={focused ? 'user-alt' : 'user'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
