import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Radio.schema.json';
import { getRibbonComponentSchemaCatalog, RADIO_SCHEMA_ID } from '../../componentSchemas';
import type { RadioConfig, RadioProps } from './Radio.types';

describe('Radio schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<RadioConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { checked: true, label: 'A', name: 'g', value: 'a' } },
    { name: 'missing labels', value: { checked: true, id: 'a', name: 'g', value: 'a' } },
    { name: 'missing values', value: { checked: true, id: 'a', label: 'A', name: 'g' } },
    { name: 'missing checked state', value: { id: 'a', label: 'A', name: 'g', value: 'a' } },
    { name: 'missing names', value: { checked: true, id: 'a', label: 'A', value: 'a' } },
    {
      name: 'unknown properties',
      value: { checked: true, id: 'a', label: 'A', name: 'g', unknown: true, value: 'a' },
    },
    {
      name: 'invalid identifiers',
      value: { checked: true, id: '../a', label: 'A', name: 'g', value: 'a' },
    },
    {
      name: 'coerced checked values',
      value: { checked: 'true', id: 'a', label: 'A', name: 'g', value: 'a' },
    },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(RADIO_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = {
      checked: true,
      id: 'a',
      label: 'Option A',
      name: 'group',
      value: 'a',
    } satisfies RadioConfig;
    const result = catalogResult.catalog.normalize<RadioConfig>(RADIO_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: RADIO_SCHEMA_ID,
      value: {
        checked: true,
        disabled: false,
        id: 'a',
        label: 'Option A',
        name: 'group',
        required: false,
        value: 'a',
      },
    });
    expect(input).toEqual({ checked: true, id: 'a', label: 'Option A', name: 'group', value: 'a' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(RADIO_SCHEMA_ID);
  });

  it('keeps callbacks and DOM bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'a-help',
      checked: true,
      id: 'a',
      label: 'A',
      name: 'group',
      onChange,
      value: 'a',
    } satisfies RadioProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
