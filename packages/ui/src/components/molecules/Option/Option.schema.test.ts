import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Option.schema.json';
import { getRibbonComponentSchemaCatalog, OPTION_SCHEMA_ID } from '../../componentSchemas';
import type { OptionConfig, OptionProps } from './Option.types';

describe('Option schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<OptionConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Apple', value: 'apple' } },
    { name: 'missing values', value: { id: 'apple', label: 'Apple' } },
    { name: 'missing labels', value: { id: 'apple', value: 'apple' } },
    {
      name: 'unknown properties',
      value: { id: 'apple', label: 'Apple', value: 'apple', unknown: true },
    },
    { name: 'invalid identifiers', value: { id: '../apple', label: 'Apple', value: 'apple' } },
    {
      name: 'coerced disabled values',
      value: { id: 'apple', label: 'Apple', value: 'apple', disabled: 'true' },
    },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);
    expect(catalogResult.catalog.validate(OPTION_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'apple', label: 'Apple', value: 'apple' } satisfies OptionConfig;
    const result = catalogResult.catalog.normalize<OptionConfig>(OPTION_SCHEMA_ID, input);
    expect(result).toEqual({
      ok: true,
      schemaId: OPTION_SCHEMA_ID,
      value: { disabled: false, id: 'apple', label: 'Apple', value: 'apple' },
    });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(OPTION_SCHEMA_ID);
  });

  it('keeps the layout class outside serialized configuration', () => {
    const props = {
      className: 'host-slot',
      id: 'apple',
      label: 'Apple',
      value: 'apple',
    } satisfies OptionProps;
    expect(props.className).toBe('host-slot');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
