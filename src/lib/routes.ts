import { HrefType } from "@/types";
import { SettingsIcon, UserIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

type RouteType = {
  label: string;
  href: HrefType;
  icon: IconType;
  activeIcon: IconType;
}[];

const routes: RouteType = [
  {
    label: "Home",
    href: "/",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Members",
    href: "/members",
    icon: UserIcon,
    activeIcon: UserIcon,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },
];

export default routes;
