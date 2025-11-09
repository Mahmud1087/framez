import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity } from 'react-native';

type Props = {
  onPress?: () => void;
  text: string;
};

const LinearButton = ({ onPress, text }: Props) => {
  return (
    <TouchableOpacity
      className='mt-10 w-full bg-gradient-to-r'
      onPress={onPress}
    >
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={{
          width: '100%',
          height: 50,
          borderRadius: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className='text-white-100 font-josefinSans-medium text-2xl w-full text-center'>
          {text}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
export default LinearButton;
