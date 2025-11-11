import { Dimensions, View } from 'react-native';

export default function PostSkeleton() {
  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  return (
    <View className='bg-white mb-6'>
      <View className='flex-row items-center p-3 border-b border-gray-200'>
        <View className='w-10 h-10 bg-gray-300 rounded-full mr-3' />
        <View className='flex-1'>
          <View className='h-4 bg-gray-300 rounded w-24' />
        </View>
      </View>

      <View className='bg-gray-300' style={{ height: SCREEN_WIDTH }} />

      <View className='p-3 space-y-3'>
        <View className='h-4 bg-gray-300 rounded w-20' />
        <View className='h-4 bg-gray-300 rounded w-full' />
        <View className='h-4 bg-gray-300 rounded w-3/4' />
      </View>
    </View>
  );
}
