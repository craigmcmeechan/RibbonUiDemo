import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Switch } from './Switch';
import './Switch.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    checked: false,
    disabled: false,
    id: 'switch-example',
    label: 'Night mode',
    size: 'medium',
  },
  argTypes: {
    ariaDescribedBy: {
      description: 'Runtime-only ID of host-provided descriptive content.',
      table: { category: 'Runtime' },
    },
    checked: {
      control: 'boolean',
      description: 'Controlled on/off state owned by the host.',
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
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Required serializable visible text and accessible name.',
      table: { category: 'Schema' },
    },
    onChange: {
      action: 'changed',
      description: 'Runtime-only change callback requesting the next checked value.',
      table: { category: 'Runtime' },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable target-size variant. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
  },
  component: Switch,
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
          'Usage: use Switch for one on/off setting such as a preference; it uses role=switch semantics, distinct from ToggleButton (a button with aria-pressed) and Checkbox (a form boolean). Serializable props are id, label, checked, disabled, and size; runtime props are ariaDescribedBy, className, and onChange. Following the controlled-state precedent, checked is host-owned, so click/Enter/Space request the next value through onChange and the component never owns state. States and variants: off, on, small/medium/large sizes, and disabled are supported; the track/thumb colors flip using existing semantic tokens (accent thumb off, accent track on) so no dedicated switch tokens are needed. Accessibility: the control is a button with role=switch and aria-checked, the visible label supplies the accessible name via aria-labelledby, Enter and Space toggle, disabled removes sequential focus, and external description content may be bound with ariaDescribedBy; focus-visible uses a token-based outline. Theme and density: track, thumb, border, and label text consume only shared semantic tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes select target density. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Switch',
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulSwitch() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      checked={checked}
      id="stateful-switch"
      label="Night mode"
      onChange={(next) => {
        setChecked(next);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <StatefulSwitch />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Night mode' });
    await userEvent.click(control);
    await expect(control).toHaveAttribute('aria-checked', 'true');
  },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, id: 'disabled-switch', label: 'Unavailable' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch', { name: 'Unavailable' })).toBeDisabled();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-switch-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} switches`} className="ribbon-ui-switch-story-theme">
            <h2>{themeId}</h2>
            <Switch checked={false} id={`${themeId}-off`} label="Off" />
            <Switch checked id={`${themeId}-on`} label="On" />
            <Switch checked disabled id={`${themeId}-disabled`} label="Disabled" />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
