import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Checkbox } from './Checkbox';
import './Checkbox.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    checked: false,
    disabled: false,
    id: 'checkbox-example',
    label: 'Subscribe',
    required: false,
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
      description: 'Serializable form field name for native form submission.',
      table: { category: 'Schema' },
    },
    onChange: {
      action: 'changed',
      description: 'Runtime-only change callback requesting the next checked value.',
      table: { category: 'Runtime' },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required for native form submission.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
  },
  component: Checkbox,
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
          'Usage: use Checkbox for one boolean checked state with a visible label; a RadioGroup molecule composes multiple radios, and indeterminate state is a separate concern. Serializable props are id, label, checked, name, disabled, and required; runtime props are ariaDescribedBy, className, and onChange. Following the ToggleButton precedent, checked is host-owned, so click/Space request the next value through onChange and the component never owns state. States and variants: unchecked, checked, disabled, and required are supported; indeterminate, groups, icons, and invalid-config rendering are separate concerns. Accessibility: the native input supplies checkbox semantics, the visible label wraps the input and supplies the accessible name, Space toggles, disabled removes sequential focus, and external description content may be bound with ariaDescribedBy; focus-within uses a token-based outline. Theme and density: the native checkbox uses the shared accent-color token and label text uses shared text tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Checkbox',
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="ribbon-ui-checkbox-story-row">
      <Checkbox checked={false} id="unchecked" label="Unchecked" />
      <Checkbox checked id="checked" label="Checked" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: 'Unchecked' })).not.toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Checked' })).toBeChecked();
  },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, id: 'disabled-box', label: 'Unavailable' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', { name: 'Unavailable' }),
    ).toBeDisabled();
  },
};

export const Interactive: Story = {
  render: () => <Checkbox checked={false} id="interactive" label="Click me" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Click me' });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeInTheDocument();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-checkbox-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} checkboxes`} className="ribbon-ui-checkbox-story-theme">
            <h2>{themeId}</h2>
            <Checkbox checked={false} id={`${themeId}-off`} label="Off" />
            <Checkbox checked id={`${themeId}-on`} label="On" />
            <Checkbox checked disabled id={`${themeId}-disabled`} label="Disabled" />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
