import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Ribbon.schema.json';
import { getRibbonComponentSchemaCatalog, RIBBON_SCHEMA_ID } from '../../componentSchemas';
import type { RibbonConfig, RibbonProps } from './Ribbon.types';

describe('Ribbon schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<RibbonConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Ribbon' } },
    { name: 'unknown properties', value: { id: 'ribbon', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../ribbon' } },
    { name: 'empty labels', value: { id: 'ribbon', label: '' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);
    expect(catalogResult.catalog.validate(RIBBON_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'ribbon' } satisfies RibbonConfig;
    const result = catalogResult.catalog.normalize<RibbonConfig>(RIBBON_SCHEMA_ID, input);
    expect(result).toEqual({ ok: true, schemaId: RIBBON_SCHEMA_ID, value: { id: 'ribbon' } });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(RIBBON_SCHEMA_ID);
  });

  it('keeps the definition and runtime callbacks outside serialized configuration', () => {
    const props = {
      activeTab: 'home',
      className: 'host-slot',
      definition: { tabs: [] },
      id: 'ribbon',
      onCommand: () => undefined,
      onSelectTab: () => undefined,
    } satisfies RibbonProps;

    expect(props.activeTab).toBe('home');
    expect(schema.properties).not.toHaveProperty('definition');
    expect(schema.properties).not.toHaveProperty('activeTab');
    expect(schema.properties).not.toHaveProperty('onSelectTab');
    expect(schema.properties).not.toHaveProperty('onCommand');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
