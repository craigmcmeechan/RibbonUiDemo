import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Spinner.schema.json';
import { getRibbonComponentSchemaCatalog, SPINNER_SCHEMA_ID } from '../../componentSchemas';
import type { SpinnerConfig, SpinnerProps } from './Spinner.types';

describe('Spinner schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<SpinnerConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Loading' } },
    { name: 'unknown properties', value: { id: 'load', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../load' } },
    { name: 'invalid sizes', value: { id: 'load', size: 'huge' } },
    { name: 'empty labels', value: { id: 'load', label: '' } },
    { name: 'coerced label values', value: { id: 'load', label: 42 } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(SPINNER_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'load' } satisfies SpinnerConfig;
    const result = catalogResult.catalog.normalize<SpinnerConfig>(SPINNER_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: SPINNER_SCHEMA_ID,
      value: { id: 'load', size: 'medium' },
    });
    expect(input).toEqual({ id: 'load' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(SPINNER_SCHEMA_ID);
  });

  it('keeps layout classes outside serialized configuration', () => {
    const props = { className: 'host-slot', id: 'load' } satisfies SpinnerProps;

    expect(props.className).toBe('host-slot');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
