import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './ToggleButton.schema.json';
import { getRibbonComponentSchemaCatalog, TOGGLE_BUTTON_SCHEMA_ID } from '../../componentSchemas';
import type { ToggleButtonConfig, ToggleButtonProps } from './ToggleButton.types';

describe('ToggleButton schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<ToggleButtonConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing labels', value: { id: 'bold', pressed: true } },
    { name: 'missing pressed state', value: { id: 'bold', label: 'Bold' } },
    {
      name: 'unknown properties',
      value: { id: 'bold', label: 'Bold', pressed: true, unknown: true },
    },
    { name: 'invalid identifiers', value: { id: '../bold', label: 'Bold', pressed: true } },
    {
      name: 'invalid variants',
      value: { id: 'bold', label: 'Bold', pressed: true, variant: 'danger' },
    },
    { name: 'invalid sizes', value: { id: 'bold', label: 'Bold', pressed: true, size: 'huge' } },
    { name: 'coerced pressed values', value: { id: 'bold', label: 'Bold', pressed: 'true' } },
    {
      name: 'coerced disabled values',
      value: { id: 'bold', label: 'Bold', pressed: true, disabled: 'true' },
    },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(TOGGLE_BUTTON_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'bold', label: 'Bold', pressed: false } satisfies ToggleButtonConfig;
    const result = catalogResult.catalog.normalize<ToggleButtonConfig>(
      TOGGLE_BUTTON_SCHEMA_ID,
      input,
    );

    expect(result).toEqual({
      ok: true,
      schemaId: TOGGLE_BUTTON_SCHEMA_ID,
      value: {
        disabled: false,
        id: 'bold',
        label: 'Bold',
        pressed: false,
        size: 'medium',
        variant: 'neutral',
      },
    });
    expect(input).toEqual({ id: 'bold', label: 'Bold', pressed: false });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(TOGGLE_BUTTON_SCHEMA_ID);
  });

  it('keeps callbacks and DOM bindings outside serialized configuration', () => {
    const onPress = () => undefined;
    const props = {
      ariaDescribedBy: 'bold-help',
      id: 'bold',
      label: 'Bold',
      onPress,
      pressed: true,
    } satisfies ToggleButtonProps;

    expect(props.onPress).toBe(onPress);
    expect(schema.properties).not.toHaveProperty('onPress');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
  });
});
