import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Dropdown.schema.json';
import { getRibbonComponentSchemaCatalog, DROPDOWN_SCHEMA_ID } from '../../componentSchemas';
import type { DropdownConfig, DropdownProps } from './Dropdown.types';

describe('Dropdown schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<DropdownConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Edit' } },
    { name: 'missing labels', value: { id: 'edit' } },
    { name: 'unknown properties', value: { id: 'edit', label: 'Edit', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../edit', label: 'Edit' } },
    { name: 'invalid placements', value: { id: 'edit', label: 'Edit', placement: 'left' } },
    { name: 'coerced disabled values', value: { id: 'edit', label: 'Edit', disabled: 'true' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(DROPDOWN_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'edit', label: 'Edit' } satisfies DropdownConfig;
    const result = catalogResult.catalog.normalize<DropdownConfig>(DROPDOWN_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: DROPDOWN_SCHEMA_ID,
      value: { disabled: false, id: 'edit', label: 'Edit', placement: 'bottom' },
    });
    expect(input).toEqual({ id: 'edit', label: 'Edit' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(DROPDOWN_SCHEMA_ID);
  });

  it('keeps children and DOM bindings outside serialized configuration', () => {
    const props = {
      ariaLabel: 'Edit menu',
      children: 'items',
      className: 'host-slot',
      id: 'edit',
      label: 'Edit',
    } satisfies DropdownProps;

    expect(props.children).toBe('items');
    expect(props.ariaLabel).toBe('Edit menu');
    expect(schema.properties).not.toHaveProperty('children');
    expect(schema.properties).not.toHaveProperty('ariaLabel');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
