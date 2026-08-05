import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Separator.schema.json';
import { getRibbonComponentSchemaCatalog, SEPARATOR_SCHEMA_ID } from '../../componentSchemas';
import type { SeparatorConfig, SeparatorProps } from './Separator.types';

describe('Separator schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<SeparatorConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: {} },
    { name: 'unknown properties', value: { id: 'sep', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../sep' } },
    { name: 'invalid orientations', value: { id: 'sep', orientation: 'diagonal' } },
    { name: 'coerced id values', value: { id: 42 } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(SEPARATOR_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'group-sep' } satisfies SeparatorConfig;
    const result = catalogResult.catalog.normalize<SeparatorConfig>(SEPARATOR_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: SEPARATOR_SCHEMA_ID,
      value: { id: 'group-sep', orientation: 'vertical' },
    });
    expect(input).toEqual({ id: 'group-sep' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(SEPARATOR_SCHEMA_ID);
  });

  it('keeps host layout classes outside serialized configuration', () => {
    const props = { className: 'host-slot', id: 'sep' } satisfies SeparatorProps;

    expect(props.className).toBe('host-slot');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
