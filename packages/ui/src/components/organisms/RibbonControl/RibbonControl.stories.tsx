import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider } from '../../../theme';
import {
  BADGE_SCHEMA_ID,
  BUTTON_SCHEMA_ID,
  ICON_SCHEMA_ID,
  SEPARATOR_SCHEMA_ID,
  TOGGLE_BUTTON_SCHEMA_ID,
} from '../../componentSchemas';
import { RibbonControl } from './RibbonControl';
import './RibbonControl.stories.css';

const meta = {
  args: {
    definition: { config: { id: 'save', label: 'Save' }, id: 'save', type: BUTTON_SCHEMA_ID },
    id: 'ribbon-control-example',
  },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    controlState: {
      description: 'Host-owned state for stateful controls, keyed by control id; runtime-only.',
      table: { category: 'Runtime' },
    },
    definition: {
      description: 'Runtime-only control definition (type + config + command); never serialized.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    onCommand: {
      action: 'command',
      description: 'Runtime-only command dispatcher for action controls.',
      table: { category: 'Runtime' },
    },
    onControlChange: {
      action: 'controlChange',
      description: 'Runtime-only state change request callback.',
      table: { category: 'Runtime' },
    },
  },
  component: RibbonControl,
  decorators: [
    (Story) => (
      <RibbonThemeProvider themeId="modern-light">
        <Story />
      </RibbonThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Usage: use RibbonControl to resolve a workspace control definition to a registered component, validating its config through the trusted schema catalog and wiring commands and state. Serializable prop is id; runtime props are definition, onCommand, controlState, onControlChange, and className. States and variants: registered control types (Button, IconButton, ToggleButton, Separator, Label, Badge, Icon) render deterministically; unknown types and invalid configs render a diagnostic fallback and never crash. Accessibility: action controls wire onCommand, the ToggleButton pressed state is host-owned via controlState and toggles through onControlChange, and diagnostics are visible text. Theme and density: rendered controls consume their own shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Organisms/RibbonControl',
} satisfies Meta<typeof RibbonControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-ribbon-control-story-row">
      <RibbonControl
        definition={{
          command: 'save',
          config: { id: 'save', label: 'Save' },
          id: 'save',
          type: BUTTON_SCHEMA_ID,
        }}
        id="renderer-save"
      />
      <RibbonControl
        controlState={{ bold: { pressed: true } }}
        definition={{
          config: { id: 'bold', label: 'Bold', pressed: false },
          id: 'bold',
          type: TOGGLE_BUTTON_SCHEMA_ID,
        }}
        id="renderer-bold"
      />
      <RibbonControl
        definition={{ config: { id: 'sep' }, id: 'sep', type: SEPARATOR_SCHEMA_ID }}
        id="renderer-sep"
      />
      <RibbonControl
        definition={{
          config: { id: 'new', label: 'New', tone: 'primary' },
          id: 'new',
          type: BADGE_SCHEMA_ID,
        }}
        id="renderer-badge"
      />
      <RibbonControl
        definition={{ config: { id: 'star', icon: 'search' }, id: 'star', type: ICON_SCHEMA_ID }}
        id="renderer-icon"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
  },
};

export const UnknownControl: Story = {
  render: () => (
    <RibbonControl
      definition={{
        config: {},
        id: 'mystery',
        type: 'urn:ribbon-ui:schema:component:unknown:1.0.0',
      }}
      id="renderer-unknown"
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        'Unknown control: urn:ribbon-ui:schema:component:unknown:1.0.0',
      ),
    ).toBeInTheDocument();
  },
};
