import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { TextInput } from './TextInput';
import type { TextInputProps } from './TextInput.types';

function renderTextInput(props: TextInputProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <TextInput {...props} />
    </RibbonThemeProvider>,
  );
}

function ControlledInput({
  initial = '',
  onChange,
}: {
  initial?: string;
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <RibbonThemeProvider themeId="modern-light">
      <TextInput
        id="controlled"
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event.currentTarget.value);
        }}
        value={value}
      />
    </RibbonThemeProvider>
  );
}

describe('TextInput', () => {
  it('renders native input semantics and schema defaults', () => {
    renderTextInput({ id: 'name' });
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-ribbon-ui-component', 'text-input');
    expect(input).toHaveAttribute('data-size', 'medium');
    expect(input).toHaveValue('');
    expect(input).not.toBeDisabled();
    expect(input).not.toHaveAttribute('required');
    expect(input).not.toHaveAttribute('readonly');
  });

  it('renders a placeholder, name, and controlled value', () => {
    renderTextInput({ id: 'name', name: 'fullName', placeholder: 'Enter name', value: 'Ada' });
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('placeholder', 'Enter name');
    expect(input).toHaveAttribute('name', 'fullName');
    expect(input).toHaveValue('Ada');
  });

  it.each(['text', 'email', 'password', 'search', 'url'] as const)(
    'maps the %s input type to the native type attribute',
    (inputType) => {
      renderTextInput({ id: `field-${inputType}`, inputType });
      const input = document.getElementById(`field-${inputType}`);
      expect(input).toHaveAttribute('type', inputType);
    },
  );

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderTextInput({ id: `size-${size}`, size });
      expect(document.getElementById(`size-${size}`)).toHaveAttribute('data-size', size);
    },
  );

  it('reflects disabled, readonly, required, and maxLength configuration', () => {
    renderTextInput({
      disabled: true,
      id: 'locked',
      maxLength: 10,
      readonly: true,
      required: true,
    });
    const input = screen.getByRole('textbox');

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('maxlength', '10');
  });

  it('requests the next value through onChange when the user types (controlled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'Hi');
    expect(onChange).toHaveBeenLastCalledWith('Hi');
    expect(input).toHaveValue('Hi');
  });

  it('reports focus and blur through runtime callbacks', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    renderTextInput({ id: 'focus', onBlur, onFocus });
    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(onFocus).toHaveBeenCalledOnce();
    await user.tab();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('associates external description and label content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <label id="name-label" htmlFor="name">
          Name
        </label>
        <TextInput ariaDescribedBy="name-help" ariaLabelledBy="name-label" id="name" />
        <p id="name-help">Your full name.</p>
      </RibbonThemeProvider>,
    );
    const input = screen.getByRole('textbox');

    expect(input).toHaveAccessibleDescription('Your full name.');
    expect(input).toHaveAccessibleName('Name');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderTextInput({ id: 'theme-input' });
    const boundary = document.getElementById('theme-input')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <TextInput id="theme-input" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
