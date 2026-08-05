import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { ToggleButton } from './ToggleButton';
import type { ToggleButtonProps } from './ToggleButton.types';

function renderToggleButton(props: ToggleButtonProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <ToggleButton {...props} />
    </RibbonThemeProvider>,
  );
}

describe('ToggleButton', () => {
  it('renders native semantics, schema defaults, an accessible name, and the controlled pressed state', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <p id="bold-help">Toggles bold formatting.</p>
        <ToggleButton ariaDescribedBy="bold-help" id="bold" label="Bold" pressed />
      </RibbonThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'neutral');
    expect(button).toHaveAttribute('data-size', 'medium');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAccessibleDescription('Toggles bold formatting.');
  });

  it('renders a false pressed state as aria-pressed=false', () => {
    renderToggleButton({ id: 'italic', label: 'Italic', pressed: false });
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'false');
  });

  it.each([
    ['neutral', 'small'],
    ['neutral', 'large'],
    ['primary', 'small'],
    ['primary', 'medium'],
    ['primary', 'large'],
  ] as const)('maps %s/%s configuration to stable rendering attributes', (variant, size) => {
    renderToggleButton({ id: `${variant}-${size}`, label: 'Toggle', pressed: true, size, variant });

    const button = screen.getByRole('button', { name: 'Toggle' });
    expect(button).toHaveAttribute('data-variant', variant);
    expect(button).toHaveAttribute('data-size', size);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports pointer, Enter, and Space activation through native button behavior', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    renderToggleButton({ id: 'activate', label: 'Activate', onPress, pressed: false });
    const button = screen.getByRole('button', { name: 'Activate' });

    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(button).toHaveFocus();
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('does not own pressed state: activation requests the host without flipping locally', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { rerender } = renderToggleButton({
      id: 'underline',
      label: 'Underline',
      onPress,
      pressed: false,
    });
    const button = screen.getByRole('button', { name: 'Underline' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(onPress).toHaveBeenCalledOnce();
    // The host owns the value; the component keeps rendering the last pressed prop until the host updates it.
    expect(button).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <RibbonThemeProvider themeId="modern-light">
        <ToggleButton id="underline" label="Underline" onPress={onPress} pressed />
      </RibbonThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Underline' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('uses native disabled behavior and removes the control from sequential focus', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    renderToggleButton({
      disabled: true,
      id: 'disabled',
      label: 'Unavailable',
      onPress,
      pressed: true,
    });
    const button = screen.getByRole('button', { name: 'Unavailable' });

    await user.click(button);
    await user.tab();
    expect(button).toBeDisabled();
    expect(button).not.toHaveFocus();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(onPress).not.toHaveBeenCalled();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderToggleButton({
      className: 'host-slot',
      id: 'themed',
      label: 'Theme toggle',
      pressed: true,
    });
    const button = screen.getByRole('button', { name: 'Theme toggle' });
    const boundary = button.parentElement;
    expect(button).toHaveClass('ribbon-ui-toggle-button', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <ToggleButton className="host-slot" id="themed" label="Theme toggle" pressed />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
