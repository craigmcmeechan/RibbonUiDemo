import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Menu } from './Menu';
import { MenuItem } from '../MenuItem';
import './Menu.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { id: 'menu-example', label: 'Edit' },
  argTypes: {
    ariaLabelledBy: {
      description: 'Runtime-only ID of host-provided labelling content (for example the trigger).',
      table: { category: 'Runtime' },
    },
    children: {
      description: 'Runtime-only MenuItem content; never serialized.',
      table: { category: 'Runtime' },
    },
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    label: {
      description: 'Serializable accessible name for the menu.',
      table: { category: 'Schema' },
    },
    onClose: {
      action: 'closed',
      description: 'Runtime-only close request raised on Escape or Tab.',
      table: { category: 'Runtime' },
    },
  },
  component: Menu,
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
          'Usage: use Menu as an accessible menu container with MenuItem children; a Popover/Dropdown adds positioning, a trigger, and outside dismissal. Serializable props are id and label; runtime props are ariaLabelledBy, children, className, and onClose. States and variants: the menu owns Arrow/Home/End focus movement and Escape/Tab close; MenuItem handles Enter/Space/click activation and requests close; disabled items are skipped. Accessibility: the container has role=menu and a label; items have role=menuitem, roving focus, and aria-disabled when disabled; keyboard navigation matches the WAI-ARIA menu pattern. Theme and density: popover surface, border, shadow, and text consume shared semantic tokens, so every theme (modern-light, classic-light, modern-dark) recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/Menu',
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menu id="edit-menu" label="Edit">
      <MenuItem id="undo" label="Undo" shortcut="Ctrl+Z" />
      <MenuItem disabled id="redo" label="Redo" shortcut="Ctrl+Y" />
      <MenuItem id="cut" label="Cut" />
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = canvas.getByRole('menu', { name: 'Edit' });
    menu.focus();
    await expect(canvas.getByRole('menuitem', { name: /Undo/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-menu-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <Menu id={`${themeId}-menu`} label={`${themeId} menu`}>
            <MenuItem id={`${themeId}-new`} label="New" />
            <MenuItem id={`${themeId}-open`} label="Open" shortcut="Ctrl+O" />
            <MenuItem disabled id={`${themeId}-save`} label="Save (disabled)" />
          </Menu>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
