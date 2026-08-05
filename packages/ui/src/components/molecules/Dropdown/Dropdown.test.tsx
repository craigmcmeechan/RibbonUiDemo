import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Dropdown } from './Dropdown';
import { MenuItem } from '../MenuItem';

const defaultChildren = (
  <>
    <MenuItem id="undo" label="Undo" onSelect={vi.fn()} />
    <MenuItem disabled id="redo" label="Redo" />
  </>
);

function renderDropdown(overrides: Partial<Parameters<typeof Dropdown>[0]> = {}) {
  const { children = defaultChildren, ...rest } = overrides;
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Dropdown id="edit" label="Edit" {...rest}>
        {children}
      </Dropdown>
    </RibbonThemeProvider>,
  );
}

describe('Dropdown', () => {
  it('renders a trigger with menu semantics and no open menu by default', () => {
    renderDropdown();
    const trigger = screen.getByRole('button', { name: /Edit/ });

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-ribbon-ui-component="menu"]')).toBeNull();
  });

  it('opens the menu on trigger click and closes on item activation', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderDropdown({ children: <MenuItem id="undo" label="Undo" onSelect={onSelect} /> });
    const trigger = screen.getByRole('button', { name: /Edit/ });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = document.querySelector('[data-ribbon-ui-component="menu"]');
    expect(menu).not.toBeNull();

    await user.click(screen.getByRole('menuitem', { name: /Undo/ }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const trigger = screen.getByRole('button', { name: /Edit/ });

    await user.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside pointer interaction', async () => {
    const user = userEvent.setup();
    renderDropdown();
    const trigger = screen.getByRole('button', { name: /Edit/ });

    await user.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    renderDropdown({ disabled: true });
    const trigger = screen.getByRole('button', { name: /Edit/ });

    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-ribbon-ui-component="menu"]')).toBeNull();
  });

  it('returns focus to the trigger after closing from item activation', async () => {
    const user = userEvent.setup();
    renderDropdown({ children: <MenuItem id="undo" label="Undo" onSelect={vi.fn()} /> });
    const trigger = screen.getByRole('button', { name: /Edit/ });

    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: /Undo/ }));
    expect(trigger).toHaveFocus();
  });
});
