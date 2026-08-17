"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="koomeh-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme(): ThemeContextValue {
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme();
  const theme: Theme = resolvedTheme === "dark" ? "dark" : "light";

  const setTheme = React.useCallback(
    (next: Theme) => setNextTheme(next),
    [setNextTheme],
  );

  return React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme],
  );
}
