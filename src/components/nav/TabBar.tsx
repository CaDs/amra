import { Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { IOSGlassTabBar } from "./IOSGlassTabBar";
import { AndroidMaterialTabBar } from "./AndroidMaterialTabBar";

export function TabBar(props: BottomTabBarProps) {
  if (Platform.OS === "ios") return <IOSGlassTabBar {...props} />;
  if (Platform.OS === "android") return <AndroidMaterialTabBar {...props} />;
  return null;
}
