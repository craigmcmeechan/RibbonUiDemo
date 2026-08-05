import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { TextArea } from './TextArea';
import './TextArea.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    disabled: false,
    id: 'text-area-example',
    placeholder: 'Write something',
    readonly: false,
    required: false,
    resize: 'vertical',
    rows: 3,
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
    cols: {
      control: 'number',
      description: 'Serializable visible width in average character columns.',
      table: { category: 'Schema' },
    },
    disabled: {
      control: 'boolean',
      description: 'Uses native disabled semantics and suppresses editing and focus.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    id: {
      description: 'Required stable serialized instance identifier and native textarea DOM id.',
      table: { category: 'Schema' },
    },
    maxLength: {
      control: 'number',
      description: 'Serializable maximum character count enforced by the native textarea.',
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
    resize: {
      control: 'inline-radio',
      description: 'Serializable native resize axis. Default: vertical.',
      options: ['none', 'vertical', 'both'],
      table: { category: 'Schema', defaultValue: { summary: 'vertical' } },
    },
    rows: {
      control: 'number',
      description: 'Serializable visible number of text rows. Default: 3.',
      table: { category: 'Schema', defaultValue: { summary: '3' } },
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
  component: TextArea,
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
          'Usage: use TextArea for a multi-line controlled text field; TextInput is the single-line variant. Serializable props are id, value, placeholder, name, rows, cols, size, resize, maxLength, disabled, readonly, and required; runtime props are ariaLabel, ariaDescribedBy, ariaLabelledBy, className, onChange, onFocus, and onBlur. Following the TextInput precedent, value is host-owned and the field is always controlled, so typing requests the next value through onChange. States and variants: small/medium/large sizes, none/vertical/both resize axes, rows, cols, placeholder, disabled, readonly, required, and maxLength are supported; validation UI, icons, and invalid-config rendering are separate concerns. Accessibility: the native textarea supplies textbox semantics, the id doubles as the DOM id for label association, disabled removes sequential focus, and external description/label content may be bound with ariaLabel/ariaDescribedBy/ariaLabelledBy; focus-visible uses a token-based outline. Theme and density: fill, border, text, and placeholder color consume only shared semantic tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes select target density. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/TextArea',
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulTextArea() {
  const [value, setValue] = useState('');
  return (
    <label className="ribbon-ui-text-area-story-field">
      Default text area
      <TextArea
        id="default-area"
        onChange={(event) => {
          setValue(event.currentTarget.value);
        }}
        value={value}
      />
    </label>
  );
}

export const Default: Story = {
  render: () => <StatefulTextArea />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox');
    await userEvent.type(field, 'Hello');
    await expect(field).toHaveValue('Hello');
  },
};

export const Placeholder: Story = {
  args: { id: 'placeholder-area', placeholder: 'Take notes...' },
};

export const Disabled: Story = {
  args: { disabled: true, id: 'disabled-area', value: 'Locked' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { id: 'readonly-area', readonly: true, value: 'Read only' },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-text-area-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} text areas`} className="ribbon-ui-text-area-story-theme">
            <h2>{themeId}</h2>
            <TextArea id={`${themeId}-medium`} placeholder="Medium" />
            <TextArea id={`${themeId}-large`} placeholder="Large" size="large" />
            <TextArea id={`${themeId}-no-resize`} placeholder="No resize" resize="none" />
            <TextArea disabled id={`${themeId}-disabled`} placeholder="Disabled" />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
