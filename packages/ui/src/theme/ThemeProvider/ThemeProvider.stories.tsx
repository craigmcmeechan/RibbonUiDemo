import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider, useRibbonTheme } from './ThemeProvider';
import './ThemeProvider.stories.css';

function ThemeContractDemo() {
  const { theme } = useRibbonTheme();
  return (
    <main className="theme-contract-demo">
      <header className="theme-contract-demo__header">
        <strong>{theme.label} application header</strong>
      </header>
      <aside className="theme-contract-demo__panel">Shared navigation or panel surface</aside>
      <section className="theme-contract-demo__content">
        Shared ribbon/content surface with <a href="#theme-guidance">accessible link text</a>.
      </section>
      <output aria-live="polite">Active theme: {theme.id}</output>
    </main>
  );
}

const meta = {
  args: {
    children: <ThemeContractDemo />,
    themeId: 'modern-light',
  },
  argTypes: {
    children: {
      control: false,
      description:
        'React content inside the shared theme boundary. All library regions below it consume the same context and CSS variables.',
    },
    className: {
      control: 'text',
      description:
        'Optional layout-integration class. It must not redefine theme values or create an isolated component theme.',
    },
    themeId: {
      control: 'select',
      description:
        'Required immutable built-in theme selection. Persistence belongs to the application host.',
      options: ['modern-light', 'classic-light', 'modern-dark'],
    },
  },
  component: RibbonThemeProvider,
  parameters: {
    docs: {
      description: {
        component:
          'Provides the single semantic token/context contract for RibbonUI components and composed workspace regions. Use one provider around an application shell; select modern light, classic light, or modern dark in host state. The provider performs no persistence and exposes no mutable token state. Consumers use `useRibbonTheme` for semantic values and the emitted `--ribbon-ui-*` variables for CSS. The hook fails explicitly outside a provider. Theme changes update nested consumers together without altering focus, keyboard behavior, or document semantics. Built-in core text/surface pairs are contrast-tested; components remain responsible for documenting and testing their own state-specific contrast and accessibility behavior.',
      },
    },
  },
  title: 'Foundation/Theme Provider',
} satisfies Meta<typeof RibbonThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModernLight: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boundary = canvas.getByRole('main').parentElement;
    await expect(boundary).toHaveAttribute('data-ribbon-ui-theme', 'modern-light');
    await expect(canvas.getByRole('status')).toHaveTextContent('Active theme: modern-light');
  },
};

export const ClassicLight: Story = {
  args: { themeId: 'classic-light' },
};

export const ModernDark: Story = {
  args: { themeId: 'modern-dark' },
};
