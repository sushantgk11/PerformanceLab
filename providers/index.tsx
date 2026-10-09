"use client";
import {
  createContext,
  useContext,
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
  now: string;
  hydrated: boolean;
  toast: string;
  notify: (message: string) => void;
}
const SettingsContext = createContext<SettingsContextValue | null>(null);
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("SettingsProvider is required");
  return context;
}
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
      }),
  );
  const [store] = useState(createStore);
  const [settings, setSettings] = useState(defaults);
  const [now, setNow] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("lab-settings");
        if (saved) setSettings({ ...defaults, ...JSON.parse(saved) });
      } catch {
        /* Use workspace defaults when local storage is unavailable. */
      }
      setHydrated(true);
      setNow(new Date().toISOString());
    }, 0);
    const clock = setInterval(() => setNow(new Date().toISOString()), 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(clock);
    };
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
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      localStorage.setItem("lab-settings", JSON.stringify(next));
    } catch {
      setToast("Changes apply this session; browser storage is unavailable.");
    }
  }
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SettingsContext.Provider
          value={{ settings, update, now, hydrated, toast, notify: setToast }}
        >
          {children}
          {toast && (
            <div role="status" className="toast">
              {toast}
            </div>
          )}
        </SettingsContext.Provider>
      </QueryClientProvider>
    </Provider>
  );
}
