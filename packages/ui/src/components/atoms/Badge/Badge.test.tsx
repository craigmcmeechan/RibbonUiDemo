import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge.types';

function renderBadge(props: BadgeProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Badge {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Badge', () => {
  it('renders a visible text pill with schema defaults and no redundant role', () => {
    renderBadge({ id: 'count', label: '3 new' });
    const badge = document.getElementById('count');

    expect(badge?.tagName).toBe('SPAN');
    expect(badge).toHaveTextContent('3 new');
    expect(badge).toHaveAttribute('data-ribbon-ui-component', 'badge');
    expect(badge).toHaveAttribute('data-tone', 'neutral');
    expect(badge).not.toHaveAttribute('role');
  });

  it.each(['neutral', 'primary'] as const)(
    'maps the %s tone to a stable rendering attribute',
    (tone) => {
      renderBadge({ id: `badge-${tone}`, label: 'Badge', tone });
      expect(document.getElementById(`badge-${tone}`)).toHaveAttribute('data-tone', tone);
    },
  );

  it('merges an optional host layout class without dropping the theme boundary', () => {
    renderBadge({ className: 'host-slot', id: 'themed-badge', label: 'New' });
    const badge = document.getElementById('themed-badge');
    const boundary = badge?.parentElement;

    expect(badge).toHaveClass('ribbon-ui-badge', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderBadge({ id: 'theme-badge', label: 'New', tone: 'primary' });
    const boundary = document.getElementById('theme-badge')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Badge id="theme-badge" label="New" tone="primary" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
