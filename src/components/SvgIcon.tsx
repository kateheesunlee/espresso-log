import React from "react";
import { colors } from "../themes/colors";

// React component icons
import AddNotesIcon from "./icons/AddNotesIcon";
import BeanFilledIcon from "./icons/BeanFilledIcon";
import BeanIcon from "./icons/BeanIcon";
import CameraIcon from "./icons/CameraIcon";
import CoffeeIcon from "./icons/CoffeeIcon";
import CoffeeFilledIcon from "./icons/CoffeeFilledIcon";
import CoffeemakerIcon from "./icons/CoffeemakerIcon";
import CoffeemakerFilledIcon from "./icons/CoffeemakerFilledIcon";
import CopyIcon from "./icons/CopyIcon";
import DeleteIcon from "./icons/DeleteIcon";
import EditIcon from "./icons/EditIcon";
import NoteFilledIcon from "./icons/NoteFilledIcon";
import PlusIcon from "./icons/PlusIcon";
import SendIcon from "./icons/SendIcon";
import ShareIcon from "./icons/ShareIcon";
import StarIcon from "./icons/StarIcon";
import StarFilledIcon from "./icons/StarFilledIcon";
import ThumbDownIcon from "./icons/ThumbDownIcon";
import ThumbUpIcon from "./icons/ThumbUpIcon";

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
  note_filled: NoteFilledIcon,
  plus: PlusIcon,
  send: SendIcon,
  share: ShareIcon,
  star: StarIcon,
  star_filled: StarFilledIcon,
  "thumb-down": ThumbDownIcon,
  "thumb-up": ThumbUpIcon,
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size: number;
  color?: string;
  secondaryColor?: string;
};

export default function SvgIcon({
  name,
  size = 24,
  color = colors.primary,
  secondaryColor = colors.secondary,
}: Props) {
  const C = ICONS[name];

  return <C size={size} color={color} secondaryColor={secondaryColor} />;
}
