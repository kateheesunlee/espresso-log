import Svg, { Path } from 'react-native-svg';

import { IconProps } from './types';

const ImageIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 25' fill='none'>
      <Path
        d='M14 3.5H10C6.229 3.5 4.343 3.5 3.172 4.672C2.001 5.844 2 7.729 2 11.5V13.5C2 17.271 2 19.157 3.172 20.328C4.344 21.499 6.229 21.5 10 21.5H14C17.771 21.5 19.657 21.5 20.828 20.328C21.999 19.156 22 17.271 22 13.5V11.5C22 7.729 22 5.843 20.828 4.672C19.656 3.501 17.771 3.5 14 3.5Z'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M8.5 10.5C9.32843 10.5 10 9.82843 10 9C10 8.17157 9.32843 7.5 8.5 7.5C7.67157 7.5 7 8.17157 7 9C7 9.82843 7.67157 10.5 8.5 10.5Z'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M21.5 17.5L16.348 11.88C16.2413 11.7635 16.1121 11.6699 15.9683 11.6047C15.8244 11.5395 15.6688 11.5041 15.5109 11.5006C15.353 11.4972 15.196 11.5257 15.0494 11.5846C14.9028 11.6434 14.7697 11.7313 14.658 11.843L10 16.5L7.84 14.34C7.72828 14.2284 7.59496 14.1408 7.44818 14.0825C7.30141 14.0242 7.14429 13.9965 6.98644 14.0011C6.82859 14.0057 6.67334 14.0425 6.5302 14.1092C6.38706 14.1759 6.25904 14.2711 6.154 14.389L2.5 18.5'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};

export default ImageIcon;
