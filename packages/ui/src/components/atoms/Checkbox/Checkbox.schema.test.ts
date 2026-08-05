import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Checkbox.schema.json';
import { getRibbonComponentSchemaCatalog, CHECKBOX_SCHEMA_ID } from '../../componentSchemas';
import type { CheckboxConfig, CheckboxProps } from './Checkbox.types';

describe('Checkbox schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<CheckboxConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { checked: true, label: 'Agree' } },
    { name: 'missing labels', value: { checked: true, id: 'agree' } },
    { name: 'missing checked state', value: { id: 'agree', label: 'Agree' } },
    {
      name: 'unknown properties',
      value: { checked: true, id: 'agree', label: 'Agree', unknown: true },
    },
    { name: 'invalid identifiers', value: { checked: true, id: '../agree', label: 'Agree' } },
    { name: 'coerced checked values', value: { checked: 'true', id: 'agree', label: 'Agree' } },
    {
      name: 'coerced disabled values',
      value: { checked: true, disabled: 'yes', id: 'agree', label: 'Agree' },
    },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(CHECKBOX_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { checked: false, id: 'agree', label: 'Agree' } satisfies CheckboxConfig;
    const result = catalogResult.catalog.normalize<CheckboxConfig>(CHECKBOX_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: CHECKBOX_SCHEMA_ID,
      value: { checked: false, disabled: false, id: 'agree', label: 'Agree', required: false },
    });
    expect(input).toEqual({ checked: false, id: 'agree', label: 'Agree' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(CHECKBOX_SCHEMA_ID);
  });

  it('keeps callbacks and DOM bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'agree-help',
      checked: true,
      id: 'agree',
      label: 'Agree',
      onChange,
    } satisfies CheckboxProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
