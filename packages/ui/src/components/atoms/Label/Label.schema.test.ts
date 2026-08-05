import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Label.schema.json';
import { getRibbonComponentSchemaCatalog, LABEL_SCHEMA_ID } from '../../componentSchemas';
import type { LabelConfig, LabelProps } from './Label.types';

describe('Label schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<LabelConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { text: 'Name' } },
    { name: 'missing text', value: { id: 'name-label' } },
    { name: 'unknown properties', value: { id: 'name-label', text: 'Name', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../name', text: 'Name' } },
    { name: 'invalid variants', value: { id: 'name-label', text: 'Name', variant: 'loud' } },
    { name: 'coerced text values', value: { id: 'name-label', text: 42 } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(LABEL_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'name-label', text: 'Name' } satisfies LabelConfig;
    const result = catalogResult.catalog.normalize<LabelConfig>(LABEL_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: LABEL_SCHEMA_ID,
      value: { id: 'name-label', text: 'Name', variant: 'default' },
    });
    expect(input).toEqual({ id: 'name-label', text: 'Name' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(LABEL_SCHEMA_ID);
  });

  it('keeps htmlFor and layout classes outside serialized configuration', () => {
    const props = {
      className: 'host-slot',
      htmlFor: 'name',
      id: 'name-label',
      text: 'Name',
    } satisfies LabelProps;

    expect(props.htmlFor).toBe('name');
    expect(schema.properties).not.toHaveProperty('htmlFor');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
