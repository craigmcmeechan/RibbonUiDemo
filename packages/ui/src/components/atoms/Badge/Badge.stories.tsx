import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Badge } from './Badge';
import './Badge.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { id: 'badge-example', label: 'New', tone: 'neutral' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Required serializable visible text content of the badge.',
      table: { category: 'Schema' },
    },
    tone: {
      control: 'inline-radio',
      description:
        'Serializable semantic tone. Default: neutral. Success/warning/danger are deferred until status tokens exist.',
      options: ['neutral', 'primary'],
      table: { category: 'Schema', defaultValue: { summary: 'neutral' } },
    },
  },
  component: Badge,
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
          'Usage: use Badge for one compact status pill such as a count, category, or label; it is non-interactive and carries no icon, command, menu, or dismiss control. Serializable props are id, label, and tone; the only runtime prop is className. States and variants: neutral and primary tones are supported; success, warning, and danger tones are intentionally deferred until a semantic status-token theme sub-step adds them, so the atom ships only tones that meet the 4.5:1 contrast gate across all themes. There is no disabled, pressed, loading, or invalid-config rendering state because the badge is non-interactive. Accessibility: the badge renders as a visible span with no role, so its text conveys meaning without redundant semantics. Theme and density: pill fill, border, and text color consume only shared semantic tokens (neutral uses surface-toolbar and text-primary; primary uses accent/control-selected and control-selected-text), so every theme (modern-light, classic-light, modern-dark) recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Badge',
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-badge-story-row">
      <Badge id="default-neutral" label="3 new" />
      <Badge id="default-primary" label="Active" tone="primary" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 new')).toHaveAttribute('data-tone', 'neutral');
    await expect(canvas.getByText('Active')).toHaveAttribute('data-tone', 'primary');
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-badge-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} badges`} className="ribbon-ui-badge-story-theme">
            <h2>{themeId}</h2>
            <div className="ribbon-ui-badge-story-row">
              <Badge id={`${themeId}-neutral`} label="Neutral" />
              <Badge id={`${themeId}-primary`} label="Primary" tone="primary" />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
