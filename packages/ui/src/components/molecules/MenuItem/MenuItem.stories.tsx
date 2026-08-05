import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider } from '../../../theme';
import { Menu } from '../Menu';
import { MenuItem } from './MenuItem';
import '../Menu/Menu.stories.css';

const meta = {
  args: { id: 'menu-item-example', label: 'Save' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Skips the item in navigation and blocks activation.',
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
    onSelect: {
      action: 'selected',
      description: 'Runtime-only activation callback; never serialized.',
      table: { category: 'Runtime' },
    },
    shortcut: {
      description: 'Serializable display-only keyboard shortcut hint.',
      table: { category: 'Schema' },
    },
  },
  component: MenuItem,
  decorators: [
    (Story) => (
      <RibbonThemeProvider themeId="modern-light">
        <Menu id="menu-item-story" label="Story menu">
          <Story />
        </Menu>
      </RibbonThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Usage: use MenuItem inside a Menu; it handles Enter/Space/click activation and requests the menu close via the Menu context. Serializable props are id, label, shortcut, and disabled; runtime props are className and onSelect. States and variants: enabled, disabled, and shortcut variants are supported; icons and checkboxes are separate concerns. Accessibility: the item has role=menuitem, tabindex managed by the Menu, aria-disabled when disabled, and a visible label that supplies the accessible name. Theme and density: hover/focus, disabled text, and shortcut text consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/MenuItem',
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { shortcut: 'Ctrl+S' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('menuitem', { name: /Save/ })).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Redo', shortcut: 'Ctrl+Y' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('menuitem', { name: /Redo/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const WithShortcut: Story = {
  args: { id: 'open', label: 'Open', shortcut: 'Ctrl+O' },
};

export const Activates: Story = {
  args: { id: 'cut', label: 'Cut' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: /Cut/ }));
    await expect(canvas.getByRole('menuitem', { name: /Cut/ })).toBeInTheDocument();
  },
};
