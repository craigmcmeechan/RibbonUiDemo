import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { HarnessFixture } from './HarnessFixture';

const meta = {
  args: {
    initiallyActive: false,
    label: 'Verification harness',
  },
  argTypes: {
    initiallyActive: {
      control: 'boolean',
      description: 'Sets the initial pressed state for the internal test fixture.',
    },
    label: {
      control: 'text',
      description: 'Provides the accessible heading for the internal test fixture.',
    },
  },
  component: HarnessFixture,
  parameters: {
    docs: {
      description: {
        component:
          'Internal, non-public fixture that proves Storybook documentation, interaction, accessibility, and visual test wiring.',
      },
    },
  },
  title: 'Tooling/Harness Fixture',
} satisfies Meta<typeof HarnessFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Activate harness' });

    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(canvas.getByRole('button', { name: 'Deactivate harness' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('Harness is active.');
  },
};
