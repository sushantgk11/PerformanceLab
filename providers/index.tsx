"use client";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { createStore } from "@/store";

export interface Settings {
  name: string;
  email: string;
  title: string;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  liveNotifications: boolean;
  weeklyDigest: boolean;
  density: "comfortable" | "compact";
  defaultRange: string;
  permissions: Record<string, boolean>;
}
const defaults: Settings = {
  name: "Alex Morgan",
  email: "alex@performancelab.dev",
  title: "Workspace administrator",
  theme: "light",
  emailNotifications: true,
  liveNotifications: true,
  weeklyDigest: false,
  density: "comfortable",
  defaultRange: "30",
  permissions: { Admin: true, Analyst: true, Member: false, Viewer: false },
};
interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  hydrated: boolean;
}
const SettingsContext = createContext<SettingsContextValue | null>(null);
const NotificationsContext = createContext<((message: string) => void) | null>(
  null,
);
const ClockContext = createContext<string | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("SettingsProvider is required");
  return context;
}
export function useNotifications() {
  const notify = useContext(NotificationsContext);
  if (!notify) throw new Error("NotificationsProvider is required");
  return notify;
}
export function useClock() {
  const now = useContext(ClockContext);
  if (now === null) throw new Error("ClockProvider is required");
  return now;
}

function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <NotificationsContext.Provider value={setToast}>
      {children}
      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
    </NotificationsContext.Provider>
  );
}

function ClockProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString());
    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, 15000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);
  const notify = useNotifications();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("lab-settings");
        if (saved) setSettings({ ...defaults, ...JSON.parse(saved) });
      } catch {
        /* Use workspace defaults when local storage is unavailable. */
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      document.documentElement.dataset.theme =
        settings.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : settings.theme;
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    document.documentElement.dataset.density = settings.density;
    return () => media.removeEventListener("change", applyTheme);
  }, [settings]);
  const update = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      try {
        localStorage.setItem("lab-settings", JSON.stringify(next));
      } catch {
        notify("Changes apply this session; browser storage is unavailable.");
      }
    },
    [settings, notify],
  );
  const value = useMemo(
    () => ({ settings, update, hydrated }),
    [settings, update, hydrated],
  );
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
      }),
  );
  const [store] = useState(createStore);
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <SettingsProvider>
            <ClockProvider>{children}</ClockProvider>
          </SettingsProvider>
        </NotificationsProvider>
      </QueryClientProvider>
    </Provider>
  );
}
