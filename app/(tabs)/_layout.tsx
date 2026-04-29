import { Platform } from "react-native";
import { Slot, Tabs } from "expo-router";

import { TabBar } from "../../src/components/nav/TabBar";

export default function TabsLayout() {
  if (Platform.OS === "web") {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="lore" options={{ title: "Lore" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
