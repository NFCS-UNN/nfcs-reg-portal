"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  // Read stored theme on mount
  React.useEffect(() => {
    const stored = (localStorage.getItem("nfcs-theme") as Theme) || "system";
    setThemeState(stored);
  }, []);

  // Apply theme class to <html> and resolve
  React.useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: Theme) => {
      if (t === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        setResolvedTheme("dark");
      } else if (t === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        setResolvedTheme("light");
      } else {
        // system
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          root.classList.add("dark");
          root.classList.remove("light");
          setResolvedTheme("dark");
        } else {
          root.classList.remove("dark");
          root.classList.add("light");
          setResolvedTheme("light");
        }
      }
    };

    applyTheme(theme);

    // Listen for system preference changes when in "system" mode
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme("system");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("nfcs-theme", t);
    setThemeState(t);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
