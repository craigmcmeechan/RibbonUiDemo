import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Listbox.schema.json';
import { getRibbonComponentSchemaCatalog, LISTBOX_SCHEMA_ID } from '../../componentSchemas';
import type { ListboxConfig, ListboxProps } from './Listbox.types';

describe('Listbox schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<ListboxConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Fruits' } },
    { name: 'unknown properties', value: { id: 'fruits', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../fruits' } },
    { name: 'empty labels', value: { id: 'fruits', label: '' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);
    expect(catalogResult.catalog.validate(LISTBOX_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'fruits' } satisfies ListboxConfig;
    const result = catalogResult.catalog.normalize<ListboxConfig>(LISTBOX_SCHEMA_ID, input);
    expect(result).toEqual({ ok: true, schemaId: LISTBOX_SCHEMA_ID, value: { id: 'fruits' } });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(LISTBOX_SCHEMA_ID);
  });

  it('keeps controlled value, select, children, and DOM bindings outside serialized configuration', () => {
    const onSelect = () => undefined;
    const props = {
      ariaLabelledBy: 'fruits-label',
      children: 'options',
      className: 'host-slot',
      id: 'fruits',
      onSelect,
      value: 'apple',
    } satisfies ListboxProps;

    expect(props.onSelect).toBe(onSelect);
    expect(schema.properties).not.toHaveProperty('value');
    expect(schema.properties).not.toHaveProperty('onSelect');
    expect(schema.properties).not.toHaveProperty('children');
    expect(schema.properties).not.toHaveProperty('ariaLabelledBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
