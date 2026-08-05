/* eslint-disable */
/** Generated from the adjacent JSON Schema. Do not edit directly. */

/**
 * Serializable configuration for the accessible RibbonUI toggle button atom.
 */
export interface ToggleButtonConfig {
  /**
   * Stable toggle button instance identifier.
   */
  id: string;
  /**
   * Visible text that also supplies the toggle button's accessible name.
   */
  label: string;
  /**
   * Controlled pressed state rendered as aria-pressed; the host owns the value.
   */
  pressed: boolean;
  /**
   * Semantic visual emphasis of the toggle button.
   */
  variant?: 'neutral' | 'primary';
  /**
   * Explicit toggle button density and target size.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether native activation and focus participation are disabled.
   */
  disabled?: boolean;
}
