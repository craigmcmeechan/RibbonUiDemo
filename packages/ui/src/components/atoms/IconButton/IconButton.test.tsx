import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { IconButton } from './IconButton';
import type { IconButtonProps } from './IconButton.types';

function renderIconButton(props: IconButtonProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <IconButton {...props} />
    </RibbonThemeProvider>,
  );
}

describe('IconButton', () => {
  it('renders native semantics, schema defaults, an accessible name, and host description', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <p id="save-help">Stores the current record.</p>
        <IconButton ariaDescribedBy="save-help" icon="save" id="save" label="Save" />
      </RibbonThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'neutral');
    expect(button).toHaveAttribute('data-size', 'medium');
    expect(button).toHaveAccessibleDescription('Stores the current record.');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['save', 'undo', 'redo', 'search', 'close', 'more'] as const)(
    'maps the allowlisted %s icon to deterministic SVG rendering',
    (icon) => {
      renderIconButton({ icon, id: `icon-${icon}`, label: `${icon} action` });

      expect(
        screen.getByRole('button', { name: `${icon} action` }).querySelector('svg'),
      ).toHaveAttribute('data-icon', icon);
    },
  );

  it.each([
    ['neutral', 'small'],
    ['neutral', 'large'],
    ['primary', 'small'],
    ['primary', 'medium'],
    ['primary', 'large'],
  ] as const)('maps %s/%s configuration to stable rendering attributes', (variant, size) => {
    renderIconButton({ icon: 'save', id: `${variant}-${size}`, label: 'Action', size, variant });

    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toHaveAttribute('data-variant', variant);
    expect(button).toHaveAttribute('data-size', size);
  });

  it('supports pointer, Enter, and Space activation through native button behavior', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    renderIconButton({ icon: 'save', id: 'activate', label: 'Activate', onPress });
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
    renderIconButton({
      disabled: true,
      icon: 'close',
      id: 'disabled',
      label: 'Unavailable',
      onPress,
    });
    const button = screen.getByRole('button', { name: 'Unavailable' });

    await user.click(button);
    await user.tab();
    expect(button).toBeDisabled();
    expect(button).not.toHaveFocus();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderIconButton({
      className: 'host-slot',
      icon: 'more',
      id: 'themed',
      label: 'More actions',
    });
    const button = screen.getByRole('button', { name: 'More actions' });
    const boundary = button.parentElement;
    expect(button).toHaveClass('ribbon-ui-icon-button', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <IconButton className="host-slot" icon="more" id="themed" label="More actions" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
