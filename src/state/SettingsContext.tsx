import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ThemeMode } from "../theme/useTheme";

const STORAGE_KEY = "amra:settings:v1";

export type Settings = {
  haptics: boolean;
  themeMode: ThemeMode;
};

const DEFAULTS: Settings = {
  haptics: true,
  themeMode: "dark",
};

type SettingsContextValue = Settings & {
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

type Props = { children: ReactNode };

export function SettingsProvider({ children }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<Settings>;
            setSettings({
              haptics: typeof parsed.haptics === "boolean" ? parsed.haptics : DEFAULTS.haptics,
              themeMode:
                parsed.themeMode === "light" || parsed.themeMode === "dark"
                  ? parsed.themeMode
                  : DEFAULTS.themeMode,
            });
          } catch {
            // ignore malformed JSON; fall back to defaults
          }
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next: Settings = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // best-effort persistence; in-memory state remains correct
      });
      return next;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ ...settings, update }),
    [settings, update],
  );

  if (!hydrated) return null;

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return ctx;
}
