import LinearButton from '@/components/linear-button';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MediaItem {
  type: 'image' | 'video';
  uri: string;
  url?: string;
}

const NewPost = () => {
  const { user } = useUser();
  const createPost = useMutation(api.posts.create_post.createPost);

  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [postType, setPostType] = useState<'media' | 'text'>('media');

  const [errors, setErrors] = useState({
    caption: '',
    media: '',
  });

  const [touched, setTouched] = useState({
    caption: false,
    media: false,
  });

  const validateCaption = (value: string) => {
    if (!value.trim()) {
      return 'Caption is required';
    }
    if (value.length > 2200) {
      return 'Caption must be 2200 characters or less';
    }
    return '';
  };

  const validateMedia = (mediaArray: MediaItem[]) => {
    if (postType === 'media' && mediaArray.length === 0) {
      return 'At least one image or video is required';
    }
    if (mediaArray.length > 10) {
      return 'Maximum 10 media items allowed';
    }
    return '';
  };

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    if (touched.caption) {
      setErrors((prev) => ({ ...prev, caption: validateCaption(value) }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case 'caption':
        setErrors((prev) => ({ ...prev, caption: validateCaption(caption) }));
        break;
      case 'media':
        setErrors((prev) => ({ ...prev, media: validateMedia(media) }));
        break;
    }
  };

  const handlePostTypeChange = (type: 'media' | 'text') => {
    setPostType(type);
    // Clear media if switching to text-only
    if (type === 'text') {
      setMedia([]);
      setErrors((prev) => ({ ...prev, media: '' }));
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload media.',
        [{ text: 'OK', style: 'default' }]
      );
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    if (media.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 media items.', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - media.length,
      });

      if (!result.canceled && result.assets) {
        const newMedia: MediaItem[] = result.assets.map((asset) => ({
          type: asset.type === 'video' ? 'video' : 'image',
          uri: asset.uri,
        }));

        setMedia((prev) => [...prev, ...newMedia]);
        setTouched((prev) => ({ ...prev, media: true }));
        setErrors((prev) => ({
          ...prev,
          media: validateMedia([...media, ...newMedia]),
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
      console.error('Media picker error:', error);
    }
  };

  const removeMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    setMedia(updatedMedia);
    if (touched.media) {
      setErrors((prev) => ({ ...prev, media: validateMedia(updatedMedia) }));
    }
  };

  const uploadMediaToStorage = async (
    mediaItem: MediaItem
  ): Promise<string> => {
    // TODO: Implement actual file upload to your storage service
    // This is a placeholder that simulates upload
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mediaItem.uri; // Replace with actual uploaded URL
  };

  const handleSubmit = async () => {
    setTouched({
      caption: true,
      media: true,
    });

    const newErrors = {
      caption: validateCaption(caption),
      media: validateMedia(media),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (!hasErrors) {
      if (!user) {
        Alert.alert(
          'Authentication Required',
          'You must be logged in to create a post.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      setLoading(true);
      setUploadingMedia(postType === 'media' && media.length > 0);

      try {
        let uploadedMedia: { type: string; url: string }[] = [];

        // Upload media only if not text-only post
        if (postType === 'media' && media.length > 0) {
          uploadedMedia = await Promise.all(
            media.map(async (item) => {
              const url = await uploadMediaToStorage(item);
              return {
                type: item.type,
                url,
              };
            })
          );
        }

        setUploadingMedia(false);

        // Create the post
        await createPost({
          userId: user.id,
          fullName:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            'Anonymous',
          userAvatar:
            user.imageUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          caption: caption.trim(),
          media: uploadedMedia,
        });

        Alert.alert('Success', 'Your post has been created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setCaption('');
              setMedia([]);
              setPostType('media');
              setTouched({ caption: false, media: false });
              setErrors({ caption: '', media: '' });

              // Navigate to feed
              router.replace('/feed');
            },
            style: 'default',
          },
        ]);
      } catch (error: any) {
        console.error('Create post error:', error);

        Alert.alert(
          'Error',
          error.message || 'Failed to create post. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } finally {
        setLoading(false);
        setUploadingMedia(false);
      }
    }
  };

  return (
    <View className='bg-gray-900 flex-1'>
      <SafeAreaView className='flex-1'>
        <ScrollView
          className='flex-1'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View className='app-container pt-6 pb-8'>
            <Text className='text-white-100 font-josefinSans-bold text-4xl text-center mb-8'>
              Create New Post
            </Text>

            {/* Post Type Toggle */}
            <View className='mb-6'>
              <Text className='form-label mb-2'>Post Type</Text>
              <View className='flex-row bg-gray-800 rounded-xl p-1'>
                <TouchableOpacity
                  onPress={() => handlePostTypeChange('media')}
                  className={`flex-1 py-3 rounded-lg ${
                    postType === 'media' ? 'bg-blue-500' : 'bg-transparent'
                  }`}
                >
                  <View className='flex-row items-center justify-center gap-2'>
                    <Ionicons
                      name='image'
                      size={20}
                      color={postType === 'media' ? 'white' : '#9CA3AF'}
                    />
                    <Text
                      className={`font-semibold ${
                        postType === 'media' ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      Media
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePostTypeChange('text')}
                  className={`flex-1 py-3 rounded-lg ${
                    postType === 'text' ? 'bg-blue-500' : 'bg-transparent'
                  }`}
                >
                  <View className='flex-row items-center justify-center gap-2'>
                    <Ionicons
                      name='text'
                      size={20}
                      color={postType === 'text' ? 'white' : '#9CA3AF'}
                    />
                    <Text
                      className={`font-semibold ${
                        postType === 'text' ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      Text Only
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Media Preview - Only show for media posts */}
            {postType === 'media' && (
              <View className='mb-6'>
                <Text className='form-label'>Media</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className='mb-3'
                >
                  {media.map((item, index) => (
                    <View key={index} className='mr-3 relative'>
                      <Image
                        source={{ uri: item.uri }}
                        className='w-32 h-32 rounded-lg'
                        resizeMode='cover'
                      />
                      <TouchableOpacity
                        onPress={() => removeMedia(index)}
                        className='absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center'
                      >
                        <Ionicons name='close' size={16} color='white' />
                      </TouchableOpacity>
                      {item.type === 'video' && (
                        <View className='absolute bottom-1 left-1 bg-black/60 rounded px-2 py-0.5'>
                          <Text className='text-white text-xs'>Video</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {media.length < 10 && (
                    <TouchableOpacity
                      onPress={pickMedia}
                      className='w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg items-center justify-center bg-gray-800'
                    >
                      <Ionicons name='add' size={32} color='#9CA3AF' />
                      <Text className='text-gray-400 text-xs mt-1'>
                        Add Media
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {errors.media && touched.media && (
                  <Text className='text-red-500 text-sm mt-1'>
                    {errors.media}
                  </Text>
                )}

                <Text className='text-gray-400 text-xs mt-1'>
                  {media.length}/10 media items
                </Text>
              </View>
            )}

            {/* Caption Input */}
            <View className='mb-6'>
              <Text className='form-label'>
                {postType === 'text' ? 'Your Thoughts' : 'Caption'}
              </Text>
              <TextInput
                placeholder={
                  postType === 'text'
                    ? "Share what's on your mind..."
                    : 'Write a caption...'
                }
                placeholderTextColor='#9CA3AF'
                className={`bg-gray-800 text-gray-100 shadow rounded-xl py-4 px-3 font-josefinSans ${
                  postType === 'text' ? 'min-h-[200px]' : 'min-h-[120px]'
                } ${errors.caption && touched.caption ? 'border-red-500' : ''}`}
                value={caption}
                onChangeText={handleCaptionChange}
                onBlur={() => handleBlur('caption')}
                multiline
                textAlignVertical='top'
                maxLength={2200}
              />
              {errors.caption && touched.caption && (
                <Text className='text-red-500 text-sm mt-1'>
                  {errors.caption}
                </Text>
              )}
              <Text className='text-gray-400 text-xs mt-1'>
                {caption.length}/2200 characters
              </Text>
            </View>

            {/* Upload Status */}
            {uploadingMedia && (
              <View className='flex-row items-center justify-center mb-4 bg-blue-500/20 p-3 rounded-lg'>
                <ActivityIndicator size='small' color='#3B82F6' />
                <Text className='text-blue-400 ml-2'>Uploading media...</Text>
              </View>
            )}

            {/* Submit Button */}
            <LinearButton
              text='Create Post'
              onPress={handleSubmit}
              loading={loading}
            />

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => {
                if (caption || media.length > 0) {
                  Alert.alert(
                    'Discard Post',
                    'Are you sure you want to discard this post?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => router.back(),
                      },
                    ]
                  );
                } else {
                  router.back();
                }
              }}
              className='mt-4'
            >
              <Text className='text-gray-400 text-center text-base'>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default NewPost;
