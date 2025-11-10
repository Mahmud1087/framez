import LinearButton from '@/components/linear-button';
import { SignOutButton } from '@/components/logout_button';
import ProfileImageUpload from '@/components/profile_img';
import {
  handleClerkError,
  validateFirstName,
  validateLastName,
} from '@/utils/validations';
import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
const Profile = () => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName as string);
  const [lastName, setLastName] = useState(user?.lastName as string);
  const [editFields, setEditFields] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
  });

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (touched.firstName) {
      setErrors((prev) => ({ ...prev, firstName: validateFirstName(value) }));
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (touched.lastName) {
      setErrors((prev) => ({ ...prev, lastName: validateLastName(value) }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case 'firstName':
        setErrors((prev) => ({
          ...prev,
          firstName: validateFirstName(firstName),
        }));
        break;
      case 'lastName':
        setErrors((prev) => ({
          ...prev,
          lastName: validateLastName(lastName),
        }));
        break;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      Alert.alert('Update Successful', 'Profile has been update successfully');
      setEditFields(false);
    } catch (error) {
      handleClerkError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className='bg-gray-900'>
      <View className='app-container w-full h-full pt-16'>
        <ProfileImageUpload
          size={150}
          showEditButton={true}
          onUploadComplete={(imageUrl) => {
            console.log('New image URL:', imageUrl);
          }}
        />
        <Text className='text-white-100 text-center mt-5'>
          Joined on {new Date(Number(user?.createdAt)).toLocaleDateString()}
        </Text>
        <View className='w-full flex items-center justify-center mt-6'>
          <SignOutButton />
        </View>

        <View className='mt-12 flex flex-col gap-6'>
          <View className=''>
            <Text className='form-label'>First Name</Text>
            <TextInput
              placeholder='Enter your first name'
              // className='form-input'
              editable={editFields}
              className={`form-input ${
                errors.firstName && touched.firstName ? 'border-red-500' : ''
              }`}
              value={firstName}
              onChangeText={handleFirstNameChange}
              onBlur={() => handleBlur('firstName')}
            />
            {errors.firstName && touched.firstName && (
              <Text className='text-red-500 text-sm mt-1'>
                {errors.firstName}
              </Text>
            )}
          </View>

          <View className=''>
            <Text className='form-label'>Last Name</Text>
            <TextInput
              placeholder='Enter your last name'
              // className='form-input'
              editable={editFields}
              className={`form-input ${
                errors.lastName && touched.lastName ? 'border-red-500' : ''
              }`}
              value={lastName}
              onChangeText={handleLastNameChange}
              onBlur={() => handleBlur('lastName')}
            />
            {errors.lastName && touched.lastName && (
              <Text className='text-red-500 text-sm mt-1'>
                {errors.lastName}
              </Text>
            )}
          </View>

          <View className=''>
            <Text className='form-label'>Email</Text>
            <TextInput
              className='form-input'
              value={user?.emailAddresses[0].emailAddress}
              editable={false}
            />
          </View>
        </View>

        {editFields ? (
          <LinearButton
            text={'Submit'}
            onPress={handleSubmit}
            loading={loading}
          />
        ) : (
          <LinearButton
            text={'Edit Profile'}
            onPress={() => setEditFields(true)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
export default Profile;
