import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Feed = () => {
  return (
    <View className='bg-gray-900 w-full h-full'>
      <SafeAreaView className='app-container'>
        <Text className='text-white-100'>Feed</Text>
      </SafeAreaView>
    </View>
  );
};
export default Feed;
