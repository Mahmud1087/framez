import AppHeader from '@/components/app_header';
import PostFeed from '@/components/posts/post_feed';
// import { api } from '@/convex/_generated/api';
// import { useMutation, useQuery } from 'convex/react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Feed = () => {
  // const feed = useQuery(api.posts.create_post.getFeed, { limit: 10 });
  // const likePost = useMutation(api.posts.create_post.toggleLike);

  return (
    <View className='bg-gray-900 w-full h-full'>
      <SafeAreaView>
        <AppHeader />
        <View className='w-full h-full'>
          <PostFeed limit={10} />
        </View>
      </SafeAreaView>
    </View>
  );
};
export default Feed;
