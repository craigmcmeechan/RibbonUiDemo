import { createContext, useContext, useMemo, type CSSProperties, type ReactElement } from 'react';

import './ThemeProvider.css';
import { getRibbonTheme } from './ThemeProvider.tokens';
import type {
  RibbonThemeContextValue,
  RibbonThemeId,
  RibbonThemeProviderProps,
  RibbonThemeTokens,
} from './ThemeProvider.types';

type ThemeTokenKey = keyof RibbonThemeTokens;
type ThemeCssVariable = `--ribbon-ui-${string}`;
type ThemeBoundaryStyle = CSSProperties & Readonly<Record<ThemeCssVariable, string>>;

const tokenCssVariables = Object.freeze({
  accent: '--ribbon-ui-accent',
  accentHover: '--ribbon-ui-accent-hover',
  borderControl: '--ribbon-ui-border-control',
  borderControlHover: '--ribbon-ui-border-control-hover',
  borderDivider: '--ribbon-ui-border-divider',
  borderPopover: '--ribbon-ui-border-popover',
  borderToolbar: '--ribbon-ui-border-toolbar',
  brandLogo: '--ribbon-ui-brand-logo',
  controlHover: '--ribbon-ui-control-hover',
  controlPressed: '--ribbon-ui-control-pressed',
  controlSelected: '--ribbon-ui-control-selected',
  controlSelectedText: '--ribbon-ui-control-selected-text',
  fontFamily: '--ribbon-ui-font-family',
  headerControlHover: '--ribbon-ui-header-control-hover',
  headerControlPressed: '--ribbon-ui-header-control-pressed',
  iconDefault: '--ribbon-ui-icon-default',
  iconStrong: '--ribbon-ui-icon-strong',
  radiusSmall: '--ribbon-ui-radius-small',
  scrollbarThumb: '--ribbon-ui-scrollbar-thumb',
  selection: '--ribbon-ui-selection',
  shadowPopover: '--ribbon-ui-shadow-popover',
  surfaceCanvas: '--ribbon-ui-surface-canvas',
  surfaceContent: '--ribbon-ui-surface-content',
  surfaceHeader: '--ribbon-ui-surface-header',
  surfaceInput: '--ribbon-ui-surface-input',
  surfacePanel: '--ribbon-ui-surface-panel',
  surfacePopover: '--ribbon-ui-surface-popover',
  surfaceTabActive: '--ribbon-ui-surface-tab-active',
  surfaceTabBar: '--ribbon-ui-surface-tab-bar',
  surfaceToolbar: '--ribbon-ui-surface-toolbar',
  surfaceToolbarSubtle: '--ribbon-ui-surface-toolbar-subtle',
  tabIndicator: '--ribbon-ui-tab-indicator',
  textHeader: '--ribbon-ui-text-header',
  textInverse: '--ribbon-ui-text-inverse',
  textLink: '--ribbon-ui-text-link',
  textPrimary: '--ribbon-ui-text-primary',
  textSecondary: '--ribbon-ui-text-secondary',
  textTertiary: '--ribbon-ui-text-tertiary',
}) satisfies Readonly<Record<ThemeTokenKey, ThemeCssVariable>>;

const RibbonThemeContext = createContext<RibbonThemeContextValue | undefined>(undefined);

function createBoundaryStyle(themeId: RibbonThemeId): ThemeBoundaryStyle {
  const theme = getRibbonTheme(themeId);
  const style: Record<string, string> = { colorScheme: theme.colorScheme };
  for (const tokenKey of Object.keys(tokenCssVariables) as ThemeTokenKey[]) {
    style[tokenCssVariables[tokenKey]] = theme.tokens[tokenKey];
  }
  return Object.freeze(style);
}

const boundaryStyles: Readonly<Record<RibbonThemeId, ThemeBoundaryStyle>> = Object.freeze({
  'classic-light': createBoundaryStyle('classic-light'),
  'modern-dark': createBoundaryStyle('modern-dark'),
  'modern-light': createBoundaryStyle('modern-light'),
});

export function useRibbonTheme(): RibbonThemeContextValue {
  const value = useContext(RibbonThemeContext);
  if (value === undefined) {
    throw new Error('useRibbonTheme must be used within a RibbonThemeProvider.');
  }
  return value;
}

export function RibbonThemeProvider({
  children,
  className,
  themeId,
}: RibbonThemeProviderProps): ReactElement {
  const theme = getRibbonTheme(themeId);
  const contextValue = useMemo<RibbonThemeContextValue>(
    () => Object.freeze({ theme, themeId, tokens: theme.tokens }),
    [theme, themeId],
  );
  const boundaryClassName =
    className === undefined ? 'ribbon-ui-theme' : `ribbon-ui-theme ${className}`;

  return (
    <RibbonThemeContext value={contextValue}>
      <div
        className={boundaryClassName}
        data-ribbon-ui-theme={themeId}
        style={boundaryStyles[themeId]}
      >
        {children}
      </div>
    </RibbonThemeContext>
  );
}
