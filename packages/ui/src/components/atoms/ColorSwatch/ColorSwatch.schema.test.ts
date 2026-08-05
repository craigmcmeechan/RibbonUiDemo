import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './ColorSwatch.schema.json';
import { getRibbonComponentSchemaCatalog, COLOR_SWATCH_SCHEMA_ID } from '../../componentSchemas';
import type { ColorSwatchConfig, ColorSwatchProps } from './ColorSwatch.types';

describe('ColorSwatch schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<ColorSwatchConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { color: '#ff0000' } },
    { name: 'missing color', value: { id: 'red' } },
    { name: 'unknown properties', value: { color: '#ff0000', id: 'red', unknown: true } },
    { name: 'invalid identifiers', value: { color: '#ff0000', id: '../red' } },
    { name: 'named colors', value: { color: 'red', id: 'red' } },
    { name: 'rgb colors', value: { color: 'rgb(255,0,0)', id: 'red' } },
    { name: 'invalid sizes', value: { color: '#ff0000', id: 'red', size: 'huge' } },
    { name: 'invalid shapes', value: { color: '#ff0000', id: 'red', shape: 'diamond' } },
    { name: 'empty labels', value: { color: '#ff0000', id: 'red', label: '' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(COLOR_SWATCH_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { color: '#ff0000', id: 'red' } satisfies ColorSwatchConfig;
    const result = catalogResult.catalog.normalize<ColorSwatchConfig>(
      COLOR_SWATCH_SCHEMA_ID,
      input,
    );

    expect(result).toEqual({
      ok: true,
      schemaId: COLOR_SWATCH_SCHEMA_ID,
      value: { color: '#ff0000', id: 'red', shape: 'square', size: 'medium' },
    });
    expect(input).toEqual({ color: '#ff0000', id: 'red' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(COLOR_SWATCH_SCHEMA_ID);
  });

  it('keeps layout classes outside serialized configuration', () => {
    const props = {
      className: 'host-slot',
      color: '#ff0000',
      id: 'red',
    } satisfies ColorSwatchProps;

    expect(props.className).toBe('host-slot');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
