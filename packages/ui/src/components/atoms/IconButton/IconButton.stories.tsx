import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { IconButton } from './IconButton';
import type { IconButtonConfig } from './IconButton.types';
import './IconButton.stories.css';

const iconNames: readonly IconButtonConfig['icon'][] = [
  'save',
  'undo',
  'redo',
  'search',
  'close',
  'more',
];
const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: {
    disabled: false,
    icon: 'save',
    id: 'icon-button-example',
    label: 'Save',
    onPress: fn(),
    size: 'medium',
    variant: 'neutral',
  },
  argTypes: {
    ariaDescribedBy: {
      description: 'Runtime-only ID of host-owned descriptive content.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not override shared theme values.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Uses native disabled semantics and suppresses activation and sequential focus.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    icon: {
      control: 'select',
      description: 'Allowlisted built-in icon name; arbitrary SVG or HTML is never accepted.',
      options: iconNames,
      table: { category: 'Schema' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Required accessible name for the icon-only control.',
      table: { category: 'Schema' },
    },
    onPress: {
      action: 'pressed',
      description: 'Runtime-only native button activation callback.',
      table: { category: 'Runtime' },
    },
    size: {
      control: 'inline-radio',
      description: 'Explicit control/icon density with 32px, 36px, and 44px square targets.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
    variant: {
      control: 'inline-radio',
      description: 'Neutral or primary semantic emphasis using only shared theme tokens.',
      options: ['neutral', 'primary'],
      table: { category: 'Schema', defaultValue: { summary: 'neutral' } },
    },
  },
  component: IconButton,
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
          'Usage: use IconButton for one immediate, familiar icon-only action when space is constrained; Button is preferred when a visible text label fits. Serializable props are id, label, icon, variant, size, and disabled; runtime props are ariaDescribedBy, className, and onPress. States and variants: neutral/primary, small/medium/large, hover, pressed, focus-visible, and native disabled are supported; menus, toggles, loading, user-provided SVG, and invalid-config rendering are separate concerns. Accessibility: label is mandatory and becomes the native button accessible name, the decorative SVG is hidden from assistive technology, Enter and Space activate, disabled removes sequential focus, and focus-visible uses a token-based outline. Theme and density: every color and interaction state consumes the shared theme variables; explicit sizes provide square 32px, 36px, and 44px targets. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/IconButton',
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save' });
    await expect(button).toBeEnabled();
    await expect(button.querySelector('[data-icon="save"]')).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const Primary: Story = {
  args: { icon: 'search', id: 'search', label: 'Search', variant: 'primary' },
};

export const Disabled: Story = {
  args: { disabled: true, icon: 'close', id: 'close', label: 'Close' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Close' })).toBeDisabled();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-icon-button-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section
            aria-label={`${themeId} icon buttons`}
            className="ribbon-ui-icon-button-story-theme"
          >
            <h2>{themeId}</h2>
            <div className="ribbon-ui-icon-button-story-row">
              {iconNames.map((icon) => (
                <IconButton icon={icon} id={`${themeId}-${icon}`} key={icon} label={icon} />
              ))}
            </div>
            <div className="ribbon-ui-icon-button-story-row">
              <IconButton icon="save" id={`${themeId}-small`} label="Small save" size="small" />
              <IconButton icon="save" id={`${themeId}-medium`} label="Medium save" />
              <IconButton icon="save" id={`${themeId}-large`} label="Large save" size="large" />
              <IconButton
                icon="save"
                id={`${themeId}-primary`}
                label="Primary save"
                variant="primary"
              />
              <IconButton disabled icon="save" id={`${themeId}-disabled`} label="Disabled save" />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
