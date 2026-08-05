import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { BUTTON_SCHEMA_ID } from '../../componentSchemas';
import { Ribbon } from './Ribbon';
import type { RibbonDefinition, RibbonProps } from './Ribbon.types';

const definition: RibbonDefinition = {
  tabs: [
    {
      groups: [
        {
          controls: [
            {
              command: 'paste',
              config: { id: 'paste', label: 'Paste' },
              id: 'paste',
              type: BUTTON_SCHEMA_ID,
            },
          ],
          id: 'clipboard',
          label: 'Clipboard',
        },
      ],
      id: 'home',
      label: 'Home',
    },
    { groups: [], id: 'insert', label: 'Insert' },
  ],
};

function renderRibbon(props: Partial<Omit<RibbonProps, 'id' | 'definition'>> = {}) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Ribbon activeTab="home" definition={definition} id="editor-ribbon" {...props} />
    </RibbonThemeProvider>,
  );
}

describe('Ribbon', () => {
  it('renders a tablist with the active tab selected and the active panel associated', () => {
    renderRibbon();
    const home = screen.getByRole('tab', { name: 'Home', selected: true });
    const insert = screen.getByRole('tab', { name: 'Insert', selected: false });

    expect(home).toHaveAttribute('aria-controls', 'editor-ribbon-home-panel');
    expect(insert).not.toHaveAttribute('aria-controls');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'editor-ribbon-home-panel');
    expect(panel).toHaveAttribute('aria-labelledby', 'home');
  });

  it('renders the active tab groups and controls via RibbonControl', () => {
    renderRibbon();
    expect(screen.getByRole('group', { name: 'Clipboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
  });

  it('requests the next active tab through onSelectTab', async () => {
    const user = userEvent.setup();
    const onSelectTab = vi.fn();
    renderRibbon({ onSelectTab });
    await user.click(screen.getByRole('tab', { name: 'Insert' }));
    expect(onSelectTab).toHaveBeenCalledWith('insert');
  });

  it('forwards command dispatch to controls', async () => {
    const user = userEvent.setup();
    const onCommand = vi.fn();
    renderRibbon({ onCommand });
    await user.click(screen.getByRole('button', { name: 'Paste' }));
    expect(onCommand).toHaveBeenCalledWith('paste');
  });

  it('fires the selection-preservation pointer hook on tab bar pointer down', () => {
    const onRibbonPointerDown = vi.fn();
    renderRibbon({ onRibbonPointerDown });
    fireEvent.mouseDown(screen.getByRole('tablist'));
    expect(onRibbonPointerDown).toHaveBeenCalledOnce();
  });

  it('stays inside one coherent theme boundary when the host theme changes', () => {
    const { rerender } = renderRibbon();
    expect(
      document.querySelector('[data-ribbon-ui-component="ribbon"]')?.parentElement,
    ).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');

    rerender(
      <RibbonThemeProvider themeId="modern-dark">
        <Ribbon activeTab="home" definition={definition} id="editor-ribbon" />
      </RibbonThemeProvider>,
    );
    expect(
      document.querySelector('[data-ribbon-ui-component="ribbon"]')?.parentElement,
    ).toHaveAttribute('data-ribbon-ui-theme', 'modern-dark');
  });
});
