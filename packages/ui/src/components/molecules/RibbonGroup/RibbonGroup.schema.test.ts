import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './RibbonGroup.schema.json';
import { getRibbonComponentSchemaCatalog, RIBBON_GROUP_SCHEMA_ID } from '../../componentSchemas';
import type { RibbonGroupConfig, RibbonGroupProps } from './RibbonGroup.types';

describe('RibbonGroup schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<RibbonGroupConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Clipboard' } },
    { name: 'missing labels', value: { id: 'clipboard' } },
    { name: 'unknown properties', value: { id: 'clipboard', label: 'Clipboard', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../clipboard', label: 'Clipboard' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);
    expect(catalogResult.catalog.validate(RIBBON_GROUP_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'clipboard', label: 'Clipboard' } satisfies RibbonGroupConfig;
    const result = catalogResult.catalog.normalize<RibbonGroupConfig>(
      RIBBON_GROUP_SCHEMA_ID,
      input,
    );
    expect(result).toEqual({
      ok: true,
      schemaId: RIBBON_GROUP_SCHEMA_ID,
      value: { id: 'clipboard', label: 'Clipboard' },
    });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(RIBBON_GROUP_SCHEMA_ID);
  });

  it('keeps children and layout class outside serialized configuration', () => {
    const props = {
      children: 'controls',
      className: 'host-slot',
      id: 'clipboard',
      label: 'Clipboard',
    } satisfies RibbonGroupProps;
    expect(props.children).toBe('controls');
    expect(schema.properties).not.toHaveProperty('children');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
