import Svg, { Path } from "react-native-svg";
import { IconProps } from "./types";

const HeartBroken2Icon = ({ size, color, secondaryColor }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 5.49999C6.5 1.99999 0.578584 5.81942 1.5 10.5C2.07774 15.3286 6.39635 17.2346 9.29883 19.2239C10.3227 19.9242 11.3072 20.5829 12.2001 20.4761M10 5.49999L8.5 9L11 11L10 14.5L12.6177 16.3976L12.2001 20.4761"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.4108 5.80011C17.4151 1.98846 23.7498 5.96602 22.5635 10.8987C21.9089 15.7174 17.6803 17.5707 14.8246 19.5241C13.8173 20.2118 12.8497 20.6154 11.9852 20.498"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HeartBroken2Icon;
