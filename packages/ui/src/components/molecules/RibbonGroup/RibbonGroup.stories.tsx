import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider, type RibbonThemeId } from '../../../theme';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { ToggleButton } from '../../atoms/ToggleButton';
import { RibbonGroup } from './RibbonGroup';
import './RibbonGroup.stories.css';

const themeIds: readonly RibbonThemeId[] = ['modern-light', 'classic-light', 'modern-dark'];

const meta = {
  args: { id: 'ribbon-group-example', label: 'Clipboard' },
  argTypes: {
    children: {
      description: 'Runtime-only control content; never serialized.',
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
      description: 'Required serializable group label rendered beneath the controls.',
      table: { category: 'Schema' },
    },
  },
  component: RibbonGroup,
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
          'Usage: use RibbonGroup as a labelled container that hosts ribbon controls; the body stretches so groups share a common height (finalized in 4.2). Serializable props are id and label; runtime props are children and className. States and variants: a labelled group body is supported; the body uses flex layout for control mixes. Accessibility: the container has role=group and an aria-label, and the label is visible beneath the controls. Theme and density: the divider and label text consume shared semantic tokens, so every theme recolors consistently. Validate and normalize unknown JSON through getRibbonComponentSchemaCatalog before rendering.',
      },
    },
  },
  title: 'Components/Molecules/RibbonGroup',
} satisfies Meta<typeof RibbonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RibbonGroup id="clipboard" label="Clipboard">
      <Button id="paste" label="Paste" variant="primary" />
      <IconButton icon="save" id="save" label="Save" />
      <ToggleButton id="bold" label="Bold" pressed />
    </RibbonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Clipboard' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Paste' })).toBeInTheDocument();
  },
};

export const AllThemesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ribbon-ui-ribbon-group-story-grid">
      {themeIds.map((themeId) => (
        <RibbonThemeProvider key={themeId} themeId={themeId}>
          <RibbonGroup id={`${themeId}-clipboard`} label="Clipboard">
            <Button id={`${themeId}-paste`} label="Paste" />
            <ToggleButton id={`${themeId}-bold`} label="Bold" pressed />
          </RibbonGroup>
        </RibbonThemeProvider>
      ))}
    </div>
  ),
};
