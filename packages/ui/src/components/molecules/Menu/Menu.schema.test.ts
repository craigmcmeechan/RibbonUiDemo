import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Menu.schema.json';
import { getRibbonComponentSchemaCatalog, MENU_SCHEMA_ID } from '../../componentSchemas';
import type { MenuConfig, MenuProps } from './Menu.types';

describe('Menu schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<MenuConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Edit' } },
    { name: 'unknown properties', value: { id: 'edit', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../edit' } },
    { name: 'empty labels', value: { id: 'edit', label: '' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(MENU_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'edit' } satisfies MenuConfig;
    const result = catalogResult.catalog.normalize<MenuConfig>(MENU_SCHEMA_ID, input);

    expect(result).toEqual({ ok: true, schemaId: MENU_SCHEMA_ID, value: { id: 'edit' } });
    expect(input).toEqual({ id: 'edit' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(MENU_SCHEMA_ID);
  });

  it('keeps children, close, and DOM bindings outside serialized configuration', () => {
    const onClose = () => undefined;
    const props = {
      ariaLabelledBy: 'edit-trigger',
      children: 'items',
      className: 'host-slot',
      id: 'edit',
      onClose,
    } satisfies MenuProps;

    expect(props.onClose).toBe(onClose);
    expect(schema.properties).not.toHaveProperty('children');
    expect(schema.properties).not.toHaveProperty('onClose');
    expect(schema.properties).not.toHaveProperty('ariaLabelledBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
