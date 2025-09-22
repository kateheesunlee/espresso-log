import Svg, { Path } from "react-native-svg";
import { IconProps } from "./types";

const RatioIcon = ({ size, color }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.5526 12C18.7341 12 18.9081 12.0729 19.0364 12.2028C19.1648 12.3326 19.2368 12.5087 19.2368 12.6923V18.2308C19.2368 18.9652 18.9485 19.6696 18.4352 20.1889C17.922 20.7082 17.2259 21 16.5 21H13C12.2741 21 11.578 20.7082 11.0648 20.1889C10.5515 19.6696 10.2632 18.9652 10.2632 18.2308V16M19.2368 17.5385H19.9211C20.6469 17.5385 21.343 17.2467 21.8563 16.7274C22.3696 16.208 22.6579 15.5037 22.6579 14.7692C22.6579 14.0348 22.3696 13.3304 21.8563 12.8111C21.343 12.2918 20.6469 12 19.9211 12H14.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.91664 12.7489C4.59191 13.9565 5.73649 14.1326 6.92031 13.9565C8.10413 13.7804 9.30244 13.0892 10.2516 12.035C11.2008 10.9807 11.8231 9.6498 11.9817 8.33497C12.1402 7.02014 11.9817 5.9989 11.1195 5.2489C10.8944 4.2489 9.29968 3.86524 8.11586 4.04133C6.93203 4.21741 5.73372 4.9086 4.78453 5.96283C3.83534 7.01707 3.21302 8.34799 3.05448 9.66282C2.89594 10.9777 3.05448 12.2489 3.91664 12.7489Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.0295 5.09888C11.1195 9.99888 3.91665 7.99888 4.00668 12.8989"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 21L20 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default RatioIcon;
