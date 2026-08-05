import type { ReactNode } from 'react';

export type RibbonThemeId = 'classic-light' | 'modern-dark' | 'modern-light';

export type RibbonThemeColorScheme = 'dark' | 'light';

export interface RibbonThemeTokens {
  readonly accent: string;
  readonly accentHover: string;
  readonly borderControl: string;
  readonly borderControlHover: string;
  readonly borderDivider: string;
  readonly borderPopover: string;
  readonly borderToolbar: string;
  readonly brandLogo: string;
  readonly controlHover: string;
  readonly controlPressed: string;
  readonly controlSelected: string;
  readonly controlSelectedText: string;
  readonly fontFamily: string;
  readonly headerControlHover: string;
  readonly headerControlPressed: string;
  readonly iconDefault: string;
  readonly iconStrong: string;
  readonly radiusSmall: string;
  readonly scrollbarThumb: string;
  readonly selection: string;
  readonly shadowPopover: string;
  readonly surfaceCanvas: string;
  readonly surfaceContent: string;
  readonly surfaceHeader: string;
  readonly surfaceInput: string;
  readonly surfacePanel: string;
  readonly surfacePopover: string;
  readonly surfaceTabActive: string;
  readonly surfaceTabBar: string;
  readonly surfaceToolbar: string;
  readonly surfaceToolbarSubtle: string;
  readonly tabIndicator: string;
  readonly textHeader: string;
  readonly textInverse: string;
  readonly textLink: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textTertiary: string;
}

export interface RibbonTheme {
  readonly colorScheme: RibbonThemeColorScheme;
  readonly id: RibbonThemeId;
  readonly label: string;
  readonly tokens: RibbonThemeTokens;
}

export interface RibbonThemeContextValue {
  readonly theme: RibbonTheme;
  readonly themeId: RibbonThemeId;
  readonly tokens: RibbonThemeTokens;
}

export interface RibbonThemeProviderProps {
  /** Content that participates in the shared theme boundary. */
  readonly children: ReactNode;
  /** Optional host class for layout integration; theme values remain provider-owned. */
  readonly className?: string;
  /** Selects one of the immutable built-in theme contracts. */
  readonly themeId: RibbonThemeId;
}
