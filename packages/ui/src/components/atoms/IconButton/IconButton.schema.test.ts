import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import { getRibbonComponentSchemaCatalog, ICON_BUTTON_SCHEMA_ID } from '../../componentSchemas';
import schema from './IconButton.schema.json';
import type { IconButtonConfig, IconButtonProps } from './IconButton.types';

describe('IconButton schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<IconButtonConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing labels', value: { icon: 'save', id: 'save' } },
    { name: 'missing icons', value: { id: 'save', label: 'Save' } },
    {
      name: 'unknown properties',
      value: { icon: 'save', id: 'save', label: 'Save', unknown: true },
    },
    { name: 'invalid identifiers', value: { icon: 'save', id: '../save', label: 'Save' } },
    {
      name: 'arbitrary icons',
      value: { icon: '<svg onload=alert(1)>', id: 'save', label: 'Save' },
    },
    {
      name: 'invalid variants',
      value: { icon: 'save', id: 'save', label: 'Save', variant: 'danger' },
    },
    { name: 'invalid sizes', value: { icon: 'save', id: 'save', label: 'Save', size: 'huge' } },
    {
      name: 'coerced disabled values',
      value: { disabled: 'true', icon: 'save', id: 'save', label: 'Save' },
    },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(ICON_BUTTON_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { icon: 'save', id: 'save', label: 'Save' } satisfies IconButtonConfig;
    const result = catalogResult.catalog.normalize<IconButtonConfig>(ICON_BUTTON_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: ICON_BUTTON_SCHEMA_ID,
      value: {
        disabled: false,
        icon: 'save',
        id: 'save',
        label: 'Save',
        size: 'medium',
        variant: 'neutral',
      },
    });
    expect(input).toEqual({ icon: 'save', id: 'save', label: 'Save' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(ICON_BUTTON_SCHEMA_ID);
  });

  it('keeps callbacks and DOM bindings outside serialized configuration', () => {
    const onPress = () => undefined;
    const props = {
      ariaDescribedBy: 'save-help',
      icon: 'save',
      id: 'save',
      label: 'Save',
      onPress,
    } satisfies IconButtonProps;

    expect(props.onPress).toBe(onPress);
    expect(schema.properties).not.toHaveProperty('onPress');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
  });
});
