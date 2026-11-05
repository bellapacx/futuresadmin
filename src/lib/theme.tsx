"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Mode = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type ThemeContextValue = {
  mode: Mode;
  resolved: Resolved;
  setMode: (m: Mode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "futures-admin-theme";

function getSystemResolved(): Resolved {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyClass(resolved: Resolved) {
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("system");
  const [resolved, setResolved] = useState<Resolved>("light");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored =
      (localStorage.getItem(STORAGE_KEY) as Mode | null) ?? "system";
    setModeState(stored);
    const r = stored === "system" ? getSystemResolved() : stored;
    setResolved(r);
    applyClass(r);
  }, []);

  // React to system changes when mode is "system"
  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const r: Resolved = mql.matches ? "dark" : "light";
      setResolved(r);
      applyClass(r);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    const r = m === "system" ? getSystemResolved() : m;
    setResolved(r);
    applyClass(r);
  }, []);

  const toggle = useCallback(() => {
    setMode(resolved === "dark" ? "light" : "dark");
  }, [resolved, setMode]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
