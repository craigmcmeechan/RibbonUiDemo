import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './RibbonControl.schema.json';
import { getRibbonComponentSchemaCatalog, RIBBON_CONTROL_SCHEMA_ID } from '../../componentSchemas';
import type { RibbonControlConfig, RibbonControlProps } from './RibbonControl.types';

describe('RibbonControl schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<RibbonControlConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: {} },
    { name: 'unknown properties', value: { id: 'rc', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../rc' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);
    expect(catalogResult.catalog.validate(RIBBON_CONTROL_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'rc' } satisfies RibbonControlConfig;
    const result = catalogResult.catalog.normalize<RibbonControlConfig>(
      RIBBON_CONTROL_SCHEMA_ID,
      input,
    );
    expect(result).toEqual({ ok: true, schemaId: RIBBON_CONTROL_SCHEMA_ID, value: { id: 'rc' } });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(RIBBON_CONTROL_SCHEMA_ID);
  });

  it('keeps the definition and runtime callbacks outside serialized configuration', () => {
    const props = {
      className: 'host-slot',
      definition: { config: {}, id: 'save', type: 'button' },
      id: 'rc',
      onCommand: () => undefined,
    } satisfies RibbonControlProps;

    expect(props.definition.id).toBe('save');
    expect(schema.properties).not.toHaveProperty('definition');
    expect(schema.properties).not.toHaveProperty('onCommand');
    expect(schema.properties).not.toHaveProperty('controlState');
    expect(schema.properties).not.toHaveProperty('onControlChange');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
