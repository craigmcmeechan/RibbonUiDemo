import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Spinner } from './Spinner';
import './Spinner.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { id: 'spinner-example', size: 'medium' },
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
      control: 'text',
      description:
        'Serializable accessible loading message; when present the spinner becomes a role=status live region.',
      table: { category: 'Schema' },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable ring diameter. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
  },
  component: Spinner,
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
          'Usage: use Spinner for an indeterminate loading indicator; a determinate progress value is a separate concern. Serializable props are id, label, and size; the only runtime prop is className. States and variants: small/medium/large ring diameters and decorative versus labelled modes are supported; determinate progress, icons, and invalid-config rendering are separate concerns. Accessibility: by default the ring is hidden from assistive technology with aria-hidden; providing a label upgrades the element to a role=status live region with an accessible name so screen readers announce the loading message. Theme and density: the ring consumes only the shared semantic accent token plus the transparent keyword, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes select the ring diameter; the spin animation respects prefers-reduced-motion. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Spinner',
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-spinner-story-row">
      <Spinner id="default-decorative" size="medium" />
      <Spinner id="default-labelled" label="Loading content" size="medium" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveAttribute('aria-label', 'Loading content');
    await expect(document.getElementById('default-decorative')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

export const Labelled: Story = {
  args: { id: 'labelled-spinner', label: 'Saving changes', size: 'large' },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-spinner-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} spinners`} className="ribbon-ui-spinner-story-theme">
            <h2>{themeId}</h2>
            <div className="ribbon-ui-spinner-story-row">
              <Spinner id={`${themeId}-small`} size="small" />
              <Spinner id={`${themeId}-medium`} size="medium" />
              <Spinner id={`${themeId}-large`} size="large" />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
