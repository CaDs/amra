import { Drawer } from "expo-router/drawer";

import { useTheme } from "../../src/theme/useTheme";
import { DrawerContent } from "../../src/components/nav/DrawerContent";

export default function TabsLayout() {
  const { palette } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: { backgroundColor: palette.bg, width: 288 },
        overlayColor: "rgba(0,0,0,0.55)",
        swipeEdgeWidth: 32,
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
      <Drawer.Screen name="lore" options={{ title: "Codex" }} />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
    </Drawer>
  );
}
