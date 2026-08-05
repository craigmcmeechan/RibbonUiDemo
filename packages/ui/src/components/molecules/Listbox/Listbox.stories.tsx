import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Listbox } from './Listbox';
import { Option } from '../Option';
import './Listbox.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];
const fruits = [
  { id: 'apple', label: 'Apple', value: 'apple' },
  { id: 'banana', label: 'Banana', value: 'banana' },
  { id: 'cherry', label: 'Cherry', value: 'cherry' },
];

const meta = {
  args: { id: 'listbox-example', label: 'Fruits' },
  argTypes: {
    ariaLabelledBy: {
      description: 'Runtime-only ID of host-provided labelling content.',
      table: { category: 'Runtime' },
    },
    children: {
      description: 'Runtime-only Option content; never serialized.',
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
      description: 'Serializable accessible name for the listbox.',
      table: { category: 'Schema' },
    },
    onSelect: {
      action: 'selected',
      description: 'Runtime-only selection callback requesting the next value.',
      table: { category: 'Runtime' },
    },
    value: {
      control: false,
      description: 'Controlled selected option value owned by the host.',
      table: { category: 'Runtime' },
    },
  },
  component: Listbox,
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
          'Usage: use Listbox as an accessible single-choice list with Option children; a custom-select popover composes this with a trigger later. Serializable props are id and label; runtime props are ariaLabelledBy, children, className, value, and onSelect. States and variants: the listbox owns Arrow/Home/End focus movement with selection-follows-focus; Enter/Space and click select; disabled options are skipped. Accessibility: the container has role=listbox and a label; options have role=option, aria-selected driven by the controlled value, and aria-disabled when disabled; keyboard navigation matches the WAI-ARIA listbox pattern. Theme and density: surface, border, selected, and text consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/Listbox',
} satisfies Meta<typeof Listbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulListbox() {
  const [value, setValue] = useState('apple');
  return (
    <Listbox id="fruits" label="Fruits" onSelect={setValue} value={value}>
      {fruits.map((fruit) => (
        <Option
          disabled={fruit.value === 'banana'}
          id={fruit.id}
          key={fruit.value}
          label={fruit.label}
          value={fruit.value}
        />
      ))}
    </Listbox>
  );
}

export const Default: Story = {
  render: () => <StatefulListbox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('listbox', { name: 'Fruits' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('option', { name: 'Cherry' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-listbox-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <Listbox id={`${themeId}-fruits`} label={`${themeId} fruits`} value="apple">
            {fruits.map((fruit) => (
              <Option
                disabled={fruit.value === 'banana'}
                id={`${themeId}-${fruit.id}`}
                key={fruit.value}
                label={fruit.label}
                value={fruit.value}
              />
            ))}
          </Listbox>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
