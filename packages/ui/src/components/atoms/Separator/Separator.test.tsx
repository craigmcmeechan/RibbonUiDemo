import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Separator } from './Separator';
import type { SeparatorProps } from './Separator.types';

function renderSeparator(props: SeparatorProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Separator {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Separator', () => {
  it('renders a decorative divider hidden from assistive technology with schema defaults', () => {
    renderSeparator({ id: 'group-sep' });
    const separator = document.getElementById('group-sep');

    expect(separator).not.toBeNull();
    expect(separator).toHaveAttribute('data-ribbon-ui-component', 'separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(separator).not.toHaveRole('separator');
  });

  it.each(['vertical', 'horizontal'] as const)(
    'maps the %s orientation to a stable rendering attribute',
    (orientation) => {
      renderSeparator({ id: `sep-${orientation}`, orientation });
      expect(document.getElementById(`sep-${orientation}`)).toHaveAttribute(
        'data-orientation',
        orientation,
      );
    },
  );

  it('merges an optional host layout class without dropping the theme boundary', () => {
    renderSeparator({ className: 'host-slot', id: 'themed-sep' });
    const separator = document.getElementById('themed-sep');
    const boundary = separator?.parentElement;

    expect(separator).toHaveClass('ribbon-ui-separator', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderSeparator({ id: 'theme-sep' });
    const boundary = document.getElementById('theme-sep')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Separator id="theme-sep" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
