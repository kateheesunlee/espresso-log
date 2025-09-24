import Svg, { Path } from "react-native-svg";
import { IconProps } from "./types";

const CloseIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 7L17 17M7 17L17 7"
        stroke={color}
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default CloseIcon;
