import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider, useRibbonTheme } from './ThemeProvider';
import { getRibbonTheme, ribbonThemeIds } from './ThemeProvider.tokens';
import type { RibbonThemeId } from './ThemeProvider.types';

interface RgbColor {
  readonly blue: number;
  readonly green: number;
  readonly red: number;
}

function parseColor(value: string, background: RgbColor): RgbColor {
  if (value.startsWith('#')) {
    return {
      blue: Number.parseInt(value.slice(5, 7), 16),
      green: Number.parseInt(value.slice(3, 5), 16),
      red: Number.parseInt(value.slice(1, 3), 16),
    };
  }

  const match = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0(?:\.\d+)?|1)\)$/u.exec(value);
  if (
    match === null ||
    match[1] === undefined ||
    match[2] === undefined ||
    match[3] === undefined ||
    match[4] === undefined
  ) {
    throw new Error(`Unsupported test color: ${value}`);
  }
  const alpha = Number(match[4]);
  return {
    blue: Number(match[3]) * alpha + background.blue * (1 - alpha),
    green: Number(match[2]) * alpha + background.green * (1 - alpha),
    red: Number(match[1]) * alpha + background.red * (1 - alpha),
  };
}

function luminance(color: RgbColor): number {
  const linear = [color.red, color.green, color.blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrast(foreground: string, background: string): number {
  const fallback = { blue: 255, green: 255, red: 255 };
  const backgroundColor = parseColor(background, fallback);
  const foregroundColor = parseColor(foreground, backgroundColor);
  const lighter = Math.max(luminance(foregroundColor), luminance(backgroundColor));
  const darker = Math.min(luminance(foregroundColor), luminance(backgroundColor));
  return (lighter + 0.05) / (darker + 0.05);
}

function ThemeConsumer({ name }: Readonly<{ name: string }>) {
  const context = useRibbonTheme();
  const { theme, themeId, tokens } = context;
  return (
    <output
      data-context-frozen={String(Object.isFrozen(context))}
      data-testid={name}
      style={{ color: tokens.textPrimary }}
    >
      {themeId}:{theme.label}
    </output>
  );
}

describe('RibbonThemeProvider', () => {
  it('keeps every built-in theme on one immutable token contract', () => {
    const baselineKeys = Object.keys(getRibbonTheme('modern-light').tokens).sort();

    expect(ribbonThemeIds).toEqual(['modern-light', 'classic-light', 'modern-dark']);
    expect(Object.isFrozen(ribbonThemeIds)).toBe(true);
    for (const themeId of ribbonThemeIds) {
      const theme = getRibbonTheme(themeId);
      expect(Object.keys(theme.tokens).sort()).toEqual(baselineKeys);
      expect(Object.isFrozen(theme)).toBe(true);
      expect(Object.isFrozen(theme.tokens)).toBe(true);
    }
  });

  it.each(ribbonThemeIds)('retains accessible core text contrast for %s', (themeId) => {
    const { tokens } = getRibbonTheme(themeId);

    expect(contrast(tokens.textHeader, tokens.surfaceHeader)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens.textPrimary, tokens.surfaceToolbar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens.textLink, tokens.surfaceToolbar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens.controlSelectedText, tokens.controlSelected)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('publishes one coherent theme to nested consumers and updates them together', () => {
    const { rerender } = render(
      <RibbonThemeProvider className="host-layout" themeId="modern-light">
        <ThemeConsumer name="outer" />
        <section>
          <ThemeConsumer name="inner" />
        </section>
      </RibbonThemeProvider>,
    );

    const boundary = screen.getByTestId('outer').parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
    expect(boundary).toHaveClass('ribbon-ui-theme', 'host-layout');
    expect(boundary?.style.getPropertyValue('--ribbon-ui-surface-header')).toBe('#f3f3f3');
    const customProperties = Array.from(
      { length: boundary?.style.length ?? 0 },
      (_, index) => boundary?.style.item(index) ?? '',
    ).filter((propertyName) => propertyName.startsWith('--ribbon-ui-'));
    expect(customProperties).toHaveLength(
      Object.keys(getRibbonTheme('modern-light').tokens).length,
    );
    expect(screen.getByTestId('outer')).toHaveAttribute('data-context-frozen', 'true');
    expect(screen.getByTestId('outer')).toHaveTextContent('modern-light:Light');
    expect(screen.getByTestId('inner')).toHaveTextContent('modern-light:Light');

    rerender(
      <RibbonThemeProvider className="host-layout" themeId="modern-dark">
        <ThemeConsumer name="outer" />
        <section>
          <ThemeConsumer name="inner" />
        </section>
      </RibbonThemeProvider>,
    );

    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
    expect(boundary?.style.getPropertyValue('--ribbon-ui-surface-header')).toBe('#222222');
    expect(screen.getByTestId('outer')).toHaveTextContent('modern-dark:Dark');
    expect(screen.getByTestId('inner')).toHaveTextContent('modern-dark:Dark');
  });

  it('does not persist theme selection or write the legacy page attribute', () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(
      <RibbonThemeProvider themeId="classic-light">
        <ThemeConsumer name="consumer" />
      </RibbonThemeProvider>,
    );

    expect(storageSpy).not.toHaveBeenCalled();
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    storageSpy.mockRestore();
  });

  it('fails explicitly when a consumer is outside the provider', () => {
    expect(() => render(<ThemeConsumer name="orphan" />)).toThrow(
      'useRibbonTheme must be used within a RibbonThemeProvider.',
    );
  });

  it('returns the selected immutable theme through the public lookup', () => {
    const ids: readonly RibbonThemeId[] = ribbonThemeIds;
    expect(ids.map((themeId) => getRibbonTheme(themeId).id)).toEqual(ids);
  });
});
