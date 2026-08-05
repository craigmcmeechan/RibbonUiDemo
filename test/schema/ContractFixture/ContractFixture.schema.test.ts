import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './ContractFixture.schema.json';
import type { ContractFixtureConfig, ContractFixtureProps } from './ContractFixture.types';

const ajv = new Ajv2020({
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  strict: true,
  strictRequired: true,
  useDefaults: false,
});

describe('component schema contract toolchain', () => {
  it('compiles the Draft 2020-12 schema in strict mode', () => {
    expect(ajv.validateSchema(schema)).toBe(true);
    expect(() => ajv.compile(schema)).not.toThrow();
  });

  it('accepts supported configuration and preserves omitted defaults', () => {
    const configuration = {
      id: 'fixture-1',
      variant: 'primary',
      content: { kind: 'text', text: 'Hello' },
    } satisfies ContractFixtureConfig;
    const beforeValidation = JSON.stringify(configuration);
    const validate = ajv.compile<ContractFixtureConfig>(schema);

    expect(validate(configuration)).toBe(true);
    expect(configuration).not.toHaveProperty('label');
    expect(configuration).not.toHaveProperty('density');
    expect(JSON.stringify(configuration)).toBe(beforeValidation);
  });

  it.each([
    {
      name: 'unknown properties',
      value: {
        id: 'fixture-1',
        variant: 'primary',
        content: { kind: 'text', text: 'Hello' },
        unsupported: true,
      },
    },
    {
      name: 'invalid enums',
      value: {
        id: 'fixture-1',
        variant: 'tertiary',
        content: { kind: 'text', text: 'Hello' },
      },
    },
    {
      name: 'invalid discriminated content',
      value: {
        id: 'fixture-1',
        variant: 'primary',
        content: { kind: 'text', icon: 'save' },
      },
    },
    {
      name: 'coerced values',
      value: {
        id: 1,
        variant: 'primary',
        content: { kind: 'text', text: 'Hello' },
      },
    },
  ])('rejects $name', ({ value }) => {
    const beforeValidation = JSON.stringify(value);
    const validate = ajv.compile<ContractFixtureConfig>(schema);

    expect(validate(value)).toBe(false);
    expect(JSON.stringify(value)).toBe(beforeValidation);
  });

  it('keeps runtime callbacks outside the serializable schema type', () => {
    const configuration = {
      id: 'fixture-1',
      variant: 'secondary',
      content: { kind: 'icon', icon: 'save-item' },
      onActivate: (id: string) => id,
    } satisfies ContractFixtureProps;

    expect(configuration.onActivate(configuration.id)).toBe('fixture-1');
  });
});
