import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Icon } from './Icon';
import type { IconProps } from './Icon.types';

function renderIcon(props: IconProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Icon {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Icon', () => {
  it('renders a decorative svg hidden from assistive technology with schema defaults', () => {
    renderIcon({ icon: 'save', id: 'save-icon' });
    const icon = document.getElementById('save-icon');

    expect(icon?.tagName).toBe('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('data-ribbon-ui-component', 'icon');
    expect(icon).toHaveAttribute('data-icon', 'save');
    expect(icon).toHaveAttribute('data-size', 'medium');
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    expect(icon).toHaveAttribute('focusable', 'false');
  });

  it.each(['save', 'undo', 'redo', 'search', 'close', 'more'] as const)(
    'maps the allowlisted %s glyph to a deterministic data-icon attribute',
    (icon) => {
      renderIcon({ icon, id: `icon-${icon}` });
      expect(document.getElementById(`icon-${icon}`)).toHaveAttribute('data-icon', icon);
    },
  );

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderIcon({ icon: 'save', id: `size-${size}`, size });
      expect(document.getElementById(`size-${size}`)).toHaveAttribute('data-size', size);
    },
  );

  it('merges an optional host layout class without dropping the theme boundary', () => {
    renderIcon({ className: 'host-slot', icon: 'more', id: 'themed-icon' });
    const icon = document.getElementById('themed-icon');
    const boundary = icon?.parentElement;

    expect(icon).toHaveClass('ribbon-ui-icon', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderIcon({ icon: 'search', id: 'theme-icon' });
    const boundary = document.getElementById('theme-icon')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Icon icon="search" id="theme-icon" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
