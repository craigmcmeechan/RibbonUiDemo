import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Icon } from './Icon';
import type { IconConfig } from './Icon.types';
import './Icon.stories.css';

const iconNames: readonly IconConfig['icon'][] = [
  'save',
  'undo',
  'redo',
  'search',
  'close',
  'more',
];
const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { icon: 'save', id: 'icon-example', size: 'medium' },
  argTypes: {
    className: {
      description: 'Runtime-only host layout class; it must not redefine shared theme values.',
      table: { category: 'Runtime' },
    },
    icon: {
      control: 'select',
      description:
        'Allowlisted built-in decorative glyph; arbitrary SVG or HTML is never accepted.',
      options: iconNames,
      table: { category: 'Schema' },
    },
    id: {
      description: 'Required stable serialized instance identifier.',
      table: { category: 'Schema' },
    },
    size: {
      control: 'inline-radio',
      description: 'Serializable glyph target size. Default: medium.',
      options: ['small', 'medium', 'large'],
      table: { category: 'Schema', defaultValue: { summary: 'medium' } },
    },
  },
  component: Icon,
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
          'Usage: use Icon for one decorative allowlisted glyph inline in menus, groups, or adornments; use IconButton when the icon is the action itself, not a decoration. Serializable props are id, icon, and size; the only runtime prop is className. States and variants: small, medium, and large sizes are supported; there is no disabled, pressed, loading, or invalid-config rendering state because the icon is non-interactive and decorative. Accessibility: the glyph is hidden from assistive technology with aria-hidden, exposes no role or accessible name, and is marked focusable=false, so it adds visual structure without noise; an interactive icon must use IconButton which supplies an accessible name. Theme and density: stroke color consumes the shared semantic icon-strong token and currentColor, so every theme (modern-light, classic-light, modern-dark) recolors consistently, and explicit sizes provide 16px, 20px, and 24px glyphs. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Atoms/Icon',
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const icon = canvasElement.ownerDocument.getElementById('icon-example');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('data-icon', 'save');
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="ribbon-ui-icon-story-row">
      <Icon icon="save" id="sizes-small" size="small" />
      <Icon icon="save" id="sizes-medium" size="medium" />
      <Icon icon="save" id="sizes-large" size="large" />
    </div>
  ),
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-icon-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <section aria-label={`${themeId} icons`} className="ribbon-ui-icon-story-theme">
            <h2>{themeId}</h2>
            <div className="ribbon-ui-icon-story-row">
              {iconNames.map((icon) => (
                <Icon icon={icon} id={`${themeId}-${icon}`} key={icon} />
              ))}
            </div>
            <div className="ribbon-ui-icon-story-row">
              <Icon icon="save" id={`${themeId}-small`} size="small" />
              <Icon icon="save" id={`${themeId}-medium`} size="medium" />
              <Icon icon="save" id={`${themeId}-large`} size="large" />
            </div>
          </section>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
