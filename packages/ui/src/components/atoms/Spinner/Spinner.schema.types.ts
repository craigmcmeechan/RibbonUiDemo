/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the RibbonUI spinner atom.
 */
export interface SpinnerConfig {
  /**
   * Stable spinner instance identifier.
   */
  id: string;
  /**
   * Optional accessible loading message; when present the spinner becomes a role=status live region.
   */
  label?: string;
  /**
   * Explicit ring diameter.
   */
  size?: 'small' | 'medium' | 'large';
}
