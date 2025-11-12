import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Comment {
  _id: Id<'comments'>;
  postId: Id<'posts'>;
  userId: string;
  fullName: string;
  avatar: string;
  text: string;
  createdAt: number;
}

export interface Post {
  _id: Id<'posts'>;
  userId: string;
  fullName: string;
  userAvatar: string;
  media: { type: string; url: string }[];
  caption: string;
  likes: number;
  createdAt: number;
  isRepost?: boolean;
  originalPost?: {
    _id: Id<'posts'>;
    userId: string;
    fullName: string;
    userAvatar: string;
  };
}

interface Props {
  post: Post;
  showDeleteOption?: boolean;
}

export default function InstagramPost({
  post,
  showDeleteOption = false,
}: Props) {
  const { user } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Convex mutations and queries
  const toggleLike = useMutation(api.posts.create_post.toggleLike);
  const addComment = useMutation(api.posts.create_post.addComment);
  const deletePost = useMutation(api.posts.create_post.deletePost);
  const repostPost = useMutation(api.posts.create_post.repostPost);
  const comments = useQuery(api.posts.create_post.getComments, {
    postId: post._id,
  });

  // Check if current user has liked the post
  const userLikes = useQuery(
    api.posts.create_post.checkUserLike,
    user ? { postId: post._id, userId: user.id } : 'skip'
  );

  const lastTap = useRef(0);
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const videoRefs = useRef<(Video | null)[]>([]);

  const liked = userLikes?.liked || false;
  const isLoadingComments = comments === undefined;

  // Check if current user owns this post
  const isOwnPost = user?.id === post.userId;
  const canDelete = showDeleteOption && isOwnPost;

  // Check if post is text-only
  const isTextOnly = !post.media || post.media.length === 0;

  // Pause all videos except the current one
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.playAsync();
        } else {
          video.pauseAsync();
          video.setPositionAsync(0);
        }
      }
    });
  }, [currentSlide]);

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

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSince = now - lastTap.current;

    if (timeSince < 300) {
      if (!liked) handleLike();
      triggerLikeAnimation();
    }

    lastTap.current = now;
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to like posts.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      await toggleLike({
        postId: post._id,
        userId: user.id,
      });
    } catch (error: any) {
      console.error('Like error:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleRepost = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to repost.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setShowShareModal(false);

    try {
      await repostPost({
        originalPostId: post._id,
        userId: user.id,
        fullName:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          'Anonymous',
        userAvatar:
          user.imageUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      });

      Alert.alert('Success', 'Post reposted successfully!', [
        { text: 'OK', style: 'default' },
      ]);
    } catch (error: any) {
      console.error('Repost error:', error);
      Alert.alert('Error', 'Failed to repost. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const handleSendMessage = async () => {
    setShowShareModal(false);

    try {
      await Share.share({
        message: `Check out this post by ${post.fullName}: ${post.caption}\n\nShared via MyApp`,
        title: `Post by ${post.fullName}`,
      });
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share post.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to comment.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      await addComment({
        postId: post._id,
        userId: user.id,
        fullName:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          'Anonymous',
        avatar:
          user.imageUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        text: commentText.trim(),
      });

      setCommentText('');
    } catch (error: any) {
      console.error('Comment error:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost({ postId: post._id });
              setShowMenu(false);
              Alert.alert('Success', 'Post deleted successfully.', [
                { text: 'OK', style: 'default' },
              ]);
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.', [
                { text: 'OK', style: 'default' },
              ]);
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const likeScale = likeAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.8],
  });

  return (
    <View className='bg-white mb-1'>
      {/* Header */}
      <View className='flex-row items-center justify-between p-3 border-b border-gray-200'>
        <View className='flex-row items-center flex-1'>
          <Image
            source={{ uri: post.userAvatar }}
            className='w-10 h-10 rounded-full mr-3'
          />
          <View className='flex-1'>
            <View className='flex-row items-center gap-2'>
              <Text className='font-semibold text-sm'>{post.fullName}</Text>
              {post.isRepost && (
                <View className='flex-row items-center'>
                  <Ionicons name='repeat' size={14} color='#6B7280' />
                  <Text className='text-xs text-gray-500 ml-1'>reposted</Text>
                </View>
              )}
            </View>
            {post.isRepost && post.originalPost && (
              <Text className='text-xs text-gray-500'>
                from {post.originalPost.fullName}
              </Text>
            )}
          </View>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name='ellipsis-horizontal' size={24} color='black' />
          </TouchableOpacity>
        )}
      </View>

      {/* Media Carousel (Images & Videos) or Text-only Content */}
      {!isTextOnly ? (
        <Pressable onPress={handleDoubleTap} className='relative'>
          <Carousel
            width={SCREEN_WIDTH}
            height={SCREEN_WIDTH}
            data={post.media}
            enabled={post.media.length > 1}
            renderItem={({ item, index }) => {
              if (item.type === 'video') {
                return (
                  <Video
                    ref={(ref) => {
                      videoRefs.current[index] = ref;
                    }}
                    source={{ uri: item.url }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay={false}
                    isLooping
                    isMuted={false}
                  />
                );
              }

              return (
                <View
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  className='bg-blue-200'
                >
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode='contain'
                  />
                </View>
              );
            }}
            onSnapToItem={setCurrentSlide}
          />

          {/* Slide Indicators */}
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
        </Pressable>
      ) : (
        // Text-only post display
        <Pressable onPress={handleDoubleTap} className='relative bg-gray-900'>
          <View className='bg-gradient-to-br from-blue-50 to-purple-50 p-8 min-h-[300px] items-center justify-center'>
            <Text className='text-white-100 text-xl text-center font-semibold leading-relaxed'>
              {post.caption}
            </Text>
          </View>

          {/* Double Tap Like Animation */}
          {showLikeAnimation && (
            <Animated.View
              className='absolute inset-0 items-center justify-center'
              style={{
                transform: [{ scale: likeScale }],
                opacity: likeAnimation,
              }}
            >
              <Ionicons name='heart' size={100} color='#EF4444' />
            </Animated.View>
          )}
        </Pressable>
      )}

      {/* Actions */}
      <View className='flex-row justify-between p-3'>
        <View className='flex-row gap-4'>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? '#ef4444' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name='chatbubble-outline' size={26} color='black' />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare}>
            <Ionicons name='paper-plane-outline' size={26} color='black' />
          </TouchableOpacity>
        </View>
      </View>

      {/* Likes */}
      <Text className='px-3 pb-1 font-semibold text-sm'>
        {post.likes.toLocaleString()} likes
      </Text>

      {/* Caption - Only show if not text-only post */}
      {!isTextOnly && (
        <View className='px-3 pb-3'>
          <Text className='text-sm'>
            <Text className='font-semibold'>{post.fullName}</Text>{' '}
            {post.caption}
          </Text>
          <Text className='text-gray-500 text-xs mt-1'>
            {formatTimestamp(post.createdAt)}
          </Text>
        </View>
      )}

      {/* Timestamp for text-only posts */}
      {isTextOnly && (
        <View className='px-3 pb-3'>
          <Text className='text-gray-500 text-xs'>
            {formatTimestamp(post.createdAt)}
          </Text>
        </View>
      )}

      {/* Comments Preview */}
      <TouchableOpacity
        className='px-3 pb-4'
        onPress={() => setShowComments(true)}
      >
        <Text className='text-gray-500 text-sm'>
          {isLoadingComments
            ? 'Loading comments...'
            : `View all ${comments?.length || 0} comments`}
        </Text>
      </TouchableOpacity>

      {/* Comments Modal */}
      <Modal visible={showComments} animationType='slide' transparent>
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
                <Ionicons name='close' size={24} color='black' />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView className='flex-1 p-4'>
              {isLoadingComments ? (
                <View className='items-center justify-center py-8'>
                  <ActivityIndicator size='large' color='#3B82F6' />
                  <Text className='text-gray-500 mt-2'>
                    Loading comments...
                  </Text>
                </View>
              ) : comments && comments.length > 0 ? (
                comments.map((c) => (
                  <View key={c._id} className='flex-row gap-3 mb-4'>
                    <Image
                      source={{ uri: c.avatar }}
                      className='w-8 h-8 rounded-full'
                    />
                    <View className='flex-1'>
                      <Text className='text-sm'>
                        <Text className='font-semibold'>{c.fullName}</Text>{' '}
                        {c.text}
                      </Text>
                      <View className='flex-row gap-3 mt-1'>
                        <Text className='text-xs text-gray-500'>
                          {formatTimestamp(c.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className='items-center justify-center py-8'>
                  <Ionicons
                    name='chatbubble-outline'
                    size={48}
                    color='#D1D5DB'
                  />
                  <Text className='text-gray-500 mt-2'>No comments yet</Text>
                  <Text className='text-gray-400 text-sm'>
                    Be the first to comment
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Add Comment Input */}
            <View className='flex-row items-center gap-2 p-4 border-t border-gray-200'>
              {user && (
                <Image
                  source={{
                    uri:
                      user.imageUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                  }}
                  className='w-8 h-8 rounded-full'
                />
              )}
              <TextInput
                className='flex-1 border border-gray-900 bg-gray-300 text-black rounded-full px-4 py-2'
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
                  className={`font-semibold ${
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

      {/* Delete Menu Modal */}
      <Modal visible={showMenu} animationType='fade' transparent>
        <Pressable
          className='flex-1 bg-black/50 justify-center items-center'
          onPress={() => setShowMenu(false)}
        >
          <Pressable
            className='bg-white rounded-2xl w-[80%] max-w-sm overflow-hidden'
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              className='p-4 border-b border-gray-200'
              onPress={handleDeletePost}
            >
              <Text className='text-red-500 font-semibold text-center text-base'>
                Delete Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='p-4'
              onPress={() => setShowMenu(false)}
            >
              <Text className='text-gray-700 text-center text-base'>
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share Modal */}
      <Modal visible={showShareModal} animationType='slide' transparent>
        <Pressable
          className='flex-1 bg-black/50'
          onPress={() => setShowShareModal(false)}
        >
          <Pressable
            className='absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl'
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className='items-center justify-center p-4 border-b border-gray-200'>
              <View className='w-12 h-1 bg-gray-300 rounded-full absolute top-2' />
              <Text className='font-semibold text-base'>Share</Text>
              <TouchableOpacity
                className='absolute right-4'
                onPress={() => setShowShareModal(false)}
              >
                <Ionicons name='close' size={24} color='black' />
              </TouchableOpacity>
            </View>

            {/* Share Options */}
            <View className='p-4'>
              <TouchableOpacity
                onPress={handleRepost}
                className='flex-row items-center p-4 border-b border-gray-200'
              >
                <View className='w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4'>
                  <Ionicons name='repeat' size={24} color='#3B82F6' />
                </View>
                <View className='flex-1'>
                  <Text className='font-semibold text-base'>Repost</Text>
                  <Text className='text-gray-500 text-sm'>
                    Share to your feed
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendMessage}
                className='flex-row items-center p-4'
              >
                <View className='w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4'>
                  <Ionicons name='paper-plane' size={24} color='#3B82F6' />
                </View>
                <View className='flex-1'>
                  <Text className='font-semibold text-base'>
                    Send via Message
                  </Text>
                  <Text className='text-gray-500 text-sm'>
                    Share with friends
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                className='mt-4 p-4 bg-gray-100 rounded-xl'
              >
                <Text className='text-gray-700 text-center font-semibold'>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
