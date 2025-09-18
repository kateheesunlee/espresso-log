import Svg, { Path } from "react-native-svg";
import { IconProps } from "./types";

const CoffeemakerFilledIcon = ({ size, color, secondaryColor }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 16.5H4V20.5C4.5 21.5 5.4 22 7 22C8.6 22 9.83333 21 10 20.5V16.5Z"
        fill={secondaryColor}
        stroke={color}
      />
      <Path
        d="M14 22V12C14 11.4696 13.7893 10.9609 13.4142 10.5858C13.0391 10.2107 12.5304 10 12 10H4C3.46957 10 2.96086 9.78929 2.58579 9.41421C2.21071 9.03914 2 8.53043 2 8V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V22H2"
        fill={secondaryColor}
      />
      <Path
        d="M14 22V12C14 11.4696 13.7893 10.9609 13.4142 10.5858C13.0391 10.2107 12.5304 10 12 10H4C3.46957 10 2.96086 9.78929 2.58579 9.41421C2.21071 9.03914 2 8.53043 2 8V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V22H2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 2V4C10 4.53043 9.78929 5.03914 9.41421 5.41421C9.03914 5.78929 8.53043 6 8 6C7.46957 6 6.96086 5.78929 6.58579 5.41421C6.21071 5.03914 6 4.53043 6 4V2M22 6H18M22 10H18M18 22V16C18 15.4696 18.2107 14.9609 18.5858 14.5858C18.9609 14.2107 19.4696 14 20 14H22M7 10V12M4 16V19C4 20.7 5.3 22 7 22C8.7 22 10 20.7 10 19V16H4ZM4 16C3.46957 16 2.96086 16.2107 2.58579 16.5858C2.21071 16.9609 2 17.4696 2 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CoffeemakerFilledIcon;
