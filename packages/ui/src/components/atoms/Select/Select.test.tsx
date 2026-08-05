import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Select } from './Select';
import type { SelectConfig, SelectProps } from './Select.types';

const fruits: SelectConfig['options'] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

function renderSelect(props: SelectProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Select {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Select', () => {
  it('renders native select semantics, options, and the controlled value', () => {
    renderSelect({ id: 'fruit', options: fruits, value: 'banana' });
    const select = screen.getByRole('combobox');

    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('data-ribbon-ui-component', 'select');
    expect(select).toHaveAttribute('data-size', 'medium');
    expect(select).toHaveValue('banana');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('value', 'apple');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('value', 'banana');
  });

  it('renders a disabled placeholder option with an empty value', () => {
    renderSelect({ id: 'fruit', options: fruits, placeholder: 'Choose...', value: '' });
    const placeholder = screen.getByRole('option', { name: 'Choose...' });

    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderSelect({ id: `size-${size}`, options: fruits, size });
      expect(screen.getByRole('combobox')).toHaveAttribute('data-size', size);
    },
  );

  it('requests the next value through onChange when the host updates (controlled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function ControlledSelect() {
      const [value, setValue] = useState('apple');
      return (
        <RibbonThemeProvider themeId="modern-light">
          <label>
            Fruit
            <Select
              id="controlled-fruit"
              onChange={(event) => {
                setValue(event.currentTarget.value);
                onChange(event.currentTarget.value);
              }}
              options={fruits}
              value={value}
            />
          </label>
        </RibbonThemeProvider>
      );
    }
    render(<ControlledSelect />);
    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'banana');
    expect(onChange).toHaveBeenLastCalledWith('banana');
    expect(select).toHaveValue('banana');
  });

  it('reflects disabled, required, and name configuration', () => {
    renderSelect({
      disabled: true,
      id: 'locked',
      name: 'locked',
      options: fruits,
      required: true,
      value: 'apple',
    });
    const select = screen.getByRole('combobox');

    expect(select).toBeDisabled();
    expect(select).toHaveAttribute('required');
    expect(select).toHaveAttribute('name', 'locked');
  });

  it('associates external description and label content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <label id="fruit-label" htmlFor="fruit">
          Fruit
        </label>
        <Select
          ariaDescribedBy="fruit-help"
          ariaLabelledBy="fruit-label"
          id="fruit"
          options={fruits}
        />
        <p id="fruit-help">Pick a fruit.</p>
      </RibbonThemeProvider>,
    );
    const select = screen.getByRole('combobox');

    expect(select).toHaveAccessibleName('Fruit');
    expect(select).toHaveAccessibleDescription('Pick a fruit.');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderSelect({ id: 'theme-select', options: fruits });
    const boundary = screen.getByRole('combobox').parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Select id="theme-select" options={fruits} />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
