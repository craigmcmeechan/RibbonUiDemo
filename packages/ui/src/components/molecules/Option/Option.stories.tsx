import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider } from '../../../theme';
import { Listbox } from '../Listbox';
import { Option } from './Option';

const meta = {
  args: { id: 'option-example', label: 'Apple', value: 'apple' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'Skips the option in navigation and blocks selection.',
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
    value: {
      description: 'Required form value submitted when this option is selected.',
      table: { category: 'Schema' },
    },
  },
  component: Option,
  decorators: [
    (Story) => (
      <RibbonThemeProvider themeId="modern-light">
        <Listbox id="option-story" label="Story listbox" value="apple">
          <Story />
        </Listbox>
      </RibbonThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Usage: use Option inside a Listbox; it reflects selection from the listbox context and requests selection on click. Serializable props are id, value, label, and disabled; the only runtime prop is className. States and variants: selected, unselected, and disabled are supported. Accessibility: the option has role=option, tabindex managed by the listbox, aria-selected driven by the controlled value, and aria-disabled when disabled. Theme and density: selected, hover/focus, disabled, and text consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/Option',
} satisfies Meta<typeof Option>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('option', { name: 'Apple' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, id: 'banana', label: 'Banana', value: 'banana' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('option', { name: 'Banana' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};
