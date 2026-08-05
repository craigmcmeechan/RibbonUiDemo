import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Listbox } from '../Listbox';
import { Option } from './Option';

describe('Option', () => {
  it('renders an option with value and reflects selection from the listbox context', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Listbox id="fruits" label="Fruits" value="apple">
          <Option id="apple" label="Apple" value="apple" />
          <Option id="cherry" label="Cherry" value="cherry" />
        </Listbox>
      </RibbonThemeProvider>,
    );
    const apple = screen.getByRole('option', { name: 'Apple' });

    expect(apple).toHaveAttribute('data-ribbon-ui-component', 'option');
    expect(apple).toHaveAttribute('data-option-value', 'apple');
    expect(apple).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('is not selectable when disabled', () => {
    const { rerender } = render(
      <RibbonThemeProvider themeId="modern-light">
        <Listbox id="fruits" label="Fruits" onSelect={vi.fn()} value="">
          <Option disabled id="banana" label="Banana" value="banana" />
        </Listbox>
      </RibbonThemeProvider>,
    );
    const banana = screen.getByRole('option', { name: 'Banana' });
    expect(banana).toHaveAttribute('aria-disabled', 'true');
    expect(banana).toHaveAttribute('aria-selected', 'false');

    const onSelect = vi.fn();
    rerender(
      <RibbonThemeProvider themeId="modern-light">
        <Listbox id="fruits" label="Fruits" onSelect={onSelect} value="">
          <Option disabled id="banana" label="Banana" value="banana" />
        </Listbox>
      </RibbonThemeProvider>,
    );
    screen.getByRole('option', { name: 'Banana' }).click();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
