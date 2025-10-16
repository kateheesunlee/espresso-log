import React from "react";

import { colors } from "../themes/colors";

// React component icons
import AddNotesIcon from "./icons/AddNotesIcon";
import BeanFilledIcon from "./icons/BeanFilledIcon";
import BeanIcon from "./icons/BeanIcon";
import CameraIcon from "./icons/CameraIcon";
import CloseIcon from "./icons/CloseIcon";
import CoffeeIcon from "./icons/CoffeeIcon";
import CoffeeFilledIcon from "./icons/CoffeeFilledIcon";
import CoffeemakerIcon from "./icons/CoffeemakerIcon";
import CoffeemakerFilledIcon from "./icons/CoffeemakerFilledIcon";
import CopyIcon from "./icons/CopyIcon";
import DeleteIcon from "./icons/DeleteIcon";
import DialIcon from "./icons/DialIcon";
import EditIcon from "./icons/EditIcon";
import HeartBroken2FilledIcon from "./icons/HeartBroken2FilledIcon";
import HeartBroken2Icon from "./icons/HeartBroken2Icon";
import HeartBrokenFilledIcon from "./icons/HeartBrokenFilledIcon";
import HeartBrokenIcon from "./icons/HeartBrokenIcon";
import HeartFilledIcon from "./icons/HeartFilledIcon";
import HeartIcon from "./icons/HeartIcon";
import MagicHatIcon from "./icons/MagicHatIcon";
import NoteFilledIcon from "./icons/NoteFilledIcon";
import OpenBagIcon from "./icons/OpenBagIcon";
import PlusIcon from "./icons/PlusIcon";
import RatioIcon from "./icons/RatioIcon";
import RefreshCoffeeBagIcon from "./icons/RefreshCoffeeBagIcon";
import RoasterIcon from "./icons/RoasterIcon";
import ScaleIcon from "./icons/ScaleIcon";
import SendIcon from "./icons/SendIcon";
import ShareIcon from "./icons/ShareIcon";
import StarFilledIcon from "./icons/StarFilledIcon";
import StarIcon from "./icons/StarIcon";
import SunIcon from "./icons/SunIcon";
import TempIcon from "./icons/TemperatureIcon";
import ThumbDownIcon from "./icons/ThumbDownIcon";
import ThumbUpIcon from "./icons/ThumbUpIcon";
import TimerIcon from "./icons/TimerIcon";
import WarningIcon from "./icons/WarningIcon";
import WaterIcon from "./icons/WaterIcon";

const ICONS = {
  "add-notes": AddNotesIcon,
  bean_filled: BeanFilledIcon,
  bean: BeanIcon,
  camera: CameraIcon,
  coffee: CoffeeIcon,
  coffee_filled: CoffeeFilledIcon,
  coffeemaker: CoffeemakerIcon,
  coffeemaker_filled: CoffeemakerFilledIcon,
  copy: CopyIcon,
  delete: DeleteIcon,
  edit: EditIcon,
  heart: HeartIcon,
  heart_broken: HeartBrokenIcon,
  magic_hat: MagicHatIcon,
  heart_broken_2: HeartBroken2Icon,
  heart_broken_2_filled: HeartBroken2FilledIcon,
  heart_broken_filled: HeartBrokenFilledIcon,
  heart_filled: HeartFilledIcon,
  note_filled: NoteFilledIcon,
  open_bag: OpenBagIcon,
  plus: PlusIcon,
  send: SendIcon,
  share: ShareIcon,
  star: StarIcon,
  star_filled: StarFilledIcon,
  sun: SunIcon,
  "thumb-down": ThumbDownIcon,
  "thumb-up": ThumbUpIcon,
  scale: ScaleIcon,
  water: WaterIcon,
  timer: TimerIcon,
  ratio: RatioIcon,
  "refresh-coffee-bag": RefreshCoffeeBagIcon,
  roaster: RoasterIcon,
  dial: DialIcon,
  warning: WarningIcon,
  temp: TempIcon,
  close: CloseIcon,
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size: number;
  color?: string;
  secondaryColor?: string;
  useContentColor?: boolean;
};

export default function SvgIcon({
  name,
  size = 24,
  color = colors.primary,
  secondaryColor = colors.primaryLight,
  useContentColor = false,
}: Props) {
  const C = ICONS[name];

  return (
    <C
      size={size}
      color={color}
      secondaryColor={secondaryColor}
      useContentColor={useContentColor}
    />
  );
}
