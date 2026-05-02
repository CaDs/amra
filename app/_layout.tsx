import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useAppFonts } from "../src/theme/fonts";
import { SettingsProvider } from "../src/state/SettingsContext";
import { useTheme } from "../src/theme/useTheme";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop */
});

function ThemedStack() {
  const { palette, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="gazetteer"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
            gestureDirection: "horizontal",
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="[tomeId]/index"
          options={{
            animation: "slide_from_bottom",
            gestureEnabled: true,
            gestureDirection: "horizontal",
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="[tomeId]/[entryId]"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
            gestureDirection: "horizontal",
            fullScreenGestureEnabled: true,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const ready = useAppFonts();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        /* noop */
      });
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemedStack />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
