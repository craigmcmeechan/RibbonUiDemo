import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Button } from './Button';
import type { ButtonProps } from './Button.types';

function renderButton(props: ButtonProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Button {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Button', () => {
  it('renders native semantics, schema defaults, an accessible name, and host description', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <p id="save-help">Stores the current record.</p>
        <Button ariaDescribedBy="save-help" id="save" label="Save" />
      </RibbonThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'neutral');
    expect(button).toHaveAttribute('data-size', 'medium');
    expect(button).toHaveAccessibleDescription('Stores the current record.');
  });

  it.each([
    ['neutral', 'small'],
    ['neutral', 'large'],
    ['primary', 'small'],
    ['primary', 'medium'],
    ['primary', 'large'],
  ] as const)('maps %s/%s configuration to stable rendering attributes', (variant, size) => {
    renderButton({ id: `${variant}-${size}`, label: 'Action', size, variant });

    expect(screen.getByRole('button', { name: 'Action' })).toHaveAttribute('data-variant', variant);
    expect(screen.getByRole('button', { name: 'Action' })).toHaveAttribute('data-size', size);
  });

  it('supports pointer, Enter, and Space activation through native button behavior', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    renderButton({ id: 'activate', label: 'Activate', onPress });
    const button = screen.getByRole('button', { name: 'Activate' });

    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(button).toHaveFocus();
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('uses native disabled behavior and removes the control from sequential focus', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    renderButton({ disabled: true, id: 'disabled', label: 'Unavailable', onPress });
    const button = screen.getByRole('button', { name: 'Unavailable' });

    await user.click(button);
    await user.tab();
    expect(button).toBeDisabled();
    expect(button).not.toHaveFocus();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderButton({ className: 'host-slot', id: 'themed', label: 'Themed' });
    const button = screen.getByRole('button', { name: 'Themed' });
    const boundary = button.parentElement;
    expect(button).toHaveClass('ribbon-ui-button', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Button className="host-slot" id="themed" label="Themed" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
