import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Slider } from './Slider';
import type { SliderProps } from './Slider.types';

function renderSlider(props: SliderProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Slider {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Slider', () => {
  it('renders native range input semantics and schema defaults', () => {
    renderSlider({ id: 'vol' });
    const slider = screen.getByRole('slider');

    expect(slider.tagName).toBe('INPUT');
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveAttribute('data-ribbon-ui-component', 'slider');
    expect(slider).toHaveAttribute('data-size', 'medium');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveAttribute('step', '1');
    expect(slider).toHaveValue('0');
  });

  it('renders a controlled value, min, max, and step', () => {
    renderSlider({ id: 'vol', max: 50, min: 10, step: 5, value: 25 });
    const slider = screen.getByRole('slider');

    expect(slider).toHaveValue('25');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '50');
    expect(slider).toHaveAttribute('step', '5');
  });

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderSlider({ id: `size-${size}`, size });
      expect(screen.getByRole('slider')).toHaveAttribute('data-size', size);
    },
  );

  it('requests the next value through onChange when the host updates (controlled)', async () => {
    const onChange = vi.fn();
    function ControlledSlider() {
      const [value, setValue] = useState(40);
      return (
        <RibbonThemeProvider themeId="modern-light">
          <label>
            Volume
            <Slider
              id="controlled-vol"
              onChange={(event) => {
                setValue(Number(event.currentTarget.value));
                onChange(event.currentTarget.value);
              }}
              value={value}
            />
          </label>
        </RibbonThemeProvider>
      );
    }
    render(<ControlledSlider />);
    const slider = screen.getByRole('slider');

    slider.focus();
    fireEvent.change(slider, { target: { value: '41' } });
    expect(onChange).toHaveBeenCalledWith('41');
    expect(slider).toHaveValue('41');
  });

  it('reflects disabled and name configuration', () => {
    renderSlider({ disabled: true, id: 'locked', name: 'locked', value: 5 });
    const slider = screen.getByRole('slider');

    expect(slider).toBeDisabled();
    expect(slider).toHaveAttribute('name', 'locked');
  });

  it('associates external description and label content through ARIA', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <label id="vol-label" htmlFor="vol">
          Volume
        </label>
        <Slider ariaDescribedBy="vol-help" ariaLabelledBy="vol-label" id="vol" />
        <p id="vol-help">Set the volume.</p>
      </RibbonThemeProvider>,
    );
    const slider = screen.getByRole('slider');

    expect(slider).toHaveAccessibleName('Volume');
    expect(slider).toHaveAccessibleDescription('Set the volume.');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderSlider({ id: 'theme-slider' });
    const boundary = screen.getByRole('slider').parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Slider id="theme-slider" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
