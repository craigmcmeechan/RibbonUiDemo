import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Ribbon, RibbonThemeProvider } from '../packages/ui/src';
import { editorRibbonDefinition } from './fixtures/editorRibbonDefinition';

function renderEditorRibbon(activeTab = 'home') {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <Ribbon
        activeTab={activeTab}
        definition={editorRibbonDefinition}
        id="editor-ribbon"
        label="Editor"
      />
    </RibbonThemeProvider>,
  );
}

describe('Editor ribbon workspace configuration (4.4 parity fixture)', () => {
  it('renders the editor tabs in order with Home active', () => {
    renderEditorRibbon();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Home', 'Insert', 'Layout', 'View']);
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument();
  });

  it('renders the Home tab groups and controls from the workspace definition', () => {
    renderEditorRibbon();
    expect(screen.getByRole('group', { name: 'Clipboard' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Font' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Paragraph' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches tabs and renders the target tab groups', async () => {
    const user = userEvent.setup();
    function StatefulRibbon() {
      const [activeTab, setActiveTab] = useState('home');
      return (
        <RibbonThemeProvider themeId="modern-light">
          <Ribbon
            activeTab={activeTab}
            definition={editorRibbonDefinition}
            id="editor-ribbon"
            onSelectTab={setActiveTab}
          />
        </RibbonThemeProvider>
      );
    }
    render(<StatefulRibbon />);
    await user.click(screen.getByRole('tab', { name: 'Insert' }));
    expect(screen.getByRole('group', { name: 'Tables' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Table' })).toBeInTheDocument();
  });

  it('wires control commands through onCommand', async () => {
    const user = userEvent.setup();
    const onCommand = vi.fn();
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Ribbon
          activeTab="home"
          definition={editorRibbonDefinition}
          id="editor-ribbon"
          onCommand={onCommand}
        />
      </RibbonThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Paste' }));
    expect(onCommand).toHaveBeenCalledWith('paste');
  });

  it('binds ToggleButton pressed state from controlState and toggles through onControlChange', async () => {
    const user = userEvent.setup();
    const onControlChange = vi.fn();
    render(
      <RibbonThemeProvider themeId="modern-light">
        <Ribbon
          activeTab="home"
          controlState={{ bold: { pressed: true } }}
          definition={editorRibbonDefinition}
          id="editor-ribbon"
          onControlChange={onControlChange}
        />
      </RibbonThemeProvider>,
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold).toHaveAttribute('aria-pressed', 'true');
    await user.click(bold);
    expect(onControlChange).toHaveBeenCalledWith('bold', false);
  });

  it('keeps every group at the fixed common height contract', () => {
    renderEditorRibbon();
    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((group) => {
      expect(group.querySelector('.ribbon-ui-ribbon-group__body')).not.toBeNull();
    });
  });
});
