import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Select } from './Select';
import type { SelectConfig } from './Select.types';
import './Select.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];
const fruits: SelectConfig['options'] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

const meta = {
  args: {
    disabled: false,
    id: 'select-example',
    options: fruits,
    required: false,
    size: 'medium',
    value: '',
  },
  argTypes: {
    ariaDescribedBy: {
      description: 'Runtime-only ID of host-provided descriptive content.',
      table: { category: 'Runtime' },
    },
    ariaLabel: {
      description: 'Runtime-only accessible name for context-free fields.',
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
      description: 'Required stable serialized instance identifier and native select DOM id.',
      table: { category: 'Schema' },
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
    options: {
      description: 'Serializable allowlisted option list (value+label).',
      table: { category: 'Schema' },
    },
    placeholder: {
      description: 'Serializable placeholder rendered as a disabled first option with empty value.',
      table: { category: 'Schema' },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required for native form submission.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable target-size variant. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
    value: {
      control: false,
      description: 'Serializable controlled selected value owned by the host; empty when omitted.',
      table: { category: 'Schema', defaultValue: { summary: '' } },
    },
  },
  component: Select,
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
          'Usage: use Select for a single-choice dropdown from an allowlisted option list; a ComboBox (input plus searchable dropdown) is a later molecule. Serializable props are id, value, options, placeholder, name, size, disabled, and required; runtime props are ariaLabel, ariaDescribedBy, ariaLabelledBy, className, onChange, onFocus, and onBlur. Following the controlled-state precedent, value is host-owned and the field is always controlled, so selecting an option requests the next value through onChange. States and variants: small/medium/large sizes, placeholder, disabled, required, and the allowlisted options array are supported; multi-select, async options, icons, and invalid-config rendering are separate concerns. Accessibility: the native select supplies combobox/listbox semantics, the id doubles as the DOM id for label association, disabled removes sequential focus, and external description/label content may be bound with ariaLabel/ariaDescribedBy/ariaLabelledBy; focus-visible uses a token-based outline. Theme and density: fill, border, and text color consume only shared semantic tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes select target density. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Select',
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulSelect() {
  const [value, setValue] = useState('');
  return (
    <label className="ribbon-ui-select-story-field">
      Fruit
      <Select
        id="stateful-select"
        onChange={(event) => {
          setValue(event.currentTarget.value);
        }}
        options={fruits}
        placeholder="Choose..."
        value={value}
      />
    </label>
  );
}

export const Default: Story = {
  render: () => <StatefulSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await userEvent.selectOptions(select, 'banana');
    await expect(select).toHaveValue('banana');
  },
};

export const Placeholder: Story = {
  args: {
    ariaLabel: 'Fruit',
    id: 'placeholder-select',
    options: fruits,
    placeholder: 'Choose a fruit...',
  },
};

export const Disabled: Story = {
  args: {
    ariaLabel: 'Fruit',
    disabled: true,
    id: 'disabled-select',
    options: fruits,
    value: 'apple',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox')).toBeDisabled();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-select-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} selects`} className="ribbon-ui-select-story-theme">
            <h2>{themeId}</h2>
            <Select
              ariaLabel="Medium"
              id={`${themeId}-medium`}
              options={fruits}
              placeholder="Medium"
            />
            <Select
              ariaLabel="Large"
              id={`${themeId}-large`}
              options={fruits}
              placeholder="Large"
              size="large"
            />
            <Select
              ariaLabel="Disabled"
              disabled
              id={`${themeId}-disabled`}
              options={fruits}
              value="apple"
            />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
