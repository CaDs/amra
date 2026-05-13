import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TabKey = "index" | "lore" | "settings";

export type TabSpec = {
  key: TabKey;
  routeName: TabKey;
  label: string;
  iconActive: IoniconName;
  iconInactive: IoniconName;
};

export const TAB_ORDER: readonly TabKey[] = ["index", "lore", "settings"] as const;

export const TABS: Record<TabKey, TabSpec> = {
  index: {
    key: "index",
    routeName: "index",
    label: "Home",
    iconActive: "home",
    iconInactive: "home-outline",
  },
  lore: {
    key: "lore",
    routeName: "lore",
    label: "Codex",
    iconActive: "book",
    iconInactive: "book-outline",
  },
  settings: {
    key: "settings",
    routeName: "settings",
    label: "Settings",
    iconActive: "settings",
    iconInactive: "settings-outline",
  },
};

export function specForRoute(routeName: string): TabSpec | undefined {
  return (TABS as Record<string, TabSpec | undefined>)[routeName];
}
