import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Badge.schema.json';
import { getRibbonComponentSchemaCatalog, BADGE_SCHEMA_ID } from '../../componentSchemas';
import type { BadgeConfig, BadgeProps } from './Badge.types';

describe('Badge schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<BadgeConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'New' } },
    { name: 'missing labels', value: { id: 'count' } },
    { name: 'unknown properties', value: { id: 'count', label: 'New', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../count', label: 'New' } },
    { name: 'invalid tones', value: { id: 'count', label: 'New', tone: 'danger' } },
    { name: 'coerced label values', value: { id: 'count', label: 42 } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(BADGE_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'count', label: 'New' } satisfies BadgeConfig;
    const result = catalogResult.catalog.normalize<BadgeConfig>(BADGE_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: BADGE_SCHEMA_ID,
      value: { id: 'count', label: 'New', tone: 'neutral' },
    });
    expect(input).toEqual({ id: 'count', label: 'New' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(BADGE_SCHEMA_ID);
  });

  it('keeps layout classes outside serialized configuration', () => {
    const props = { className: 'host-slot', id: 'count', label: 'New' } satisfies BadgeProps;

    expect(props.className).toBe('host-slot');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
