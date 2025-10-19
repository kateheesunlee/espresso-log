import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

const TimerIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z'
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d='M14 2H10M12 2V6M17.5 8L19 6.5M12 11V14H9'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};

export default TimerIcon;
