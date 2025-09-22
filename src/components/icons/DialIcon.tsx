import Svg, { Circle, Path } from "react-native-svg";
import { IconProps } from "./types";

const DialIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12.25" cy="13.5" r="5.5" stroke={color} strokeWidth={2} />
      <Path
        d="M12.25 13.5L8.75 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="5.5" cy="20.25" r="1.25" fill={color} />
      <Circle cx="19" cy="20.25" r="1.25" fill={color} />
      <Circle cx="3" cy="13.25" r="1.25" fill={color} />
      <Circle cx="21.5" cy="13.25" r="1.25" fill={color} />
      <Circle cx="5.5" cy="7.25" r="1.25" fill={color} />
      <Circle cx="19" cy="7.25" r="1.25" fill={color} />
      <Circle cx="12.5" cy="4.25" r="1.25" fill={color} />
    </Svg>
  );
};

export default DialIcon;
