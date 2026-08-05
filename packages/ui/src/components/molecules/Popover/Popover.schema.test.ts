import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './Popover.schema.json';
import { getRibbonComponentSchemaCatalog, POPOVER_SCHEMA_ID } from '../../componentSchemas';
import type { PopoverConfig, PopoverProps } from './Popover.types';

describe('Popover schema', () => {
  it('strictly compiles the closed Draft 2020-12 contract', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile<PopoverConfig>(schema)).not.toThrow();
  });

  it.each([
    { name: 'missing identifiers', value: { placement: 'bottom' } },
    { name: 'unknown properties', value: { id: 'pop', unknown: true } },
    { name: 'invalid identifiers', value: { id: '../pop' } },
    { name: 'invalid placements', value: { id: 'pop', placement: 'left' } },
  ])('rejects $name without mutating the input', ({ value }) => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const before = JSON.stringify(value);

    expect(catalogResult.catalog.validate(POPOVER_SCHEMA_ID, value).ok).toBe(false);
    expect(JSON.stringify(value)).toBe(before);
  });

  it('normalizes schema defaults into a new immutable config', () => {
    const catalogResult = getRibbonComponentSchemaCatalog();
    expect(catalogResult.ok).toBe(true);
    if (!catalogResult.ok) return;
    const input = { id: 'pop' } satisfies PopoverConfig;
    const result = catalogResult.catalog.normalize<PopoverConfig>(POPOVER_SCHEMA_ID, input);

    expect(result).toEqual({
      ok: true,
      schemaId: POPOVER_SCHEMA_ID,
      value: { id: 'pop', placement: 'bottom' },
    });
    expect(input).toEqual({ id: 'pop' });
    expect(result.ok && Object.isFrozen(result.value)).toBe(true);
    expect(catalogResult.catalog.schemaIds).toContain(POPOVER_SCHEMA_ID);
  });

  it('keeps open state, close, content, and DOM bindings outside serialized configuration', () => {
    const onClose = () => undefined;
    const props = {
      anchorId: 'trigger',
      children: 'content',
      className: 'host-slot',
      id: 'pop',
      onClose,
      open: true,
    } satisfies PopoverProps;

    expect(props.onClose).toBe(onClose);
    expect(schema.properties).not.toHaveProperty('open');
    expect(schema.properties).not.toHaveProperty('onClose');
    expect(schema.properties).not.toHaveProperty('children');
    expect(schema.properties).not.toHaveProperty('anchorId');
    expect(schema.properties).not.toHaveProperty('className');
  });
});
