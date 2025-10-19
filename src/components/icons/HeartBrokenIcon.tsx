import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

const HeartBrokenIcon = ({ size, color, secondaryColor }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M12 5.5C7.5 0.826004 2 4.275 2 9.138C2 14.001 6.02 16.592 8.962 18.912C10 19.729 11 20.5 12 20.5M12 5.5C16.5 0.826004 22 4.275 22 9.138C22 14.001 17.98 16.592 15.038 18.912C14 19.729 13 20.5 12 20.5M12 5.5L10.5 8.5L14 11L11 14.5L13 16.5L12 20.5'
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};

export default HeartBrokenIcon;
