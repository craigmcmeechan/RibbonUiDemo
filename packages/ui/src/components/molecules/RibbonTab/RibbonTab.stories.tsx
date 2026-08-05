import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { RibbonTab } from './RibbonTab';
import './RibbonTab.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { active: false, id: 'ribbon-tab-example', label: 'Home' },
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Controlled active state owned by the host.',
      table: { category: 'Runtime' },
    },
    ariaControls: {
      description: 'Runtime-only ID of the tab panel this tab controls.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Required serializable visible text and accessible name.',
      table: { category: 'Schema' },
    },
    onSelect: {
      action: 'selected',
      description: 'Runtime-only selection callback.',
      table: { category: 'Runtime' },
    },
  },
  component: RibbonTab,
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
          'Usage: use RibbonTab as a single ribbon tab button; the Ribbon composition (later) owns the tablist and active-tab state. Serializable props are id and label; runtime props are active, onSelect, ariaControls, and className. States and variants: active and inactive are supported. Accessibility: the button has role=tab and aria-selected driven by the controlled active state, and aria-controls associates it with its panel; focus-visible uses a token-based outline. Theme and density: inactive, active, and hover backgrounds consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/RibbonTab',
} satisfies Meta<typeof RibbonTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-ribbon-tab-story-row" role="tablist">
      <RibbonTab active id="home" label="Home" />
      <RibbonTab active={false} id="insert" label="Insert" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument();
    await expect(canvas.getByRole('tab', { name: 'Insert', selected: false })).toBeInTheDocument();
  },
};

export const Interactive: Story = {
  render: () => (
    <div role="tablist">
      <RibbonTab active={false} id="view" label="View" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'View' }));
    await expect(canvas.getByRole('tab', { name: 'View' })).toBeInTheDocument();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-ribbon-tab-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <div className="ribbon-ui-ribbon-tab-story-row" role="tablist">
            <RibbonTab active id={`${themeId}-active`} label="Active" />
            <RibbonTab active={false} id={`${themeId}-inactive`} label="Inactive" />
          </div>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
