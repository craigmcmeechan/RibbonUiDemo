import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Switch.schema.json';
import { getRibbonComponentSchemaCatalog, SWITCH_SCHEMA_ID } from '../../componentSchemas';
import type { SwitchConfig, SwitchProps } from './Switch.types';

describe('Switch schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<SwitchConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { checked: true, label: 'On' } },
    { name: 'missing labels', value: { checked: true, id: 'on' } },
    { name: 'missing checked state', value: { id: 'on', label: 'On' } },
    { name: 'unknown properties', value: { checked: true, id: 'on', label: 'On', unknown: true } },
    { name: 'invalid identifiers', value: { checked: true, id: '../on', label: 'On' } },
    { name: 'invalid sizes', value: { checked: true, id: 'on', label: 'On', size: 'huge' } },
    { name: 'coerced checked values', value: { checked: 'true', id: 'on', label: 'On' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(SWITCH_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { checked: false, id: 'on', label: 'On' } satisfies SwitchConfig;
    const result = catalogResult.catalog.normalize<SwitchConfig>(SWITCH_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: SWITCH_SCHEMA_ID,
      value: { checked: false, disabled: false, id: 'on', label: 'On', size: 'medium' },
    });
    expect(input).toEqual({ checked: false, id: 'on', label: 'On' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(SWITCH_SCHEMA_ID);
  });

  it('keeps the change callback and DOM bindings outside serialized configuration', () => {
    const onChange = () => undefined;
    const props = {
      ariaDescribedBy: 'on-help',
      checked: true,
      id: 'on',
      label: 'On',
      onChange,
    } satisfies SwitchProps;

    expect(props.onChange).toBe(onChange);
    expect(schema.properties).not.toHaveProperty('onChange');
    expect(schema.properties).not.toHaveProperty('ariaDescribedBy');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
