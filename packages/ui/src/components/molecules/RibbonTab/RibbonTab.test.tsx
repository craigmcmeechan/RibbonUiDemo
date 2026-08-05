import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { RibbonTab } from './RibbonTab';

function renderTab(active: boolean, onSelect = vi.fn()) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <RibbonTab
        active={active}
        ariaControls="home-panel"
        id="home"
        label="Home"
        onSelect={onSelect}
      />
    </RibbonThemeProvider>,
  );
}

describe('RibbonTab', () => {
  it('renders a tab button with the controlled aria-selected state', () => {
    renderTab(true);
    const tab = screen.getByRole('tab', { name: 'Home', selected: true });

    expect(tab).toHaveAttribute('data-ribbon-ui-component', 'ribbon-tab');
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', 'home-panel');
    expect(tab).toHaveAttribute('data-active', 'true');
  });

  it('renders an inactive tab', () => {
    renderTab(false);
    expect(screen.getByRole('tab', { name: 'Home', selected: false })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('requests selection through onSelect on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderTab(false, onSelect);
    await user.click(screen.getByRole('tab', { name: 'Home' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderTab(true);
    const tab = screen.getByRole('tab', { name: 'Home' });
    expect(tab.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <RibbonTab active id="home" label="Home" />
      </RibbonThemeProvider>,
    );
    expect(tab.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
