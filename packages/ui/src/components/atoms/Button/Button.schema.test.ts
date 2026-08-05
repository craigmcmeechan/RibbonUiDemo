import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Button.schema.json';
import { BUTTON_SCHEMA_ID, getRibbonComponentSchemaCatalog } from '../../componentSchemas';
import type { ButtonConfig, ButtonProps } from './Button.types';

describe('Button schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<ButtonConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing labels', value: { id: 'save' } },
    { name: 'unknown properties', value: { id: 'save', label: 'Save', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../save', label: 'Save' } },
    { name: 'invalid variants', value: { id: 'save', label: 'Save', variant: 'danger' } },
    { name: 'invalid sizes', value: { id: 'save', label: 'Save', size: 'huge' } },
    { name: 'coerced disabled values', value: { id: 'save', label: 'Save', disabled: 'true' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(BUTTON_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'save', label: 'Save' } satisfies ButtonConfig;
    const result = catalogResult.catalog.normalize<ButtonConfig>(BUTTON_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: BUTTON_SCHEMA_ID,
      value: { disabled: false, id: 'save', label: 'Save', size: 'medium', variant: 'neutral' },
    });
    expect(input).toEqual({ id: 'save', label: 'Save' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(BUTTON_SCHEMA_ID);
  });

  it('keeps callback and DOM bindings outside serialized configuration', () => {
    const onPress = () => undefined;
    const props = {
      ariaDescribedBy: 'save-help',
      id: 'save',
      label: 'Save',
      onPress,
    } satisfies ButtonProps;

    expect(props.onPress).toBe(onPress);
    expect(schema.properties).not.toHaveProperty('onPress');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
  });
});
