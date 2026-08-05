import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './TextArea.schema.json';
import { getRibbonComponentSchemaCatalog, TEXT_AREA_SCHEMA_ID } from '../../componentSchemas';
import type { TextAreaConfig, TextAreaProps } from './TextArea.types';

describe('TextArea schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<TextAreaConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { value: 'x' } },
    { name: 'unknown properties', value: { id: 'notes', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../notes' } },
    { name: 'invalid sizes', value: { id: 'notes', size: 'huge' } },
    { name: 'invalid resize', value: { id: 'notes', resize: 'horizontal' } },
    { name: 'coerced value values', value: { id: 'notes', value: 42 } },
    { name: 'coerced disabled values', value: { id: 'notes', disabled: 'true' } },
    { name: 'negative rows', value: { id: 'notes', rows: 0 } },
    { name: 'coerced rows', value: { id: 'notes', rows: '3' } },
    { name: 'negative max length', value: { id: 'notes', maxLength: -1 } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(TEXT_AREA_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'notes' } satisfies TextAreaConfig;
    const result = catalogResult.catalog.normalize<TextAreaConfig>(TEXT_AREA_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: TEXT_AREA_SCHEMA_ID,
      value: {
        disabled: false,
        id: 'notes',
        readonly: false,
        required: false,
        resize: 'vertical',
        rows: 3,
        size: 'medium',
        value: '',
      },
    });
    expect(input).toEqual({ id: 'notes' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(TEXT_AREA_SCHEMA_ID);
  });

  it('keeps callbacks and ARIA bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'notes-help',
      ariaLabel: 'Notes',
      ariaLabelledBy: 'notes-label',
      id: 'notes',
      onChange,
    } satisfies TextAreaProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaLabel');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('ariaLabelledBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
