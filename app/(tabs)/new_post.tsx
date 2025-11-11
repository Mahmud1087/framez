import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const NewPost = () => {
  return (
    <SafeAreaView className='h-full w-full bg-gray-900'>
      <View className='app-container'>
        <Text className='text-white-100'>NewPost</Text>
      </View>
    </SafeAreaView>
  );
};
export default NewPost;
