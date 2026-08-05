import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider } from '../../../theme';
import {
  BADGE_SCHEMA_ID,
  BUTTON_SCHEMA_ID,
  ICON_BUTTON_SCHEMA_ID,
  SEPARATOR_SCHEMA_ID,
  TOGGLE_BUTTON_SCHEMA_ID,
} from '../../componentSchemas';
import { Ribbon } from './Ribbon';
import type { RibbonDefinition } from './Ribbon.types';
import './Ribbon.stories.css';

const definition: RibbonDefinition = {
  tabs: [
    {
      groups: [
        {
          controls: [
            {
              command: 'paste',
              config: { id: 'paste', label: 'Paste', variant: 'primary' },
              id: 'paste',
              type: BUTTON_SCHEMA_ID,
            },
            {
              command: 'cut',
              config: { icon: 'save', id: 'cut', label: 'Cut' },
              id: 'cut',
              type: ICON_BUTTON_SCHEMA_ID,
            },
            { config: { id: 'sep' }, id: 'sep', type: SEPARATOR_SCHEMA_ID },
            {
              config: { id: 'bold', label: 'Bold', pressed: false },
              id: 'bold',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              config: { id: 'italic', label: 'Italic', pressed: true },
              id: 'italic',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              config: { id: 'new', label: 'New', tone: 'primary' },
              id: 'new',
              type: BADGE_SCHEMA_ID,
            },
          ],
          id: 'clipboard',
          label: 'Clipboard',
        },
        {
          controls: [
            {
              command: 'undo',
              config: { icon: 'undo', id: 'undo', label: 'Undo' },
              id: 'undo',
              type: ICON_BUTTON_SCHEMA_ID,
            },
          ],
          id: 'history',
          label: 'History',
        },
      ],
      id: 'home',
      label: 'Home',
    },
    {
      groups: [
        {
          controls: [
            {
              command: 'table',
              config: { id: 'table', label: 'Table' },
              id: 'table',
              type: BUTTON_SCHEMA_ID,
            },
          ],
          id: 'tables',
          label: 'Tables',
        },
      ],
      id: 'insert',
      label: 'Insert',
    },
  ],
};

const meta = {
  args: { activeTab: 'home', definition, id: 'ribbon-example', label: 'Editor ribbon' },
  argTypes: {
    activeTab: {
      control: false,
      description: 'Controlled active tab id owned by the host.',
      table: { category: 'Runtime' },
    },
    children: {
      description: 'Optional extra content rendered after the tab bar; runtime-only.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    controlState: {
      description: 'Host-owned control state forwarded to controls; runtime-only.',
      table: { category: 'Runtime' },
    },
    definition: {
      description: 'Runtime-only ribbon definition (tabs/groups/controls); never serialized.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Serializable accessible name for the ribbon tablist.',
      table: { category: 'Schema' },
    },
    onCommand: {
      action: 'command',
      description: 'Runtime-only command dispatcher forwarded to controls.',
      table: { category: 'Runtime' },
    },
    onControlChange: {
      action: 'controlChange',
      description: 'Runtime-only control state change callback.',
      table: { category: 'Runtime' },
    },
    onRibbonPointerDown: {
      description: 'Runtime-only selection-preservation pointer hook (editor adapter stub).',
      table: { category: 'Runtime' },
    },
    onSelectTab: {
      action: 'selectTab',
      description: 'Runtime-only tab selection callback.',
      table: { category: 'Runtime' },
    },
  },
  component: Ribbon,
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
          'Usage: use Ribbon to compose a schema-defined ribbon: a tablist of RibbonTab buttons with the active tab RibbonGroup controls rendered through RibbonControl. Serializable props are id and label; runtime props are definition, activeTab, onSelectTab, onCommand, controlState, onControlChange, onRibbonPointerDown, children, and className. States and variants: the active tab is host-owned and selected via onSelectTab; controls receive command and state wiring; the active tab panel is associated with its tab without dangling aria references. Accessibility: the tab bar is a role=tablist with role=tab children, the active panel is a role=tabpanel labelled by its tab, and a selection-preservation pointer hook forwards to the editor adapter (Phase 7). Theme and density: tab bar, toolbar, and divider consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Organisms/Ribbon',
} satisfies Meta<typeof Ribbon>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveRibbon() {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <Ribbon
      activeTab={activeTab}
      definition={definition}
      id="interactive-ribbon"
      label="Editor ribbon"
      onSelectTab={setActiveTab}
    />
  );
}

export const Default: Story = {
  render: () => <InteractiveRibbon />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: 'Insert' }));
    await expect(canvas.getByRole('tab', { name: 'Insert', selected: true })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Table' })).toBeInTheDocument();
  },
};

export const StaticHome: Story = {
  args: { definition },
};
