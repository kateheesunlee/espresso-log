import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

const HeartBroken2FilledIcon = ({ size, color, secondaryColor }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M1.5 10.5C0.578584 5.81942 6.5 1.99999 10 5.49999L8.5 9L11 11L10 14.5L12.6177 16.3976L12.2001 20.4761C11.3072 20.5829 10.3227 19.9242 9.29883 19.2239C6.39635 17.2346 2.07774 15.3286 1.5 10.5Z'
        fill={secondaryColor}
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M22.5635 10.8987C23.7498 5.96602 17.4151 1.98846 14.4108 5.80011L13 8.50001L15.4336 10.9219L12.9841 13.4978L14.3783 15.9922L11.9852 20.498C12.8497 20.6154 13.8173 20.2118 14.8246 19.5241C17.6803 17.5707 21.9089 15.7174 22.5635 10.8987Z'
        fill={secondaryColor}
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};

export default HeartBroken2FilledIcon;
