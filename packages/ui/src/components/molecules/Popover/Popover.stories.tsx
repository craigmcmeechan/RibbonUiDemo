import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { screen } from '@testing-library/react';
import { useState } from 'react';

import { RibbonThemeProvider } from '../../../theme';
import { Popover } from './Popover';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import './Popover.stories.css';

const meta = {
  args: { id: 'popover-example', open: false, placement: 'bottom' },
  argTypes: {
    anchorId: {
      description:
        'Runtime-only DOM id of the anchor used for positioning, outside-click exclusion, and focus return.',
      table: { category: 'Runtime' },
    },
    ariaLabel: {
      description: 'Runtime-only accessible name overriding the default anchor association.',
      table: { category: 'Runtime' },
    },
    children: {
      description: 'Runtime-only popover content (for example a Menu); never serialized.',
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
    onClose: {
      action: 'closed',
      description:
        'Runtime-only close request raised on outside interaction, Escape, resize, or scroll.',
      table: { category: 'Runtime' },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state owned by the host.',
      table: { category: 'Runtime' },
    },
    placement: {
      control: 'inline-radio',
      description: 'Serializable vertical placement relative to the anchor. Default: bottom.',
      options: ['bottom', 'top'],
      table: { category: 'Schema', defaultValue: { summary: 'bottom' } },
    },
  },
  component: Popover,
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
          'Usage: use Popover as a positioned, dismissible floating layer that wraps content such as a Menu; a Dropdown (next) composes a trigger with this primitive. Serializable props are id and placement; runtime props are open, onClose, anchorId, children, ariaLabel, and className. States and variants: open/closed and bottom/top placement are supported; collision flipping, a trigger, and arrow elements are separate concerns. Accessibility: the layer is labelled by the anchor (aria-labelledby) unless an ariaLabel is provided, dismisses on outside pointer, Escape, resize, and scroll, and returns focus to the anchor on close; the content supplies its own semantics (for example role=menu). Theme and density: the layer surface, border, and shadow consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/Popover',
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

function PopoverDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ribbon-ui-popover-story">
      <button
        id="popover-trigger"
        onClick={() => {
          setOpen((value) => !value);
        }}
        type="button"
      >
        Toggle menu
      </button>
      <Popover
        anchorId="popover-trigger"
        id="popover-demo"
        onClose={() => {
          setOpen(false);
        }}
        open={open}
      >
        <Menu id="popover-menu" label="Actions">
          <MenuItem id="rename" label="Rename" shortcut="F2" />
          <MenuItem disabled id="delete" label="Delete" />
          <MenuItem id="duplicate" label="Duplicate" shortcut="Ctrl+D" />
        </Menu>
      </Popover>
    </div>
  );
}

export const Default: Story = {
  render: () => <PopoverDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Toggle menu'));
    await expect(
      canvasElement.ownerDocument.querySelector('[data-ribbon-ui-component="popover"]'),
    ).not.toBeNull();
    await expect(screen.getByText('Rename')).toBeInTheDocument();
  },
};

export const Closed: Story = {
  render: () => <PopoverDemo />,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.ownerDocument.querySelector('[data-ribbon-ui-component="popover"]'),
    ).toBeNull();
  },
};
