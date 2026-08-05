import { describe, expect, it } from 'vitest';

import {
  createCapabilityId,
  createCommandId,
  createWorkspaceId,
  createWorkspaceSectionId,
} from './RuntimeIds';

describe('runtime identifiers', () => {
  it.each([
    ['capability', createCapabilityId, 'crm.contacts.read'],
    ['command', createCommandId, 'contacts.open'],
    ['workspace', createWorkspaceId, 'crm'],
    ['workspace section', createWorkspaceSectionId, 'crm.products'],
  ])('creates an immutable opaque %s identifier result', (_name, createId, value) => {
    const result = createId(value);

    expect(result).toEqual({ id: value, status: 'valid' });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it.each(['', 'CRM', 'crm contacts', '.crm', 'crm.', 'crm_contacts', `a${'b'.repeat(128)}`])(
    'rejects invalid identifier %j without echoing it',
    (value) => {
      const result = createWorkspaceId(value);

      expect(result).toEqual({ reasonCode: 'runtime-id.invalid', status: 'invalid' });
      expect(JSON.stringify(result)).not.toContain(value || 'sensitive-placeholder');
      expect(Object.isFrozen(result)).toBe(true);
    },
  );
});
