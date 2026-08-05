import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Listbox } from './Listbox';
import { Option } from '../Option';

function renderListbox(overrides: Partial<Parameters<typeof Listbox>[0]> = {}) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Listbox id="fruits" label="Fruits" onSelect={vi.fn()} value="apple" {...overrides}>
        <Option id="apple" label="Apple" value="apple" />
        <Option disabled id="banana" label="Banana" value="banana" />
        <Option id="cherry" label="Cherry" value="cherry" />
      </Listbox>
    </RibbonThemeProvider>,
  );
}

describe('Listbox', () => {
  it('renders a listbox with options and reflects the controlled selected value', () => {
    renderListbox();
    const listbox = screen.getByRole('listbox', { name: 'Fruits' });

    expect(listbox).toHaveAttribute('data-ribbon-ui-component', 'listbox');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('focuses the selected option on focus entry', () => {
    renderListbox();
    screen.getByRole('listbox', { name: 'Fruits' }).focus();
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus();
  });

  it('moves focus and selects with ArrowDown, skipping disabled options', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderListbox({ onSelect, value: 'apple' });
    screen.getByRole('listbox', { name: 'Fruits' }).focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('cherry');
  });

  it('moves focus and selects with Home and End', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderListbox({ onSelect, value: 'cherry' });
    screen.getByRole('listbox', { name: 'Fruits' }).focus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('apple');

    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith('cherry');
  });

  it('selects on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderListbox({ onSelect, value: 'apple' });
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onSelect).toHaveBeenCalledWith('cherry');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderListbox();
    const listbox = screen.getByRole('listbox', { name: 'Fruits' });
    expect(listbox.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Listbox id="fruits" label="Fruits" value="apple">
          <Option id="apple" label="Apple" value="apple" />
        </Listbox>
      </RibbonThemeProvider>,
    );
    expect(listbox.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
