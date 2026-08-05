import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
    },
    layout: 'centered',
  },
  tags: ['autodocs', 'test'],
};

export default preview;
