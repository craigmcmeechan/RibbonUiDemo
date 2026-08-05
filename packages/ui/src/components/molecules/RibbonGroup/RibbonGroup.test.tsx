import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { Button } from '../../atoms/Button';
import { RibbonGroup } from './RibbonGroup';

function renderGroup() {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <RibbonGroup className="host-slot" id="clipboard" label="Clipboard">
        <Button id="paste" label="Paste" />
        <Button id="cut" label="Cut" />
      </RibbonGroup>
    </RibbonThemeProvider>,
  );
}

describe('RibbonGroup', () => {
  it('renders a labelled group with control children', () => {
    renderGroup();
    const group = screen.getByRole('group', { name: 'Clipboard' });

    expect(group).toHaveAttribute('data-ribbon-ui-component', 'ribbon-group');
    expect(group).toHaveClass('ribbon-ui-ribbon-group', 'host-slot');
    expect(group).toHaveTextContent('Clipboard');
    expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cut' })).toBeInTheDocument();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderGroup();
    const group = screen.getByRole('group', { name: 'Clipboard' });
    expect(group.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <RibbonGroup id="clipboard" label="Clipboard">
          <Button id="paste" label="Paste" />
        </RibbonGroup>
      </RibbonThemeProvider>,
    );
    expect(group.parentElement).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
