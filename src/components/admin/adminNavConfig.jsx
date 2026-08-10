import React from "react";
import { IoGridOutline } from "react-icons/io5";
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineSparkles } from "react-icons/hi";

/**
 * Shared Admin Navigation Items configuration.
 * Single source of truth for both AdminSidebar and AdminDock.
 */
export const ADMIN_NAV_ITEMS = [
  { id: "dashboard",    label: "الرئيسية",           dockLabel: "الرئيسية",   icon: <IoGridOutline className="text-xl" />,         href: "/admin/controlpanel" },
  { id: "users",        label: "إدارة المستخدمين",     dockLabel: "المستخدمون", icon: <HiOutlineUsers className="text-xl" />,        href: "/admin/users" },
  { id: "content",      label: "إدارة المحتوى",         dockLabel: "المحتوى",     icon: <HiOutlineDocumentText className="text-xl" />, href: "/admin/content" },
  { id: "ai-assistant", label: "إدارة المساعد الذكي", dockLabel: "المساعد",    icon: <HiOutlineSparkles className="text-xl" />,     href: "/admin/ai-assistant" },
  { id: "plans",        label: "إدارة الباقات",             dockLabel: "الباقات",     icon: <HiOutlineSparkles className="text-xl" />,     href: "/plan" },
];
