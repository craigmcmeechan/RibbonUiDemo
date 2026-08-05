import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './RibbonTab.schema.json';
import { getRibbonComponentSchemaCatalog, RIBBON_TAB_SCHEMA_ID } from '../../componentSchemas';
import type { RibbonTabConfig, RibbonTabProps } from './RibbonTab.types';

describe('RibbonTab schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<RibbonTabConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { label: 'Home' } },
    { name: 'missing labels', value: { id: 'home' } },
    { name: 'unknown properties', value: { id: 'home', label: 'Home', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../home', label: 'Home' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);
    expect(catalogResult.catalog.validate(RIBBON_TAB_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'home', label: 'Home' } satisfies RibbonTabConfig;
    const result = catalogResult.catalog.normalize<RibbonTabConfig>(RIBBON_TAB_SCHEMA_ID, input);
    expect(result).toEqual({
      ok: true,
      schemaId: RIBBON_TAB_SCHEMA_ID,
      value: { id: 'home', label: 'Home' },
    });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(RIBBON_TAB_SCHEMA_ID);
  });

  it('keeps active state, select, and DOM bindings outside serialized configuration', () => {
    const onSelect = () => undefined;
    const props = {
      active: true,
      ariaControls: 'home-panel',
      className: 'host-slot',
      id: 'home',
      label: 'Home',
      onSelect,
    } satisfies RibbonTabProps;

    expect(props.onSelect).toBe(onSelect);
    expect(schema.properties).not.toHaveProperty('active');
    expect(schema.properties).not.toHaveProperty('onSelect');
    expect(schema.properties).not.toHaveProperty('ariaControls');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
