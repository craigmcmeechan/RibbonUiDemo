import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { TextArea } from './TextArea';
import type { TextAreaProps } from './TextArea.types';

function renderTextArea(props: TextAreaProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <TextArea {...props} />
    </RibbonThemeProvider>,
  );
}

function ControlledTextArea({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <RibbonThemeProvider themeId="modern-light">
      <label>
        Notes
        <TextArea
          id="controlled"
          onChange={(event) => {
            setValue(event.currentTarget.value);
            onChange?.(event.currentTarget.value);
          }}
          value={value}
        />
      </label>
    </RibbonThemeProvider>
  );
}

describe('TextArea', () => {
  it('renders native textarea semantics and schema defaults', () => {
    renderTextArea({ id: 'notes' });
    const field = screen.getByRole('textbox');

    expect(field.tagName).toBe('TEXTAREA');
    expect(field).toHaveAttribute('data-ribbon-ui-component', 'text-area');
    expect(field).toHaveAttribute('data-size', 'medium');
    expect(field).toHaveAttribute('data-resize', 'vertical');
    expect(field).toHaveAttribute('rows', '3');
    expect(field).toHaveValue('');
    expect(field).not.toBeDisabled();
  });

  it('renders placeholder, name, rows, cols, and controlled value', () => {
    renderTextArea({
      cols: 40,
      id: 'notes',
      name: 'notes',
      placeholder: 'Write here',
      rows: 5,
      value: 'Hello',
    });
    const field = screen.getByRole('textbox');

    expect(field).toHaveAttribute('placeholder', 'Write here');
    expect(field).toHaveAttribute('name', 'notes');
    expect(field).toHaveAttribute('rows', '5');
    expect(field).toHaveAttribute('cols', '40');
    expect(field).toHaveValue('Hello');
  });

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderTextArea({ id: `size-${size}`, size });
      expect(document.getElementById(`size-${size}`)).toHaveAttribute('data-size', size);
    },
  );

  it.each(['none', 'vertical', 'both'] as const)(
    'maps the %s resize axis to a stable rendering attribute',
    (resize) => {
      renderTextArea({ id: `resize-${resize}`, resize });
      expect(document.getElementById(`resize-${resize}`)).toHaveAttribute('data-resize', resize);
    },
  );

  it('reflects disabled, readonly, required, and maxLength configuration', () => {
    renderTextArea({
      disabled: true,
      id: 'locked',
      maxLength: 100,
      readonly: true,
      required: true,
    });
    const field = screen.getByRole('textbox');

    expect(field).toBeDisabled();
    expect(field).toHaveAttribute('readonly');
    expect(field).toHaveAttribute('required');
    expect(field).toHaveAttribute('maxlength', '100');
  });

  it('requests the next value through onChange when the user types (controlled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTextArea onChange={onChange} />);
    const field = screen.getByRole('textbox');

    await user.type(field, 'Hi');
    expect(onChange).toHaveBeenLastCalledWith('Hi');
    expect(field).toHaveValue('Hi');
  });

  it('associates external description and label content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <label id="notes-label" htmlFor="notes">
          Notes
        </label>
        <TextArea ariaDescribedBy="notes-help" ariaLabelledBy="notes-label" id="notes" />
        <p id="notes-help">Your notes.</p>
      </RibbonThemeProvider>,
    );
    const field = screen.getByRole('textbox');

    expect(field).toHaveAccessibleDescription('Your notes.');
    expect(field).toHaveAccessibleName('Notes');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderTextArea({ id: 'theme-area' });
    const boundary = document.getElementById('theme-area')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <TextArea id="theme-area" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
