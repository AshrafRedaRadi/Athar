import React from "react";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { RiAwardLine } from "react-icons/ri";
import { BsBook, BsClipboard2Check } from "react-icons/bs";

/**
 * Shared Main Navigation Items configuration.
 * Single source of truth for both main Sidebar and Dock components.
 */
export const MAIN_NAV_ITEMS = [
  { id: "home",         label: "الرئيسية",       dockLabel: "الرئيسية",   icon: <IoHomeOutline className="text-xl" />,      href: "/home" },
  { id: "library",      label: "المكتبة",        dockLabel: "المكتبة",    icon: <BsBook className="text-xl" />,             href: "/library" },
  { id: "review",       label: "التحكم في الخطة", dockLabel: "الخطة",     icon: <BsClipboard2Check className="text-xl" />,  href: "/plan" },
  { id: "achievements", label: "الإنجازات",      dockLabel: "الإنجازات",  icon: <RiAwardLine className="text-xl" />,        href: "/achievements" },
  { id: "settings",     label: "الإعدادات",      dockLabel: "الإعدادات",  icon: <IoSettingsOutline className="text-xl" />,  href: "#", isSidebarOnly: true },
];
