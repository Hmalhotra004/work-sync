import { RouteType } from "@/types";
import { SettingsIcon, UserIcon } from "lucide-react";
import { allowedAdmin } from "./utils";

import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

export const routes: RouteType = [
  {
    label: "Home",
    href: "",
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
    href: `/settings`,
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    allowedRole: allowedAdmin,
  },
];
