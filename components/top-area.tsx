import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const TopArea = () => {
  return (
    <TouchableOpacity
      className='app-container pt-8'
      onPress={() => router.back()}
    >
      <Feather name='arrow-left' size={24} color='white' />
    </TouchableOpacity>
  );
};
export default TopArea;
