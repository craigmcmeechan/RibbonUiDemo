import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Radio } from './Radio';
import type { RadioProps } from './Radio.types';

function renderRadio(props: RadioProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Radio {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Radio', () => {
  it('renders a labeled native radio with the controlled checked state and value', () => {
    renderRadio({ checked: false, id: 'a', label: 'Option A', name: 'group', value: 'a' });
    const radio = screen.getByRole('radio', { name: 'Option A' });

    expect(radio.tagName).toBe('INPUT');
    expect(radio).toHaveAttribute('type', 'radio');
    expect(radio).toHaveAttribute('name', 'group');
    expect(radio).toHaveAttribute('value', 'a');
    expect(radio).not.toBeChecked();
    expect(radio.closest('label')).toHaveAttribute('data-ribbon-ui-component', 'radio');
  });

  it('renders a true controlled checked state', () => {
    renderRadio({ checked: true, id: 'b', label: 'Option B', name: 'group', value: 'b' });
    expect(screen.getByRole('radio', { name: 'Option B' })).toBeChecked();
  });

  it('requests the next state through onChange on click without owning state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderRadio({
      checked: false,
      id: 'c',
      label: 'Option C',
      name: 'group',
      onChange,
      value: 'c',
    });
    const radio = screen.getByRole('radio', { name: 'Option C' });

    await user.click(radio);
    expect(onChange).toHaveBeenCalledOnce();
    expect(radio).not.toBeChecked();
  });

  it('selects through Space activation via native radio behavior', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderRadio({
      checked: false,
      id: 'd',
      label: 'Option D',
      name: 'group',
      onChange,
      value: 'd',
    });
    const radio = screen.getByRole('radio', { name: 'Option D' });

    radio.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('reflects disabled and required configuration', () => {
    renderRadio({
      checked: true,
      disabled: true,
      id: 'locked',
      label: 'Locked',
      name: 'group',
      required: true,
      value: 'locked',
    });
    const radio = screen.getByRole('radio', { name: 'Locked' });

    expect(radio).toBeDisabled();
    expect(radio).toHaveAttribute('required');
    expect(radio.closest('label')).toHaveAttribute('data-disabled', 'true');
  });

  it('associates external description content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <p id="a-help">Choose one option.</p>
        <Radio
          ariaDescribedBy="a-help"
          checked={false}
          id="a"
          label="Option A"
          name="group"
          value="a"
        />
      </RibbonThemeProvider>,
    );
    expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAccessibleDescription(
      'Choose one option.',
    );
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderRadio({
      checked: true,
      id: 'theme-radio',
      label: 'Theme',
      name: 'g',
      value: 't',
    });
    const boundary = screen.getByRole('radio', { name: 'Theme' }).closest('label')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Radio checked id="theme-radio" label="Theme" name="g" value="t" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
