import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Separator } from './Separator';
import './Separator.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { id: 'separator-example', orientation: 'vertical' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    orientation: {
      control: 'inline-radio',
      description: 'Serializable divider axis. Default: vertical.',
      options: ['vertical', 'horizontal'],
      table: { category: 'Schema', defaultValue: { summary: 'vertical' } },
    },
  },
  component: Separator,
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
          'Usage: use Separator for one decorative divider between side-by-side ribbon groups, rows, or stacked menu items; it is non-interactive and carries no label, command, icon, or menu. Serializable props are id and orientation; the only runtime prop is className. States and variants: vertical and horizontal orientations are supported; there is no disabled, pressed, loading, or invalid-config rendering state because the divider is decorative. Accessibility: the divider is hidden from assistive technology with aria-hidden and exposes no role or name, so it adds structure without noise. Theme and density: the divider consumes only the shared semantic border-divider token, so every theme (modern-light, classic-light, modern-dark) recolors it consistently, and vertical/horizontal geometry is structural rather than density-driven. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Separator',
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-separator-story-row">
      <span>Before</span>
      <Separator id="default-sep" />
      <span>After</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const separator = canvasElement.ownerDocument.getElementById('default-sep');
    await expect(separator).toHaveAttribute('aria-hidden', 'true');
    await expect(separator).toHaveAttribute('data-orientation', 'vertical');
  },
};

export const Horizontal: Story = {
  render: () => (
    <div className="ribbon-ui-separator-story-stack">
      <span>Above</span>
      <Separator id="horizontal-sep" orientation="horizontal" />
      <span>Below</span>
    </div>
  ),
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-separator-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} separators`} className="ribbon-ui-separator-story-theme">
            <h2>{themeId}</h2>
            <div className="ribbon-ui-separator-story-row">
              <span>Left</span>
              <Separator id={`${themeId}-vertical`} />
              <span>Right</span>
            </div>
            <div className="ribbon-ui-separator-story-stack">
              <span>Top</span>
              <Separator id={`${themeId}-horizontal`} orientation="horizontal" />
              <span>Bottom</span>
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
