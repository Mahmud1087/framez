import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity } from 'react-native';

type Props = {
  onPress?: () => void;
  text: string;
  loading?: boolean;
};

const LinearButton = ({ onPress, text, loading }: Props) => {
  return (
    <TouchableOpacity
      className='mt-10 w-full bg-gradient-to-r'
      onPress={onPress}
    >
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={{
          width: '100%',
          height: 45,
          borderRadius: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <AntDesign
            name='loading'
            size={24}
            color='black'
            className='animate-spin'
          />
        ) : (
          <Text className='text-white-100 font-josefinSans-medium text-xl w-full text-center'>
            {text}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};
export default LinearButton;
