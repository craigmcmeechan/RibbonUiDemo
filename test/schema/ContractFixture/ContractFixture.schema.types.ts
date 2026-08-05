/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Fixture density resolved through a local schema reference.
 */
export type Density = 'comfortable' | 'compact';

/**
 * Private fixture used to prove the component schema toolchain.
 */
export interface ContractFixtureConfig {
  /**
   * Stable fixture instance identifier.
   */
  id: string;
  /**
   * Optional display label.
   */
  label?: string;
  /**
   * Visual fixture variant.
   */
  variant: 'primary' | 'secondary';
  density?: Density;
  /**
   * Discriminated fixture content.
   */
  content:
    | {
        kind: 'text';
        text: string;
      }
    | {
        kind: 'icon';
        icon: string;
      };
}
