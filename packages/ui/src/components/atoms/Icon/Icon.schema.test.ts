import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Icon.schema.json';
import { getRibbonComponentSchemaCatalog, ICON_SCHEMA_ID } from '../../componentSchemas';
import type { IconConfig, IconProps } from './Icon.types';

describe('Icon schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<IconConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { icon: 'save' } },
    { name: 'missing icons', value: { id: 'save' } },
    { name: 'unknown properties', value: { icon: 'save', id: 'save', unknown: true } },
    { name: 'invalid identifiers', value: { icon: 'save', id: '../save' } },
    { name: 'arbitrary icons', value: { icon: '<svg onload=alert(1)>', id: 'save' } },
    { name: 'invalid sizes', value: { icon: 'save', id: 'save', size: 'huge' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(ICON_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { icon: 'save', id: 'save' } satisfies IconConfig;
    const result = catalogResult.catalog.normalize<IconConfig>(ICON_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: ICON_SCHEMA_ID,
      value: { icon: 'save', id: 'save', size: 'medium' },
    });
    expect(input).toEqual({ icon: 'save', id: 'save' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(ICON_SCHEMA_ID);
  });

  it('keeps layout classes outside serialized configuration', () => {
    const props = { className: 'host-slot', icon: 'save', id: 'save' } satisfies IconProps;

    expect(props.className).toBe('host-slot');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
