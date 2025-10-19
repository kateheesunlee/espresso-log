import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

const WaterIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M4 15.5429C4 12.1322 6.46566 9.74767 7.53571 8.6559C7.75 8.43727 8.24286 8 8.5 8C8.75714 8 9.25 8.43727 9.46429 8.6559C10.6634 9.87939 13 12.6569 13 15.5429C13 19.1503 9.78571 20 8.5 20C7.21429 20 4 18.9535 4 15.5429Z'
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d='M14 9.02857C14 6.75478 15.6438 5.16511 16.3571 4.43727C16.5 4.29151 16.8286 4 17 4C17.1714 4 17.5 4.29151 17.6429 4.43727C18.4423 5.25293 20 7.1046 20 9.02857C20 11.4335 17.8571 12 17 12C16.1429 12 14 11.3024 14 9.02857Z'
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
};

export default WaterIcon;
