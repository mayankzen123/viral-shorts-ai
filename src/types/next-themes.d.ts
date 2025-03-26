declare module "next-themes" {
  import { ReactNode } from "react";

  export interface ThemeProviderProps {
    children: ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    storageKey?: string;
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
    themes?: string[];
  }

  export interface UseThemeProps {
    themes?: string[];
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
  }

  export interface UseThemeReturn {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    forcedTheme: string | undefined;
    resolvedTheme: string | undefined;
    themes: string[];
    systemTheme: string | undefined;
  }

  export function useTheme(): UseThemeReturn;
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}

declare module "next-themes/dist/types" {
  export * from "next-themes";
} 