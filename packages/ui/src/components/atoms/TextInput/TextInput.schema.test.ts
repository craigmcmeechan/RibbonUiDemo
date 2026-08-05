import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './TextInput.schema.json';
import { getRibbonComponentSchemaCatalog, TEXT_INPUT_SCHEMA_ID } from '../../componentSchemas';
import type { TextInputConfig, TextInputProps } from './TextInput.types';

describe('TextInput schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<TextInputConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { value: 'x' } },
    { name: 'unknown properties', value: { id: 'name', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../name' } },
    { name: 'invalid sizes', value: { id: 'name', size: 'huge' } },
    { name: 'invalid input types', value: { id: 'name', inputType: 'number' } },
    { name: 'coerced value values', value: { id: 'name', value: 42 } },
    { name: 'coerced disabled values', value: { id: 'name', disabled: 'true' } },
    { name: 'coerced readonly values', value: { id: 'name', readonly: 'yes' } },
    { name: 'negative max length', value: { id: 'name', maxLength: -1 } },
    { name: 'coerced max length', value: { id: 'name', maxLength: '5' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(TEXT_INPUT_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'name' } satisfies TextInputConfig;
    const result = catalogResult.catalog.normalize<TextInputConfig>(TEXT_INPUT_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: TEXT_INPUT_SCHEMA_ID,
      value: {
        disabled: false,
        id: 'name',
        inputType: 'text',
        readonly: false,
        required: false,
        size: 'medium',
        value: '',
      },
    });
    expect(input).toEqual({ id: 'name' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(TEXT_INPUT_SCHEMA_ID);
  });

  it('keeps callbacks and ARIA bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'name-help',
      ariaLabel: 'Name',
      ariaLabelledBy: 'name-label',
      id: 'name',
      onChange,
      value: 'x',
    } satisfies TextInputProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('ariaLabelledBy');
    expect(schema.properties).not.toHaveProperty('className');
    expect(schema.properties).not.toHaveProperty('ariaLabel');
  });
});
