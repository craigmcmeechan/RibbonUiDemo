import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Slider } from './Slider';
import './Slider.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    disabled: false,
    id: 'slider-example',
    max: 100,
    min: 0,
    size: 'medium',
    step: 1,
    value: 50,
  },
  argTypes: {
    ariaDescribedBy: {
      description: 'Runtime-only ID of host-provided descriptive content.',
      table: { category: 'Runtime' },
    },
    ariaLabel: {
      description: 'Runtime-only accessible name for the slider.',
      table: { category: 'Runtime' },
    },
    ariaLabelledBy: {
      description: 'Runtime-only ID of host-provided labelling content.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Uses native disabled semantics and suppresses activation and focus.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    id: {
      description: 'Required stable serialized instance identifier and native input DOM id.',
      table: { category: 'Schema' },
    },
    max: {
      control: 'number',
      description: 'Serializable maximum allowed value. Default: 100.',
      table: { category: 'Schema', defaultValue: { summary: '100' } },
    },
    min: {
      control: 'number',
      description: 'Serializable minimum allowed value. Default: 0.',
      table: { category: 'Schema', defaultValue: { summary: '0' } },
    },
    name: {
      description: 'Serializable form field name for native form submission.',
      table: { category: 'Schema' },
    },
    onChange: {
      action: 'changed',
      description: 'Runtime-only change callback requesting the next controlled value.',
      table: { category: 'Runtime' },
    },
    onBlur: {
      action: 'blurred',
      description: 'Runtime-only blur callback.',
      table: { category: 'Runtime' },
    },
    onFocus: {
      action: 'focused',
      description: 'Runtime-only focus callback.',
      table: { category: 'Runtime' },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable target-size variant. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
    step: {
      control: 'number',
      description: 'Serializable step between allowed values. Default: 1.',
      table: { category: 'Schema', defaultValue: { summary: '1' } },
    },
    value: {
      control: 'number',
      description: 'Serializable controlled value owned by the host. Default: 0.',
      table: { category: 'Schema', defaultValue: { summary: '0' } },
    },
  },
  component: Slider,
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
          'Usage: use Slider for a single numeric value within a range; a two-handle range slider is a separate concern. Serializable props are id, value, min, max, step, name, size, and disabled; runtime props are ariaLabel, ariaDescribedBy, ariaLabelledBy, className, onChange, onFocus, and onBlur. Following the controlled-state precedent, value is host-owned and the field is always controlled, so arrow keys and pointer changes request the next value through onChange. States and variants: small/medium/large sizes, min/max/step ranges, and disabled are supported; tick marks, two-handle ranges, icons, and invalid-config rendering are separate concerns. Accessibility: the native input supplies slider semantics, the id doubles as the DOM id for label association, arrow keys move the value, disabled removes sequential focus, and external description/label content may be bound with ariaLabel/ariaDescribedBy/ariaLabelledBy; focus-visible uses a token-based outline. Theme and density: the native slider uses the shared accent-color token, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes select target density. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Slider',
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulSlider() {
  const [value, setValue] = useState(50);
  return (
    <label className="ribbon-ui-slider-story-field">
      Volume
      <Slider
        id="stateful-slider"
        onChange={(event) => {
          setValue(Number(event.currentTarget.value));
        }}
        value={value}
      />
    </label>
  );
}

export const Default: Story = {
  render: () => <StatefulSlider />,
};

export const Disabled: Story = {
  args: { ariaLabel: 'Volume', disabled: true, id: 'disabled-slider', value: 30 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('slider')).toBeDisabled();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-slider-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} sliders`} className="ribbon-ui-slider-story-theme">
            <h2>{themeId}</h2>
            <Slider ariaLabel="Small" id={`${themeId}-small`} size="small" value={25} />
            <Slider ariaLabel="Medium" id={`${themeId}-medium`} value={50} />
            <Slider ariaLabel="Large" id={`${themeId}-large`} size="large" value={75} />
            <Slider ariaLabel="Disabled" disabled id={`${themeId}-disabled`} value={10} />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
