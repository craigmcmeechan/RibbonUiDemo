import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Menu } from '../Menu';
import { MenuItem } from './MenuItem';

describe('MenuItem', () => {
  it('renders a menuitem with label and shortcut', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="m" label="M">
          <MenuItem id="save" label="Save" shortcut="Ctrl+S" />
        </Menu>
      </RibbonThemeProvider>,
    );
    const item = screen.getByRole('menuitem', { name: /Save/ });

    expect(item).toHaveAttribute('data-ribbon-ui-component', 'menu-item');
    expect(item).toHaveTextContent('Save');
    expect(item).toHaveTextContent('Ctrl+S');
    expect(item).toHaveAttribute('tabindex', '-1');
  });

  it('activates and requests close on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="m" label="M" onClose={onClose}>
          <MenuItem id="save" label="Save" onSelect={onSelect} />
        </Menu>
      </RibbonThemeProvider>,
    );
    await user.click(screen.getByRole('menuitem', { name: /Save/ }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('activates and requests close on Enter and Space', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="m" label="M" onClose={onClose}>
          <MenuItem id="save" label="Save" onSelect={onSelect} />
        </Menu>
      </RibbonThemeProvider>,
    );
    const item = screen.getByRole('menuitem', { name: /Save/ });
    item.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledOnce();

    const onClose2 = vi.fn();
    const onSelect2 = vi.fn();
    const { rerender } = render(
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="m2" label="M" onClose={onClose2}>
          <MenuItem id="open" label="Open" onSelect={onSelect2} />
        </Menu>
      </RibbonThemeProvider>,
    );
    rerender(
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="m2" label="M" onClose={onClose2}>
          <MenuItem id="open" label="Open" onSelect={onSelect2} />
        </Menu>
      </RibbonThemeProvider>,
    );
    const open = screen.getByRole('menuitem', { name: /Open/ });
    open.focus();
    await user.keyboard(' ');
    expect(onSelect2).toHaveBeenCalledOnce();
    expect(onClose2).toHaveBeenCalledOnce();
  });

  it('is not activatable when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="m" label="M">
          <MenuItem disabled id="redo" label="Redo" onSelect={onSelect} />
        </Menu>
      </RibbonThemeProvider>,
    );
    await user.click(screen.getByRole('menuitem', { name: /Redo/ }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: /Redo/ })).toHaveAttribute('aria-disabled', 'true');
  });
});
