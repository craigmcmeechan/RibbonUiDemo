import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { TextInput } from './TextInput';
import './TextInput.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    disabled: false,
    id: 'text-input-example',
    inputType: 'text',
    placeholder: 'Type something',
    readonly: false,
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
      description: 'Runtime-only accessible name for icon-only or context-free fields.',
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
      description: 'Uses native disabled semantics and suppresses editing and focus.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    id: {
      description: 'Required stable serialized instance identifier and native input DOM id.',
      table: { category: 'Schema' },
    },
    inputType: {
      control: 'select',
      description: 'Serializable native input type. Default: text.',
      options: ['text', 'email', 'password', 'search', 'url'],
      table: { category: 'Schema', defaultValue: { summary: 'text' } },
    },
    maxLength: {
      control: 'number',
      description: 'Serializable maximum character count enforced by the native input.',
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
    placeholder: {
      control: 'text',
      description: 'Serializable placeholder shown when the value is empty.',
      table: { category: 'Schema' },
    },
    readonly: {
      control: 'boolean',
      description: 'Makes the value readable but not editable.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
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
      control: 'text',
      description: 'Serializable controlled value owned by the host; empty when omitted.',
      table: { category: 'Schema', defaultValue: { summary: '' } },
    },
  },
  component: TextInput,
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
          'Usage: use TextInput for a single-line controlled text field; TextArea is the multi-line variant and NumberInput/Slider handle numbers. Serializable props are id, value, placeholder, name, size, inputType, maxLength, disabled, readonly, and required; runtime props are ariaDescribedBy, ariaLabelledBy, className, onChange, onFocus, and onBlur. Following the ToggleButton precedent, value is host-owned and the field is always controlled, so typing requests the next value through onChange. States and variants: small/medium/large sizes, text/email/password/search/url input types, placeholder, disabled, readonly, required, and maxLength are supported; validation UI, icons, prefixes/suffixes, and invalid-config rendering are separate concerns. Accessibility: the native input supplies textbox semantics, the id doubles as the DOM id for label association, Enter submits the host form, disabled removes sequential focus, and external description/label content may be bound with ariaDescribedBy/ariaLabelledBy; focus-visible uses a token-based outline. Theme and density: fill, border, text, and placeholder color consume only shared semantic tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes select target density. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/TextInput',
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulTextInput() {
  const [value, setValue] = useState('');
  return (
    <label className="ribbon-ui-text-input-story-field">
      Default text input
      <TextInput
        id="default-input"
        onChange={(event) => {
          setValue(event.currentTarget.value);
        }}
        value={value}
      />
    </label>
  );
}

export const Default: Story = {
  render: () => <StatefulTextInput />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    await expect(input).toHaveValue('Hello');
  },
};

export const Placeholder: Story = {
  args: { id: 'placeholder-input', placeholder: 'Search...' },
};

export const Password: Story = {
  args: { id: 'password-input', inputType: 'password', value: 'secret' },
};

export const Disabled: Story = {
  args: { disabled: true, id: 'disabled-input', value: 'Locked' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { id: 'readonly-input', readonly: true, value: 'Read only' },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-text-input-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section
            aria-label={`${themeId} text inputs`}
            className="ribbon-ui-text-input-story-theme"
          >
            <h2>{themeId}</h2>
            <div className="ribbon-ui-text-input-story-row">
              <TextInput id={`${themeId}-small`} placeholder="Small" size="small" />
              <TextInput id={`${themeId}-medium`} placeholder="Medium" />
              <TextInput id={`${themeId}-large`} placeholder="Large" size="large" />
            </div>
            <div className="ribbon-ui-text-input-story-row">
              <TextInput disabled id={`${themeId}-disabled`} placeholder="Disabled" />
              <TextInput
                id={`${themeId}-readonly`}
                placeholder="Read only"
                readonly
                value="Read only"
              />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
