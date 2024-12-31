"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { usePathname } from "next/navigation";

const alwaysWhite = ["/", "/contact-us", "/sign-in", "/sign-up"];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  return (
    <NextThemesProvider
      {...props}
      forcedTheme={alwaysWhite.includes(pathname) ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
