import { createSchemaCatalog, type SchemaCatalogResult, type SchemaDefinition } from '../schema';
import badgeSchema from './atoms/Badge/Badge.schema.json';
import buttonSchema from './atoms/Button/Button.schema.json';
import iconButtonSchema from './atoms/IconButton/IconButton.schema.json';
import iconSchema from './atoms/Icon/Icon.schema.json';
import labelSchema from './atoms/Label/Label.schema.json';
import separatorSchema from './atoms/Separator/Separator.schema.json';
import toggleButtonSchema from './atoms/ToggleButton/ToggleButton.schema.json';

export const BADGE_SCHEMA_ID = 'urn:ribbon-ui:schema:component:badge:1.0.0' as const;
export const BUTTON_SCHEMA_ID = 'urn:ribbon-ui:schema:component:button:1.0.0' as const;
export const ICON_BUTTON_SCHEMA_ID = 'urn:ribbon-ui:schema:component:icon-button:1.0.0' as const;
export const ICON_SCHEMA_ID = 'urn:ribbon-ui:schema:component:icon:1.0.0' as const;
export const LABEL_SCHEMA_ID = 'urn:ribbon-ui:schema:component:label:1.0.0' as const;
export const SEPARATOR_SCHEMA_ID = 'urn:ribbon-ui:schema:component:separator:1.0.0' as const;
export const TOGGLE_BUTTON_SCHEMA_ID =
  'urn:ribbon-ui:schema:component:toggle-button:1.0.0' as const;

const ribbonComponentSchemas: readonly SchemaDefinition[] = Object.freeze([
  Object.freeze(badgeSchema),
  Object.freeze(buttonSchema),
  Object.freeze(iconButtonSchema),
  Object.freeze(iconSchema),
  Object.freeze(labelSchema),
  Object.freeze(separatorSchema),
  Object.freeze(toggleButtonSchema),
]);

const ribbonComponentSchemaCatalog = createSchemaCatalog(ribbonComponentSchemas);

/** Returns the shared, trusted catalog for published RibbonUI component configurations. */
export function getRibbonComponentSchemaCatalog(): SchemaCatalogResult {
  return ribbonComponentSchemaCatalog;
}
