import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { ColorSwatch } from './ColorSwatch';
import type { ColorSwatchProps } from './ColorSwatch.types';

function renderSwatch(props: ColorSwatchProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <ColorSwatch {...props} />
    </RibbonThemeProvider>,
  );
}

describe('ColorSwatch', () => {
  it('renders a decorative chip filled with the configured color', () => {
    renderSwatch({ color: '#ff0000', id: 'red' });
    const swatch = document.getElementById('red');

    expect(swatch?.tagName).toBe('SPAN');
    expect(swatch).toHaveAttribute('data-ribbon-ui-component', 'color-swatch');
    expect(swatch).toHaveAttribute('data-size', 'medium');
    expect(swatch).toHaveAttribute('data-shape', 'square');
    expect(swatch).toHaveAttribute('aria-hidden', 'true');
    expect(swatch).not.toHaveAttribute('role');
    expect(swatch).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('upgrades to a role=img element with an accessible name when a label is provided', () => {
    renderSwatch({ color: '#00ff00', id: 'green', label: 'Green' });
    const swatch = document.getElementById('green');

    expect(swatch).toHaveAttribute('role', 'img');
    expect(swatch).toHaveAttribute('aria-label', 'Green');
    expect(swatch).not.toHaveAttribute('aria-hidden');
    expect(swatch).toHaveStyle({ backgroundColor: '#00ff00' });
  });

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderSwatch({ color: '#0000ff', id: `size-${size}`, size });
      expect(document.getElementById(`size-${size}`)).toHaveAttribute('data-size', size);
    },
  );

  it.each(['square', 'circle'] as const)(
    'maps the %s shape to a stable rendering attribute',
    (shape) => {
      renderSwatch({ color: '#0000ff', id: `shape-${shape}`, shape });
      expect(document.getElementById(`shape-${shape}`)).toHaveAttribute('data-shape', shape);
    },
  );

  it('merges an optional host layout class without dropping the theme boundary', () => {
    renderSwatch({ className: 'host-slot', color: '#ff0000', id: 'themed-swatch' });
    const swatch = document.getElementById('themed-swatch');
    const boundary = swatch?.parentElement;

    expect(swatch).toHaveClass('ribbon-ui-color-swatch', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderSwatch({ color: '#ff0000', id: 'theme-swatch' });
    const boundary = document.getElementById('theme-swatch')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <ColorSwatch color="#ff0000" id="theme-swatch" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
