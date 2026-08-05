import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { ColorSwatch } from './ColorSwatch';
import './ColorSwatch.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];
const palette = ['#ff6f3d', '#4473ca', '#34a853', '#f4b400', '#9333ea', '#111827'];

const meta = {
  args: { color: '#4473ca', id: 'color-swatch-example', shape: 'square', size: 'medium' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    color: {
      control: 'color',
      description: 'Serializable hex color value applied as the chip fill via an inline style.',
      table: { category: 'Schema' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      control: 'text',
      description:
        'Serializable accessible name; when present the swatch becomes a role=img element.',
      table: { category: 'Schema' },
    },
    shape: {
      control: 'inline-radio',
      description: 'Serializable chip corner shape. Default: square.',
      options: ['square', 'circle'],
      table: { category: 'Schema', defaultValue: { summary: 'square' } },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable chip diameter. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
  },
  component: ColorSwatch,
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
          'Usage: use ColorSwatch for one decorative color chip; a ColorPicker molecule composes swatches with selection and a field. Serializable props are id, color, label, size, and shape; the only runtime prop is className. States and variants: small/medium/large diameters, square/circle shapes, and decorative versus labelled modes are supported; selection, popovers, and invalid-config rendering are separate concerns. Accessibility: by default the chip is hidden from assistive technology with aria-hidden; providing a label upgrades it to a role=img element with an accessible name. Theme and density: the chip border consumes the shared semantic border-control token, while the fill is the host-provided hex color applied through an inline style (not a CSS color literal), so the swatch recolors per instance and the border recolors per theme; explicit sizes select the chip diameter. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/ColorSwatch',
} satisfies Meta<typeof ColorSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-color-swatch-story-row">
      {palette.map((color, index) => (
        <ColorSwatch
          color={color}
          id={`swatch-${String(index)}`}
          key={color}
          label={`Color ${color}`}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('img')).toHaveLength(palette.length);
  },
};

export const Shapes: Story = {
  render: () => (
    <div className="ribbon-ui-color-swatch-story-row">
      <ColorSwatch color="#4473ca" id="square" label="Square" shape="square" />
      <ColorSwatch color="#34a853" id="circle" label="Circle" shape="circle" />
    </div>
  ),
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-color-swatch-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section
            aria-label={`${themeId} swatches`}
            className="ribbon-ui-color-swatch-story-theme"
          >
            <h2>{themeId}</h2>
            <div className="ribbon-ui-color-swatch-story-row">
              {palette.map((color, index) => (
                <ColorSwatch color={color} id={`${themeId}-${String(index)}`} key={color} />
              ))}
            </div>
            <div className="ribbon-ui-color-swatch-story-row">
              <ColorSwatch color="#4473ca" id={`${themeId}-small`} size="small" />
              <ColorSwatch color="#4473ca" id={`${themeId}-medium`} />
              <ColorSwatch color="#4473ca" id={`${themeId}-large`} size="large" />
              <ColorSwatch color="#34a853" id={`${themeId}-circle`} shape="circle" />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
