import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Profile = () => {
  return (
    <SafeAreaView className='bg-gray-900'>
      <View className='app-container w-full h-full'>
        <Text className='text-white-100'>Profile</Text>
      </View>
    </SafeAreaView>
  );
};
export default Profile;
