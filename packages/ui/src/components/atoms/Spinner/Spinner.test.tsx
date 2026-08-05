import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Spinner } from './Spinner';
import type { SpinnerProps } from './Spinner.types';

function renderSpinner(props: SpinnerProps) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Spinner {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Spinner', () => {
  it('renders a decorative ring hidden from assistive technology by default', () => {
    renderSpinner({ id: 'load' });
    const spinner = document.getElementById('load');

    expect(spinner?.tagName).toBe('SPAN');
    expect(spinner).toHaveAttribute('data-ribbon-ui-component', 'spinner');
    expect(spinner).toHaveAttribute('data-size', 'medium');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner).not.toHaveAttribute('role');
    expect(spinner?.querySelector('.ribbon-ui-spinner__ring')).not.toBeNull();
  });

  it('upgrades to a role=status live region with an accessible name when a label is provided', () => {
    renderSpinner({ id: 'saving', label: 'Saving changes' });
    const spinner = document.getElementById('saving');

    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Saving changes');
    expect(spinner).not.toHaveAttribute('aria-hidden');
  });

  it.each(['small', 'medium', 'large'] as const)(
    'maps the %s size to a stable rendering attribute',
    (size) => {
      renderSpinner({ id: `size-${size}`, size });
      expect(document.getElementById(`size-${size}`)).toHaveAttribute('data-size', size);
    },
  );

  it('merges an optional host layout class without dropping the theme boundary', () => {
    renderSpinner({ className: 'host-slot', id: 'themed-spinner' });
    const spinner = document.getElementById('themed-spinner');
    const boundary = spinner?.parentElement;

    expect(spinner).toHaveClass('ribbon-ui-spinner', 'host-slot');
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderSpinner({ id: 'theme-spinner' });
    const boundary = document.getElementById('theme-spinner')?.parentElement;
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Spinner id="theme-spinner" />
      </RibbonThemeProvider>,
    );
    expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
