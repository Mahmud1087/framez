import { useClerk } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export const SignOutButton = () => {
  const [loading, setLoading] = useState(false);
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      Linking.openURL(Linking.createURL('/login'));
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className='bg-red-500 rounded-xl py-2 px-4 w-32'
    >
      {loading ? (
        <AntDesign
          name='loading'
          size={24}
          color='black'
          className='animate-spin'
        />
      ) : (
        <Text className='text-white-100 font-josefinSans-medium text-lg w-full text-center'>
          Logout
        </Text>
      )}
    </TouchableOpacity>
  );
};
