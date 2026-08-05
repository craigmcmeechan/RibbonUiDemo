import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Slider.schema.json';
import { getRibbonComponentSchemaCatalog, SLIDER_SCHEMA_ID } from '../../componentSchemas';
import type { SliderConfig, SliderProps } from './Slider.types';

describe('Slider schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<SliderConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { value: 5 } },
    { name: 'unknown properties', value: { id: 'vol', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../vol' } },
    { name: 'invalid sizes', value: { id: 'vol', size: 'huge' } },
    { name: 'coerced value', value: { id: 'vol', value: '5' } },
    { name: 'coerced min', value: { id: 'vol', min: '0' } },
    { name: 'coerced max', value: { id: 'vol', max: false } },
    { name: 'coerced step', value: { id: 'vol', step: '1' } },
    { name: 'negative step', value: { id: 'vol', step: -1 } },
    { name: 'coerced disabled', value: { id: 'vol', disabled: 'true' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(SLIDER_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'vol' } satisfies SliderConfig;
    const result = catalogResult.catalog.normalize<SliderConfig>(SLIDER_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: SLIDER_SCHEMA_ID,
      value: { disabled: false, id: 'vol', max: 100, min: 0, size: 'medium', step: 1, value: 0 },
    });
    expect(input).toEqual({ id: 'vol' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(SLIDER_SCHEMA_ID);
  });

  it('keeps callbacks and ARIA bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'vol-help',
      ariaLabel: 'Volume',
      ariaLabelledBy: 'vol-label',
      id: 'vol',
      onChange,
    } satisfies SliderProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaLabel');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('ariaLabelledBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
