import {
  BUTTON_SCHEMA_ID,
  ICON_BUTTON_SCHEMA_ID,
  SEPARATOR_SCHEMA_ID,
  TOGGLE_BUTTON_SCHEMA_ID,
} from '../../packages/ui/src';
import type { RibbonDefinition } from '../../packages/ui/src';

/**
 * Editor workspace ribbon definition — re-expresses the legacy editor ribbon
 * (Home/Insert/Layout/View tabs and their groups/controls) as schema-driven
 * workspace configuration consumed by the library Ribbon. This is a parity
 * fixture for sub-step 4.4; the production editor demo is not switched yet
 * (that is Phase 7). The real workspace config moves to apps/editor-demo then.
 */
export const editorRibbonDefinition: RibbonDefinition = {
  tabs: [
    {
      id: 'home',
      label: 'Home',
      groups: [
        {
          id: 'clipboard',
          label: 'Clipboard',
          controls: [
            {
              command: 'paste',
              config: { id: 'paste', label: 'Paste', variant: 'primary' },
              id: 'paste',
              type: BUTTON_SCHEMA_ID,
            },
            {
              command: 'cut',
              config: { id: 'cut', label: 'Cut' },
              id: 'cut',
              type: BUTTON_SCHEMA_ID,
            },
            {
              command: 'copy',
              config: { id: 'copy', label: 'Copy' },
              id: 'copy',
              type: BUTTON_SCHEMA_ID,
            },
            { config: { id: 'clipboard-sep' }, id: 'clipboard-sep', type: SEPARATOR_SCHEMA_ID },
            {
              command: 'undo',
              config: { icon: 'undo', id: 'undo', label: 'Undo' },
              id: 'undo',
              type: ICON_BUTTON_SCHEMA_ID,
            },
            {
              command: 'redo',
              config: { icon: 'redo', id: 'redo', label: 'Redo' },
              id: 'redo',
              type: ICON_BUTTON_SCHEMA_ID,
            },
          ],
        },
        {
          id: 'font',
          label: 'Font',
          controls: [
            {
              command: 'bold',
              config: { id: 'bold', label: 'Bold', pressed: false },
              id: 'bold',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              command: 'italic',
              config: { id: 'italic', label: 'Italic', pressed: false },
              id: 'italic',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              command: 'underline',
              config: { id: 'underline', label: 'Underline', pressed: false },
              id: 'underline',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
          ],
        },
        {
          id: 'paragraph',
          label: 'Paragraph',
          controls: [
            {
              command: 'align-left',
              config: { id: 'align-left', label: 'Align left', pressed: true },
              id: 'align-left',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              command: 'align-center',
              config: { id: 'align-center', label: 'Align center', pressed: false },
              id: 'align-center',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              command: 'align-right',
              config: { id: 'align-right', label: 'Align right', pressed: false },
              id: 'align-right',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
          ],
        },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      groups: [
        {
          id: 'tables',
          label: 'Tables',
          controls: [
            {
              command: 'insert-table',
              config: { id: 'table', label: 'Table' },
              id: 'table',
              type: BUTTON_SCHEMA_ID,
            },
          ],
        },
        {
          id: 'images',
          label: 'Images',
          controls: [
            {
              command: 'insert-image',
              config: { id: 'image', label: 'Picture' },
              id: 'image',
              type: BUTTON_SCHEMA_ID,
            },
            {
              command: 'insert-link',
              config: { id: 'link', label: 'Link' },
              id: 'link',
              type: BUTTON_SCHEMA_ID,
            },
          ],
        },
      ],
    },
    {
      id: 'layout',
      label: 'Layout',
      groups: [
        {
          id: 'page-setup',
          label: 'Page Setup',
          controls: [
            {
              command: 'margins',
              config: { id: 'margins', label: 'Margins' },
              id: 'margins',
              type: BUTTON_SCHEMA_ID,
            },
            {
              command: 'orientation',
              config: { id: 'orientation', label: 'Orientation' },
              id: 'orientation',
              type: BUTTON_SCHEMA_ID,
            },
          ],
        },
      ],
    },
    {
      id: 'view',
      label: 'View',
      groups: [
        {
          id: 'views',
          label: 'Views',
          controls: [
            {
              command: 'print-layout',
              config: { id: 'print-layout', label: 'Print layout', pressed: true },
              id: 'print-layout',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
            {
              command: 'focus',
              config: { id: 'focus', label: 'Focus', pressed: false },
              id: 'focus',
              type: TOGGLE_BUTTON_SCHEMA_ID,
            },
          ],
        },
      ],
    },
  ],
};
