import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Menu } from './Menu';
import { MenuItem } from '../MenuItem';

function renderMenu(onClose = vi.fn()) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Menu id="edit-menu" label="Edit" onClose={onClose}>
        <MenuItem id="undo" label="Undo" onSelect={vi.fn()} shortcut="Ctrl+Z" />
        <MenuItem disabled id="redo" label="Redo" shortcut="Ctrl+Y" />
        <MenuItem id="cut" label="Cut" onSelect={vi.fn()} />
      </Menu>
    </RibbonThemeProvider>,
  );
}

describe('Menu', () => {
  it('renders a labelled menu with menu-item children', () => {
    renderMenu();
    const menu = screen.getByRole('menu', { name: 'Edit' });

    expect(menu).toHaveAttribute('data-ribbon-ui-component', 'menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: /Undo/ })).toHaveAttribute(
      'data-disabled',
      'false',
    );
    expect(screen.getByRole('menuitem', { name: /Redo/ })).toHaveAttribute('data-disabled', 'true');
  });

  it('focuses the first enabled item when the menu receives focus', () => {
    renderMenu();
    const menu = screen.getByRole('menu', { name: 'Edit' });
    menu.focus();
    expect(screen.getByRole('menuitem', { name: /Undo/ })).toHaveFocus();
  });

  it('moves focus with ArrowDown/ArrowUp and skips disabled items', async () => {
    const user = userEvent.setup();
    renderMenu();
    const menu = screen.getByRole('menu', { name: 'Edit' });
    menu.focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: /Undo/ })).toHaveFocus();
  });

  it('jumps to first and last with Home and End', async () => {
    const user = userEvent.setup();
    renderMenu();
    const menu = screen.getByRole('menu', { name: 'Edit' });
    menu.focus();

    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: /Undo/ })).toHaveFocus();
  });

  it('requests close on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderMenu(onClose);
    const menu = screen.getByRole('menu', { name: 'Edit' });
    menu.focus();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderMenu();
    const menu = screen.getByRole('menu', { name: 'Edit' });
    expect(menu.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Menu id="edit-menu" label="Edit" onClose={vi.fn()}>
          <MenuItem id="undo" label="Undo" />
        </Menu>
      </RibbonThemeProvider>,
    );
    expect(menu.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
