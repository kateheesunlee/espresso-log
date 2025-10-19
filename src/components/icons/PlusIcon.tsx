import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

const PlusIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M12 5V19M5 12H19'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};

export default PlusIcon;
