import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Select.schema.json';
import { getRibbonComponentSchemaCatalog, SELECT_SCHEMA_ID } from '../../componentSchemas';
import type { SelectConfig, SelectProps } from './Select.types';

const validOptions: SelectConfig['options'] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

describe('Select schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<SelectConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { options: validOptions } },
    { name: 'missing options', value: { id: 'fruit' } },
    { name: 'empty options', value: { id: 'fruit', options: [] } },
    { name: 'option missing label', value: { id: 'fruit', options: [{ value: 'apple' }] } },
    { name: 'option missing value', value: { id: 'fruit', options: [{ label: 'Apple' }] } },
    {
      name: 'option unknown property',
      value: { id: 'fruit', options: [{ label: 'A', value: 'a', x: 1 }] },
    },
    { name: 'option empty value', value: { id: 'fruit', options: [{ label: 'A', value: '' }] } },
    { name: 'unknown properties', value: { id: 'fruit', options: validOptions, unknown: true } },
    { name: 'invalid identifiers', value: { id: '../fruit', options: validOptions } },
    { name: 'coerced value', value: { id: 'fruit', options: validOptions, value: 5 } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(SELECT_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'fruit', options: validOptions } satisfies SelectConfig;
    const result = catalogResult.catalog.normalize<SelectConfig>(SELECT_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: SELECT_SCHEMA_ID,
      value: {
        disabled: false,
        id: 'fruit',
        options: validOptions,
        required: false,
        size: 'medium',
        value: '',
      },
    });
    expect(input).toEqual({ id: 'fruit', options: validOptions });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(SELECT_SCHEMA_ID);
  });

  it('keeps callbacks and ARIA bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'fruit-help',
      ariaLabel: 'Fruit',
      ariaLabelledBy: 'fruit-label',
      id: 'fruit',
      onChange,
      options: validOptions,
    } satisfies SelectProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaLabel');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('ariaLabelledBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
