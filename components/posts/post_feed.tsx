import { useQuery } from 'convex/react';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
// import { useUser } from '@clerk/clerk-expo';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import InstagramPost, { Post } from './post';
import PostSkeleton from './post_skeleton';

interface Props {
  userId?: string; // Optional: if provided, shows only user's posts
  limit?: number; // Number of posts to load per page
}

export default function PostFeed({ userId, limit = 10 }: Props) {
  // const { user } = useUser();
  const [cursor, setCursor] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts based on whether we're viewing a specific user or the feed
  const feedData = useQuery(
    api.posts.create_post.getFeed,
    userId ? 'skip' : { cursor: cursor || undefined, limit }
  );

  const userPosts = useQuery(
    api.posts.create_post.getUserPosts,
    userId ? { userId } : 'skip'
  );

  // Determine which data to use
  const isUserProfile = !!userId;
  const posts = isUserProfile ? userPosts : feedData?.posts;
  const nextCursor = !isUserProfile ? feedData?.nextCursor : null;

  // Initialize posts when data loads
  useEffect(() => {
    if (posts && !cursor) {
      setAllPosts(posts);
      setHasMorePosts(!isUserProfile && !!nextCursor);
    }
  }, [posts, cursor, nextCursor, isUserProfile]);

  // Load more posts for infinite scroll (feed only)
  const handleLoadMore = async () => {
    if (isUserProfile || isLoadingMore || !hasMorePosts || !nextCursor) {
      return;
    }

    setIsLoadingMore(true);

    try {
      setCursor(nextCursor);

      // Wait for the new data to load
      setTimeout(() => {
        if (feedData?.posts) {
          setAllPosts((prev) => [...prev, ...feedData.posts]);
          setHasMorePosts(!!feedData.nextCursor);
        }
        setIsLoadingMore(false);
      }, 500);
    } catch (error) {
      console.error('Load more error:', error);
      Alert.alert('Error', 'Failed to load more posts. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
      setIsLoadingMore(false);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setCursor(null);
    setAllPosts([]);

    // Wait a bit for the query to refresh
    setTimeout(() => {
      if (posts) {
        setAllPosts(posts);
        setHasMorePosts(!isUserProfile && !!nextCursor);
      }
      setRefreshing(false);
    }, 1000);
  };

  // Loading state
  const isInitialLoading = posts === undefined && allPosts.length === 0;

  // Empty state
  const renderEmptyComponent = () => {
    if (isInitialLoading) {
      return (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      );
    }

    return (
      <View className='flex-1 items-center justify-center py-20 px-6'>
        <Ionicons name='images-outline' size={64} color='#D1D5DB' />
        <Text className='text-gray-500 text-lg font-semibold mt-4 text-center'>
          {isUserProfile ? 'No Posts Yet' : 'No Posts in Feed'}
        </Text>
        <Text className='text-gray-400 text-sm mt-2 text-center'>
          {isUserProfile
            ? 'Start sharing your moments with the world!'
            : 'Follow people to see their posts here.'}
        </Text>
      </View>
    );
  };

  // Footer loading indicator
  const renderFooter = () => {
    if (!isLoadingMore || isUserProfile) return null;

    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color='#3b82f6' />
      </View>
    );
  };

  // Error state
  if (posts === null) {
    return (
      <View className='flex-1 items-center justify-center py-20 px-6'>
        <Ionicons name='alert-circle-outline' size={64} color='#EF4444' />
        <Text className='text-gray-500 text-lg font-semibold mt-4 text-center'>
          Failed to Load Posts
        </Text>
        <Text className='text-gray-400 text-sm mt-2 text-center'>
          Please check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={allPosts}
      renderItem={({ item }) => <InstagramPost post={item} />}
      keyExtractor={(item) => item._id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3b82f6']}
          tintColor='#3b82f6'
        />
      }
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 16,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true} // Performance optimization
      maxToRenderPerBatch={5} // Performance optimization
      windowSize={10} // Performance optimization
    />
  );
}
