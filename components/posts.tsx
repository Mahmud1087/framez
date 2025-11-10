/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  avatar: string;
}

interface Post {
  id: string;
  username: string;
  userAvatar: string;
  media: { type: 'image' | 'video'; url: string }[];
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Skeleton Loader Component
const PostSkeleton = () => (
  <View className='bg-white my-6'>
    {/* Header Skeleton */}
    <View className='flex-row items-center p-3 border-b border-gray-200'>
      <View className='w-10 h-10 bg-gray-300 rounded-full mr-3' />
      <View className='flex-1'>
        <View className='h-4 bg-gray-300 rounded w-24' />
      </View>
    </View>
    {/* Image Skeleton */}
    <View className='bg-gray-300' style={{ height: SCREEN_WIDTH }} />
    {/* Content Skeleton */}
    <View className='p-3 space-y-2 flex flex-col gap-3'>
      <View className='h-4 bg-gray-300 rounded w-20' />
      <View className='h-4 bg-gray-300 rounded w-full' />
      <View className='h-4 bg-gray-300 rounded w-3/4' />
    </View>
  </View>
);

// Instagram Post Component
const InstagramPost = ({
  post: initialPost,
  onLike,
}: {
  post: Post;
  onLike: (id: string) => void;
}) => {
  const [post, setPost] = useState<Post>(initialPost);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const lastTap = useRef<number>(0);
  const likeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      if (!liked) {
        handleLike();
      }
      triggerLikeAnimation();
    }

    lastTap.current = now;
  };

  const triggerLikeAnimation = () => {
    setShowLikeAnimation(true);
    likeAnimation.setValue(0);

    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowLikeAnimation(false));
  };

  const handleLike = () => {
    setLiked(!liked);
    setPost((prev) => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1,
    }));
    onLike(post.id);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        username: 'current_user',
        text: commentText,
        timestamp: 'now',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      };
      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));
      setCommentText('');
    }
  };

  //   const handleScroll = (event: any) => {
  //     const slideIndex = Math.round(
  //       event.nativeEvent.contentOffset.x / SCREEN_WIDTH
  //     );
  //     setCurrentSlide(slideIndex);
  //   };

  const likeScale = likeAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.8],
  });

  return (
    <View className='bg-gray-300 mb-4'>
      {/* Header */}
      <View className='flex-row items-center justify-between p-3 border-b border-gray-900'>
        <View className='flex-row items-center flex-1'>
          <Image
            source={{ uri: post.userAvatar }}
            className='w-10 h-10 rounded-full mr-3'
          />
          <Text className='font-semibold text-sm'>{post.username}</Text>
        </View>
      </View>

      {/* Media Carousel */}
      <Pressable onPress={handleDoubleTap} className='relative'>
        <Carousel
          width={SCREEN_WIDTH}
          height={SCREEN_WIDTH}
          data={post.media}
          enabled={post.media.length > 1} // ✅ only scroll if more than one image
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.url }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode='cover'
            />
          )}
          onSnapToItem={(index) => setCurrentSlide(index)}
          //   simultaneousHandlers={post.media.length > 1 ? scrollRef : undefined}
        />

        {/* Double Tap Like Animation */}
        {showLikeAnimation && (
          <Animated.View
            className='absolute inset-0 items-center justify-center'
            style={{
              transform: [{ scale: likeScale }],
              opacity: likeAnimation,
            }}
          >
            <Ionicons name='heart' size={100} color='white' />
          </Animated.View>
        )}

        {/* Indicators */}
        {post.media.length > 1 && (
          <View className='absolute bottom-3 left-0 right-0 flex-row justify-center gap-1'>
            {post.media.map((_, idx) => (
              <View
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${
                  idx === currentSlide ? 'bg-blue-500' : 'bg-white/60'
                }`}
              />
            ))}
          </View>
        )}
      </Pressable>

      {/* Action Buttons */}
      <View className='flex-row items-center justify-between p-3'>
        <View className='flex-row gap-4'>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? '#ef4444' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name='chatbubble-outline' size={26} color='#000' />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name='paper-plane-outline' size={26} color='#000' />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setBookmarked(!bookmarked)}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color='#000'
          />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      <View className='px-3 pb-2'>
        <Text className='font-semibold text-sm'>
          {post.likes.toLocaleString()} likes
        </Text>
      </View>

      {/* Caption */}
      <View className='px-3 pb-2'>
        <Text className='text-sm'>
          <Text className='font-semibold'>{post.username}</Text> {post.caption}
        </Text>
        <Text className='text-gray-500 text-xs mt-1'>{post.timestamp} ago</Text>
      </View>

      {/* Comments Preview */}
      <TouchableOpacity
        className='px-3 pb-3'
        onPress={() => setShowComments(true)}
      >
        <Text className='text-gray-500 text-sm'>
          View all {post.comments.length} comments
        </Text>
      </TouchableOpacity>

      {/* Comments Modal (Bottom Sheet) */}
      <Modal
        visible={showComments}
        animationType='slide'
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <Pressable
          className='flex-1 bg-black/50'
          onPress={() => setShowComments(false)}
        >
          <Pressable
            className='absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80%]'
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className='items-center justify-center p-4 border-b border-gray-200'>
              <View className='w-12 h-1 bg-gray-300 rounded-full absolute top-2' />
              <Text className='font-semibold text-base'>Comments</Text>
              <TouchableOpacity
                className='absolute right-4'
                onPress={() => setShowComments(false)}
              >
                <Ionicons name='close' size={24} color='#000' />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView ref={scrollViewRef} className='flex-1 p-4'>
              {post.comments.map((comment) => (
                <View key={comment.id} className='flex-row gap-3 mb-4'>
                  <Image
                    source={{ uri: comment.avatar }}
                    className='w-8 h-8 rounded-full'
                  />
                  <View className='flex-1'>
                    <Text className='text-sm'>
                      <Text className='font-semibold'>{comment.username}</Text>{' '}
                      {comment.text}
                    </Text>
                    <View className='flex-row gap-3 mt-1'>
                      <Text className='text-xs text-gray-500'>
                        {comment.timestamp}
                      </Text>
                      <TouchableOpacity>
                        <Text className='text-xs font-semibold text-gray-500'>
                          Reply
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name='heart-outline' size={14} color='#999' />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Add Comment Input */}
            <View className='flex-row items-center gap-2 p-4 border-t border-gray-200'>
              <Image
                source={{
                  uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
                }}
                className='w-8 h-8 rounded-full'
              />
              <TextInput
                className='flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm'
                placeholder='Add a comment...'
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Text
                  className={`font-semibold text-sm ${
                    commentText.trim() ? 'text-blue-500' : 'text-blue-300'
                  }`}
                >
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// Infinite Feed Component
const InfiniteFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const generatePosts = (startId: number, count: number): Post[] => {
    const images = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600',
    ];

    const usernames = [
      'nature_lover',
      'adventure_seeker',
      'photo_enthusiast',
      'wanderlust',
      'explorer_life',
    ];
    const captions = [
      'Beautiful mountain views from my weekend hike! 🏔️ #hiking #mountains',
      'Sunset vibes at the beach 🌅 #sunset #ocean',
      'Forest trails and fresh air 🌲 #nature #forest',
      'Peak season adventures! #travel #explore',
      'Nature photography at its finest 📸 #photography',
    ];

    return Array.from({ length: count }, (_, i) => {
      const id = startId + i;
      const mediaCount = Math.floor(Math.random() * 3) + 1;
      return {
        id: id.toString(),
        username: usernames[id % usernames.length],
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        media: Array.from({ length: mediaCount }, (_, j) => ({
          type: 'image' as const,
          url: images[(id + j) % images.length],
        })),
        caption: captions[id % captions.length],
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: [
          {
            id: '1',
            username: 'user_' + id * 2,
            text: 'Amazing! 😍',
            timestamp: '2h',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id * 2}`,
          },
          {
            id: '2',
            username: 'user_' + id * 3,
            text: 'Love this shot!',
            timestamp: '1h',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id * 3}`,
          },
        ],
        timestamp: `${id}h`,
      };
    });
  };

  const loadMorePosts = () => {
    if (!loading) setLoading(true);

    setTimeout(() => {
      const newPosts = generatePosts((page - 1) * 5, 5);
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadMorePosts();
  }, []);

  const handleLike = (postId: string) => {
    console.log('Liked post:', postId);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <InstagramPost post={item} onLike={handleLike} />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color='#3b82f6' />
      </View>
    );
  };

  return (
    <View className='flex-1 bg-gray-900'>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? renderFooter : null}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 16,
        }}
        ListEmptyComponent={
          loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default InfiniteFeed;
