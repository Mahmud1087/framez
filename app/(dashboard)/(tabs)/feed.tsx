import AppHeader from '@/components/app_header';
import InfiniteFeed from '@/components/posts';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const Feed = () => {
  return (
    <View className='bg-gray-900 w-full h-full'>
      <SafeAreaView>
        <AppHeader />
        <View className='w-full h-full'>
          <InfiniteFeed />
        </View>
      </SafeAreaView>
    </View>
  );
};
export default Feed;
