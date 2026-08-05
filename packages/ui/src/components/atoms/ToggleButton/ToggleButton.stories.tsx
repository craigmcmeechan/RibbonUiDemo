import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { ToggleButton } from './ToggleButton';
import './ToggleButton.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    disabled: false,
    id: 'toggle-button-example',
    label: 'Bold',
    onPress: fn(),
    pressed: false,
    size: 'medium',
    variant: 'neutral',
  },
  argTypes: {
    ariaDescribedBy: {
      description:
        'Runtime-only ID of host-provided descriptive content; serialized configuration cannot bind DOM IDs.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Uses native disabled semantics and suppresses activation and sequential focus.',
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
    onPress: {
      action: 'pressed',
      description:
        'Runtime-only native button activation callback requesting the next pressed value.',
      table: { category: 'Runtime' },
    },
    pressed: {
      control: 'boolean',
      description: 'Controlled pressed state rendered as aria-pressed; the host owns the value.',
      table: { category: 'Schema' },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable target-size variant. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
    variant: {
      control: 'inline-radio',
      description: 'Serializable semantic emphasis. Default: neutral.',
      options: ['neutral', 'primary'],
      table: { category: 'Schema', defaultValue: { summary: 'neutral' } },
    },
  },
  component: ToggleButton,
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
          'Usage: use ToggleButton for one boolean pressed state with a visible text label, such as Bold or Italic; Button is preferred for one-shot actions, IconButton for icon-only actions, and toggle groups are a separate concern. Serializable props are id, label, pressed, variant, size, and disabled; runtime props are ariaDescribedBy, className, and onPress. States and variants: neutral/primary, small/medium/large, unpressed, pressed, hover, focus-visible, and native disabled are supported; the component is controlled and never owns pressed state, and invalid-config rendering is intentionally unsupported. Accessibility: the native button supplies button semantics, the visible label becomes the accessible name, aria-pressed communicates the controlled pressed state, Enter and Space activate, disabled removes sequential focus, and focus-visible uses a token-based outline. Theme and density: every color and interaction state consumes the shared theme variables, while explicit sizes select target density and pressed styling uses shared semantic tokens. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/ToggleButton',
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Bold' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const Pressed: Story = {
  args: { label: 'Bold', pressed: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const Primary: Story = {
  args: { label: 'Primary toggle', pressed: true, variant: 'primary' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Unavailable toggle', pressed: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Unavailable toggle' });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-toggle-button-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section
            aria-label={`${themeId} toggle buttons`}
            className="ribbon-ui-toggle-button-story-theme"
          >
            <h2>{themeId}</h2>
            <div className="ribbon-ui-toggle-button-story-row">
              <ToggleButton id={`${themeId}-neutral-off`} label="Neutral off" pressed={false} />
              <ToggleButton id={`${themeId}-neutral-on`} label="Neutral on" pressed />
              <ToggleButton
                id={`${themeId}-primary-off`}
                label="Primary off"
                pressed={false}
                variant="primary"
              />
              <ToggleButton
                id={`${themeId}-primary-on`}
                label="Primary on"
                pressed
                variant="primary"
              />
            </div>
            <div className="ribbon-ui-toggle-button-story-row">
              <ToggleButton id={`${themeId}-small`} label="Small" pressed size="small" />
              <ToggleButton id={`${themeId}-medium`} label="Medium" pressed />
              <ToggleButton id={`${themeId}-large`} label="Large" pressed size="large" />
              <ToggleButton disabled id={`${themeId}-disabled`} label="Disabled" pressed />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
