import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Checkbox } from './Checkbox';
import type { CheckboxProps } from './Checkbox.types';

function renderCheckbox(props: CheckboxProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Checkbox {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Checkbox', () => {
  it('renders a labeled native checkbox with the controlled checked state', () => {
    renderCheckbox({ checked: false, id: 'agree', label: 'I agree' });
    const checkbox = screen.getByRole('checkbox', { name: 'I agree' });

    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox).not.toBeChecked();
    expect(checkbox.closest('label')).toHaveAttribute('data-ribbon-ui-component', 'checkbox');
  });

  it('renders a true controlled checked state', () => {
    renderCheckbox({ checked: true, id: 'on', label: 'Enabled' });
    expect(screen.getByRole('checkbox', { name: 'Enabled' })).toBeChecked();
  });

  it('requests the next checked value through onChange on click without owning state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCheckbox({ checked: false, id: 'toggle', label: 'Toggle', onChange });
    const checkbox = screen.getByRole('checkbox', { name: 'Toggle' });

    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledOnce();
    // Host owns the value; the component keeps rendering the last checked prop.
    expect(checkbox).not.toBeChecked();
  });

  it('toggles through Space activation via native checkbox behavior', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCheckbox({ checked: false, id: 'space', label: 'Space toggle', onChange });
    const checkbox = screen.getByRole('checkbox', { name: 'Space toggle' });

    checkbox.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('reflects disabled, required, and name configuration', () => {
    renderCheckbox({
      checked: true,
      disabled: true,
      id: 'locked',
      label: 'Locked',
      name: 'locked',
      required: true,
    });
    const checkbox = screen.getByRole('checkbox', { name: 'Locked' });

    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute('required');
    expect(checkbox).toHaveAttribute('name', 'locked');
    expect(checkbox.closest('label')).toHaveAttribute('data-disabled', 'true');
  });

  it('associates external description content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <p id="agree-help">Required to continue.</p>
        <Checkbox ariaDescribedBy="agree-help" checked={false} id="agree" label="I agree" />
      </RibbonThemeProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'I agree' })).toHaveAccessibleDescription(
      'Required to continue.',
    );
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderCheckbox({ checked: true, id: 'theme-box', label: 'Theme' });
    const boundary = screen
      .getByRole('checkbox', { name: 'Theme' })
      .closest('label')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Checkbox checked id="theme-box" label="Theme" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
