import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Radio } from './Radio';
import './Radio.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    checked: false,
    disabled: false,
    id: 'radio-example',
    label: 'Option A',
    name: 'radio-example-group',
    required: false,
    value: 'a',
  },
  argTypes: {
    ariaDescribedBy: {
      description: 'Runtime-only ID of host-provided descriptive content.',
      table: { category: 'Runtime' },
    },
    checked: {
      control: 'boolean',
      description: 'Controlled checked state owned by the host.',
      table: { category: 'Schema' },
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
    label: {
      description: 'Required serializable visible text and accessible name.',
      table: { category: 'Schema' },
    },
    name: {
      description: 'Required shared form field name that groups radios natively.',
      table: { category: 'Schema' },
    },
    onChange: {
      action: 'changed',
      description: 'Runtime-only change callback requesting the next selected value.',
      table: { category: 'Runtime' },
    },
    required: {
      control: 'boolean',
      description: 'Marks the group as required for native form submission.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    value: {
      description: 'Required form value submitted when this radio is the selected option.',
      table: { category: 'Schema' },
    },
  },
  component: Radio,
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
          'Usage: use Radio for one option in a radio group; a RadioGroup molecule composes multiple radios sharing the same name. Serializable props are id, label, value, checked, name, disabled, and required; runtime props are ariaDescribedBy, className, and onChange. Following the controlled-state precedent, checked is host-owned, so click/Space request the next state through onChange and the component never owns state; the required name groups radios natively for form submission and arrow-key movement. States and variants: unchecked, checked, disabled, and required are supported; groups, icons, and invalid-config rendering are separate concerns. Accessibility: the native input supplies radio semantics, the visible label wraps the input and supplies the accessible name, Space selects, disabled removes sequential focus, and external description content may be bound with ariaDescribedBy; focus-within uses a token-based outline. Theme and density: the native radio uses the shared accent-color token and label text uses shared text tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Radio',
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulRadioGroup() {
  const [selected, setSelected] = useState('a');
  return (
    <fieldset className="ribbon-ui-radio-story-group">
      <legend>Choose a plan</legend>
      {(['a', 'b', 'c'] as const).map((value) => (
        <Radio
          checked={selected === value}
          id={`plan-${value}`}
          key={value}
          label={`Plan ${value.toUpperCase()}`}
          name="plan"
          onChange={(event) => {
            setSelected(event.currentTarget.value);
          }}
          value={value}
        />
      ))}
    </fieldset>
  );
}

export const Default: Story = {
  render: () => <StatefulRadioGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const planB = canvas.getByRole('radio', { name: 'Plan B' });
    await userEvent.click(planB);
    await expect(canvas.getByRole('radio', { name: 'Plan B' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Plan A' })).not.toBeChecked();
  },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, id: 'disabled-radio', label: 'Unavailable', value: 'x' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio', { name: 'Unavailable' })).toBeDisabled();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-radio-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} radios`} className="ribbon-ui-radio-story-theme">
            <h2>{themeId}</h2>
            <Radio
              checked={false}
              id={`${themeId}-off`}
              label="Off"
              name={`${themeId}-group`}
              value="off"
            />
            <Radio checked id={`${themeId}-on`} label="On" name={`${themeId}-group`} value="on" />
            <Radio
              checked
              disabled
              id={`${themeId}-disabled`}
              label="Disabled"
              name={`${themeId}-group`}
              value="d"
            />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
