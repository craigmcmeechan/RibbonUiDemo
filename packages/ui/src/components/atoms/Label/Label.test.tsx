import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Label } from './Label';
import type { LabelProps } from './Label.types';

function renderLabel(props: LabelProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Label {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Label', () => {
  it('renders a generic span label with schema defaults and visible text', () => {
    renderLabel({ id: 'group-label', text: 'Clipboard' });
    const label = document.getElementById('group-label');

    expect(label).not.toBeNull();
    expect(label?.tagName).toBe('SPAN');
    expect(label).toHaveTextContent('Clipboard');
    expect(label).toHaveAttribute('data-ribbon-ui-component', 'label');
    expect(label).toHaveAttribute('data-variant', 'default');
    expect(label).not.toHaveAttribute('for');
  });

  it.each(['default', 'strong'] as const)(
    'maps the %s variant to a stable rendering attribute',
    (variant) => {
      renderLabel({ id: `label-${variant}`, text: 'Label', variant });
      expect(document.getElementById(`label-${variant}`)).toHaveAttribute('data-variant', variant);
    },
  );

  it('upgrades to a form label associated with the target control when htmlFor is provided', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <input id="first-name" type="text" />
        <Label htmlFor="first-name" id="first-name-label" text="First name" />
      </RibbonThemeProvider>,
    );
    const label = document.getElementById('first-name-label');

    expect(label?.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'first-name');
    expect(label).toHaveTextContent('First name');
  });

  it('merges an optional host layout class without dropping the theme boundary', () => {
    renderLabel({ className: 'host-slot', id: 'themed-label', text: 'Themed' });
    const label = document.getElementById('themed-label');
    const boundary = label?.parentElement;

    expect(label).toHaveClass('ribbon-ui-label', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderLabel({ id: 'theme-label', text: 'Theme' });
    const boundary = document.getElementById('theme-label')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Label id="theme-label" text="Theme" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
