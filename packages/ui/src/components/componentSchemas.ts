import { createSchemaCatalog, type SchemaCatalogResult, type SchemaDefinition } from '../schema';
import buttonSchema from './atoms/Button/Button.schema.json';

export const BUTTON_SCHEMA_ID = 'urn:ribbon-ui:schema:component:button:1.0.0' as const;

const ribbonComponentSchemas: readonly SchemaDefinition[] = Object.freeze([
  Object.freeze(buttonSchema),
]);

const ribbonComponentSchemaCatalog = createSchemaCatalog(ribbonComponentSchemas);

/** Returns the shared, trusted catalog for published RibbonUI component configurations. */
export function getRibbonComponentSchemaCatalog(): SchemaCatalogResult {
  return ribbonComponentSchemaCatalog;
}
