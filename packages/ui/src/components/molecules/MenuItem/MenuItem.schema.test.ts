import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './MenuItem.schema.json';
import { getRibbonComponentSchemaCatalog, MENU_ITEM_SCHEMA_ID } from '../../componentSchemas';
import type { MenuItemConfig, MenuItemProps } from './MenuItem.types';

describe('MenuItem schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<MenuItemConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Save' } },
    { name: 'missing labels', value: { id: 'save' } },
    { name: 'unknown properties', value: { id: 'save', label: 'Save', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../save', label: 'Save' } },
    { name: 'empty labels', value: { id: 'save', label: '' } },
    { name: 'coerced disabled values', value: { id: 'save', label: 'Save', disabled: 'true' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(MENU_ITEM_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'save', label: 'Save' } satisfies MenuItemConfig;
    const result = catalogResult.catalog.normalize<MenuItemConfig>(MENU_ITEM_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: MENU_ITEM_SCHEMA_ID,
      value: { disabled: false, id: 'save', label: 'Save' },
    });
    expect(input).toEqual({ id: 'save', label: 'Save' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(MENU_ITEM_SCHEMA_ID);
  });

  it('keeps the select callback and layout class outside serialized configuration', () => {
    const onSelect = () => undefined;
    const props = {
      className: 'host-slot',
      id: 'save',
      label: 'Save',
      onSelect,
    } satisfies MenuItemProps;

    expect(props.onSelect).toBe(onSelect);
    expect(schema.properties).not.toHaveProperty('onSelect');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
