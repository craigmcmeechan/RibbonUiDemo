import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider } from '../../../theme';
import { Dropdown } from './Dropdown';
import { MenuItem } from '../MenuItem';
import './Dropdown.stories.css';

const meta = {
  args: { disabled: false, id: 'dropdown-example', label: 'Edit', placement: 'bottom' },
  argTypes: {
    ariaLabel: {
      description: 'Runtime-only accessible name overriding the trigger label.',
      table: { category: 'Runtime' },
    },
    children: {
      description: 'Runtime-only MenuItem content for the menu; never serialized.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the trigger so it cannot open the menu.',
      table: { category: 'Schema', defaultValue: { summary: 'false' } },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Required serializable trigger text and accessible name.',
      table: { category: 'Schema' },
    },
    placement: {
      control: 'inline-radio',
      description: 'Serializable vertical placement of the menu popover. Default: bottom.',
      options: ['bottom', 'top'],
      table: { category: 'Schema', defaultValue: { summary: 'bottom' } },
    },
  },
  component: Dropdown,
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
          'Usage: use Dropdown to compose a trigger button with a Popover and Menu, replacing the legacy Dropdown with an accessible contract. Serializable props are id, label, placement, and disabled; runtime props are ariaLabel, children, and className. States and variants: open/closed, bottom/top placement, and disabled are supported; split buttons, async menus, and icons are separate concerns. Accessibility: the trigger has aria-haspopup=menu and aria-expanded, controls the menu by id, toggles on click, and reclaims focus when the menu closes; the menu supplies roving-focus keyboard navigation and item activation closes the dropdown. Theme and density: the trigger consumes shared semantic control tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/Dropdown',
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown id="edit" label="Edit">
      <MenuItem id="undo" label="Undo" shortcut="Ctrl+Z" />
      <MenuItem disabled id="redo" label="Redo" shortcut="Ctrl+Y" />
      <MenuItem id="cut" label="Cut" />
    </Dropdown>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Edit/ });
    await userEvent.click(trigger);
    await expect(
      canvasElement.ownerDocument.querySelector('[data-ribbon-ui-component="menu"]'),
    ).not.toBeNull();
    await userEvent.click(
      canvasElement.ownerDocument.querySelector('[role="menuitem"]') as HTMLElement,
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /Edit/ })).toBeDisabled();
  },
};
