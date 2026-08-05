import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Label } from './Label';
import './Label.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { id: 'label-example', text: 'Label example', variant: 'default' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    htmlFor: {
      description:
        'Runtime-only host DOM id of the associated control; when set the label becomes a form <label>.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    text: {
      description: 'Required serializable visible text that supplies the label content.',
      table: { category: 'Schema' },
    },
    variant: {
      control: 'inline-radio',
      description: 'Serializable semantic emphasis. Default: default.',
      options: ['default', 'strong'],
      table: { category: 'Schema', defaultValue: { summary: 'default' } },
    },
  },
  component: Label,
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
          'Usage: use Label for one visible text label, either as a generic text label (group label, menu head) or, with the runtime htmlFor prop, as a form <label> associated with a control. Serializable props are id, text, and variant; runtime props are htmlFor and className. States and variants: default and strong (bold) emphasis are supported; a low-contrast muted variant is intentionally omitted because the classic-light theme cannot meet the 4.5:1 contrast gate for de-emphasized text, so secondary text styling belongs in the Field molecule where contrast can be guaranteed. There is no disabled, pressed, loading, or invalid-config rendering state because the label is non-interactive. Accessibility: a bound form <label> supplies the accessible name for the associated control; an unbound label renders as a visible span with no role, so it adds structure without redundant semantics. Theme and density: text color and weight consume only shared semantic text tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently; emphasis is structural and not density-driven. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Label',
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-label-story-row">
      <Label id="default-label" text="Default" />
      <Label id="strong-label" text="Strong" variant="strong" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Default')).toHaveAttribute('data-variant', 'default');
    await expect(canvas.getByText('Strong')).toHaveAttribute('data-variant', 'strong');
  },
};

export const FormLabel: Story = {
  render: () => (
    <div className="ribbon-ui-label-story-stack">
      <Label htmlFor="story-input" id="story-form-label" text="First name" />
      <input id="story-input" type="text" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('First name');
    await expect(label.tagName).toBe('LABEL');
    await expect(label).toHaveAttribute('for', 'story-input');
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-label-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} labels`} className="ribbon-ui-label-story-theme">
            <h2>{themeId}</h2>
            <Label id={`${themeId}-default`} text="Default label" />
            <Label id={`${themeId}-strong`} text="Strong label" variant="strong" />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
