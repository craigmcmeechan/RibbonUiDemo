import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  docs: {
    defaultName: 'Documentation',
  },
  features: {
    developmentModeForBuild: true,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../{test,packages/ui/src}/**/*.stories.tsx'],
  typescript: {
    reactDocgen: 'react-docgen',
  },
};

export default config;
