import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import {
  BUTTON_SCHEMA_ID,
  SEPARATOR_SCHEMA_ID,
  TOGGLE_BUTTON_SCHEMA_ID,
} from '../../componentSchemas';
import { RibbonControl } from './RibbonControl';
import type { RibbonControlDefinition, RibbonControlProps } from './RibbonControl.types';

function renderControl(props: Omit<RibbonControlProps, 'id'>) {
  return render(
    <RibbonThemeProvider themeId="modern-light">
      <RibbonControl id="renderer" {...props} />
    </RibbonThemeProvider>,
  );
}

describe('RibbonControl', () => {
  it('renders a registered Button control and wires onCommand', async () => {
    const user = userEvent.setup();
    const onCommand = vi.fn();
    const definition: RibbonControlDefinition = {
      command: 'save',
      config: { id: 'save', label: 'Save' },
      id: 'save',
      type: BUTTON_SCHEMA_ID,
    };
    renderControl({ definition, onCommand });

    const button = screen.getByRole('button', { name: 'Save' });
    await user.click(button);
    expect(onCommand).toHaveBeenCalledWith('save');
  });

  it('renders a ToggleButton with host-owned pressed state and toggles through onControlChange', async () => {
    const user = userEvent.setup();
    const onControlChange = vi.fn();
    const definition: RibbonControlDefinition = {
      config: { id: 'bold', label: 'Bold', pressed: false },
      id: 'bold',
      type: TOGGLE_BUTTON_SCHEMA_ID,
    };
    renderControl({ controlState: { bold: { pressed: true } }, definition, onControlChange });

    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(onControlChange).toHaveBeenCalledWith('bold', false);
  });

  it('renders a Separator control', () => {
    const definition: RibbonControlDefinition = {
      config: { id: 'sep' },
      id: 'sep',
      type: SEPARATOR_SCHEMA_ID,
    };
    renderControl({ definition });
    expect(document.getElementById('sep')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a diagnostic fallback for an unknown control type', () => {
    const definition: RibbonControlDefinition = {
      config: {},
      id: 'mystery',
      type: 'urn:ribbon-ui:schema:component:unknown:1.0.0',
    };
    renderControl({ definition });
    expect(
      screen.getByText('Unknown control: urn:ribbon-ui:schema:component:unknown:1.0.0'),
    ).toBeInTheDocument();
  });

  it('renders a diagnostic fallback for an invalid control config', () => {
    const definition: RibbonControlDefinition = {
      config: { id: 'bad' },
      id: 'bad',
      type: BUTTON_SCHEMA_ID,
    };
    renderControl({ definition });
    expect(screen.getByText('Invalid control: bad')).toBeInTheDocument();
  });
});
