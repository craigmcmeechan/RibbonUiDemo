/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the accessible RibbonUI button atom.
 */
export interface ButtonConfig {
  /**
   * Stable button instance identifier.
   */
  id: string;
  /**
   * Visible text that also supplies the button's accessible name.
   */
  label: string;
  /**
   * Semantic visual emphasis of the button.
   */
  variant?: 'neutral' | 'primary';
  /**
   * Explicit button density and target size.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
}
