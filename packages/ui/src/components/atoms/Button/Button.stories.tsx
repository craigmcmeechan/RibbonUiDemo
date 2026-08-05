import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider } from '../../../theme';
import { Button } from './Button';
import './Button.stories.css';

const meta = {
  args: {
    disabled: false,
    id: 'button-example',
    label: 'Button example',
    onPress: fn(),
    size: 'medium',
    variant: 'neutral',
  },
  argTypes: {
    ariaDescribedBy: {
      description:
        'Runtime-only ID of host-provided descriptive content; serialized configuration cannot bind DOM IDs.',
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
    },
    disabled: {
      control: 'boolean',
      description: 'Serializable native disabled state. Default: false.',
    },
    id: { description: 'Required serializable stable component instance identifier.' },
    label: {
      description: 'Required serializable visible text and accessible name.',
    },
    onPress: {
      control: false,
      description:
        'Runtime-only activation callback. It is never accepted from JSON configuration.',
    },
    size: {
      control: 'select',
      description: 'Serializable target-size variant. Default: medium.',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      description: 'Serializable semantic emphasis. Default: neutral.',
      options: ['neutral', 'primary'],
    },
  },
  component: Button,
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
          'Usage: use Button for a single immediate action with a concise text label; commands, menus, icon-only controls, toggles, and loading behavior are separate concerns. Serializable props are id, label, variant, size, and disabled; runtime props are ariaDescribedBy, className, and onPress. States and variants: neutral/primary, small/medium/large, hover, pressed, focus-visible, and native disabled are supported; loading and invalid-config rendering are intentionally unsupported. Accessibility: the native button supplies button semantics, visible label/accessibility name, Enter and Space activation, disabled suppression, and sequential focus behavior; focus-visible receives a token-based outline and external descriptions may be bound with ariaDescribedBy. Theme and density: all colors and states consume the shared theme variables, while size explicitly selects target density. Validate/normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Button',
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button example' });
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledOnce();
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

export const Primary: Story = {
  args: { label: 'Primary action', variant: 'primary' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Unavailable action' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Unavailable action' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const AllThemesAndStates: Story = {
  decorators: [],
  render: () => (
    <div className="button-story-matrix">
      {(['modern-light', 'classic-light', 'modern-dark'] as const).map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} button examples`} className="button-story-matrix__theme">
            <strong>{themeId}</strong>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <Button
                key={`neutral-${size}`}
                id={`${themeId}-neutral-${size}`}
                label="Neutral"
                size={size}
              />
            ))}
            <Button id={`${themeId}-primary`} label="Primary" variant="primary" />
            <Button disabled id={`${themeId}-disabled`} label="Disabled" />
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
