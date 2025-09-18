import Svg, { Path } from "react-native-svg";
import { IconProps } from "./types";

const BeanFilledIcon = ({ size, color, secondaryColor }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 5C1.4 8.2 0.5 17.4793 4 19.5C6.00001 24.5 15 21 17.5 19C20 17 22 12.5 22 9C22 6.2 20.6667 4.83333 20 4.5C18.5 2 14 0.999995 7 5Z"
        fill={secondaryColor}
      />
      <Path
        d="M4.00001 19.5C5.50001 21.9151 8.04249 22.2673 10.6721 21.9151C13.3018 21.563 15.9637 20.1806 18.0721 18.0721C20.1806 15.9637 21.563 13.3018 21.9151 10.6721C22.2673 8.04248 21.9151 6 20 4.49999C19.5 2.5 15.9575 1.73268 13.3279 2.08485C10.6982 2.43702 8.03634 3.81939 5.92787 5.92786C3.8194 8.03633 2.43703 10.6982 2.08486 13.3278C1.73269 15.9575 2.08485 18.5 4.00001 19.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.8 4.2C20 14 3.99999 10 4.19999 19.8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BeanFilledIcon;
