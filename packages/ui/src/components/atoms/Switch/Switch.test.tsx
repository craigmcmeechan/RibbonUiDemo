import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Switch } from './Switch';
import type { SwitchProps } from './Switch.types';

function renderSwitch(props: SwitchProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Switch {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Switch', () => {
  it('renders a switch control with role=switch, the controlled state, and a visible label', () => {
    renderSwitch({ checked: false, id: 'night', label: 'Night mode' });
    const control = screen.getByRole('switch', { name: 'Night mode' });

    expect(control.tagName).toBe('BUTTON');
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control).toHaveAttribute('data-checked', 'false');
    expect(control.closest('[data-ribbon-ui-component="switch"]')).toHaveAttribute(
      'data-size',
      'medium',
    );
  });

  it('renders a true controlled checked state', () => {
    renderSwitch({ checked: true, id: 'on', label: 'On' });
    expect(screen.getByRole('switch', { name: 'On' })).toHaveAttribute('aria-checked', 'true');
  });

  it('requests the next checked value through onChange on click without owning state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch({ checked: false, id: 'toggle', label: 'Toggle', onChange });
    const control = screen.getByRole('switch', { name: 'Toggle' });

    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(control).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles through Space and Enter via native button behavior', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch({ checked: true, id: 'key', label: 'Key', onChange });
    const control = screen.getByRole('switch', { name: 'Key' });

    control.focus();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderSwitch({ checked: true, id: `size-${size}`, label: 'Size', size });
      expect(
        screen.getByRole('switch', { name: 'Size' }).closest('[data-ribbon-ui-component="switch"]'),
      ).toHaveAttribute('data-size', size);
    },
  );

  it('uses native disabled behavior and removes the control from sequential focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch({ checked: true, disabled: true, id: 'locked', label: 'Locked', onChange });
    const control = screen.getByRole('switch', { name: 'Locked' });

    expect(control).toBeDisabled();
    await user.click(control);
    await user.tab();
    expect(control).not.toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('associates external description content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <p id="night-help">Switch the dark theme.</p>
        <Switch ariaDescribedBy="night-help" checked={false} id="night" label="Night mode" />
      </RibbonThemeProvider>,
    );
    expect(screen.getByRole('switch', { name: 'Night mode' })).toHaveAccessibleDescription(
      'Switch the dark theme.',
    );
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderSwitch({ checked: true, id: 'theme-switch', label: 'Theme' });
    const boundary = screen
      .getByRole('switch', { name: 'Theme' })
      .closest('[data-ribbon-ui-component="switch"]')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Switch checked id="theme-switch" label="Theme" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
